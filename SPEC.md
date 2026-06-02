# Quién Gana — Platform Specification

**A public-accountability platform built by Boricuas Antifascistas. Traces the colonial circuits extracting wealth from Puerto Rico.**

---

## 0. How to use this document

This is the foundational spec for the Quién Gana platform. It's written to be consumed by Claude Code (Anthropic's terminal coding agent) as the primary builder. Read this entire document before starting any phase of implementation.

**Working with this spec:**
- Section numbers are stable references. When asked to "implement section 6.3," go to that section.
- The spec is opinionated. Technical choices are made, not offered. If you encounter a decision that genuinely blocks progress and isn't covered here, stop and ask, don't invent.
- The `CLAUDE.md` file in the repo root defines conventions (naming, style, commit hygiene) — follow it always.
- Phases in section 14 are sequential. Do not skip ahead.

**For the human operator (Hector / Boricuas Antifascistas):**
- Section 15 lists decisions that require human judgment. Resolve those before the relevant phases.
- The spec assumes a single repo with the full stack (web app, ingestion jobs, admin panel). Multi-repo is overkill at this scale.

---

## 1. Project overview

### What we're building

A bilingual (Spanish/English) investigative platform that documents, in public, the colonial circuits moving wealth out of Puerto Rico. Seven circuits, each with its own data and investigation:

| # | Code name | English | Status at launch |
|---|---|---|---|
| 00 | Pensiones | The pension raid | Live |
| 01 | Colonia Fiscal | Act 60 settlers | Building |
| 02 | LUMA | Grid privatization | Building |
| 03 | La Junta | PROMESA & debt | Building |
| 04 | Contratos | Disaster contractors | Live |
| 05 | Farma | Pharma extraction | Research |
| 06 | El Desalojo | Land & displacement | Research |

Plus four cross-cutting infrastructure features:

- **El Mapa** — geographic view of all actors across all circuits
- **El Cable** — live news wire surfacing mentions of any entity in the database
- **Las Herramientas** — divestment toolkit (letter templates, model resolutions, campaign tracker)
- **Completar el Expediente** — open contribution layer for verified visitors to add documentation

### Who we serve

Three audiences, each requiring a different conversion path:
1. **The diaspora** — Puerto Ricans on the mainland who want to understand and act against extraction
2. **On-island organizers** — for whom the platform serves their existing fights, not the other way around
3. **The unwitting accomplice** — US public workers, taxpayers, patients, renters whose money or systems are implicated

### Editorial principles (non-negotiable)

1. **Public record only.** Every claim sources to documents anyone can verify. No anonymous tips presented as fact. No smears.
2. **Bilingual by default.** Spanish and English from day one. The diaspora and the island read the same page.
3. **In service, not in front.** On-island organizers and partners lead; we build tools that serve their fights.
4. **Open to contribution.** Researchers, journalists, organizers, affected families — the platform accepts moderated contributions.

---

## 2. Tech stack (decided)

Do not deviate from these choices without consulting Hector. The stack is chosen for: low operational cost, strong Claude Code familiarity, agent-friendly TypeScript, easy bilingual support, and durable Postgres-first data.

| Layer | Choice | Why |
|---|---|---|
| Framework | **Next.js 15 (App Router)** | SSR for SEO (journalists must find this on Google), server components, strong i18n support |
| Language | **TypeScript (strict)** | Type safety matters when agents are doing the building |
| Database | **Postgres 16** via **Supabase** | Managed Postgres + built-in auth + row-level security + storage |
| ORM | **Drizzle** | SQL-first, lightweight, agent-friendly. Avoid Prisma — too magic |
| Styling | **Tailwind CSS v4** | Matches existing HTML mockup; agent fluency |
| UI primitives | **shadcn/ui** | Copy-in components; we control the source |
| Forms | **React Hook Form + Zod** | Validation on both ends with shared schemas |
| i18n | **next-intl** | First-class App Router support; message catalogs as JSON |
| Job runner | **Inngest** | TypeScript-native, durable functions, generous free tier |
| Map | **MapLibre GL JS** + self-hosted tiles via **Protomaps** | No Mapbox vendor lock-in; cheaper at scale |
| News aggregation | **NewsAPI** (paid) + RSS scraper fallback | Mixed approach for cost/coverage |
| File storage | **Supabase Storage** | Documents attached to contributions |
| Auth | **Supabase Auth** | Email/magic link; OAuth optional later |
| Hosting (app) | **Vercel** | Best Next.js experience; free tier sufficient until scale |
| Hosting (jobs) | **Inngest Cloud** | No server to manage |
| Hosting (DB) | **Supabase** | Managed Postgres |
| Email | **Resend** | Simple transactional API |
| Error tracking | **Sentry** | Free tier covers this scale |
| Analytics | **Plausible** (self-hosted preferred) | No personal data; GDPR-clean; respects users |

**What we explicitly do NOT use:**
- No Google Analytics, no Facebook Pixel, no third-party trackers
- No Mapbox (vendor lock-in)
- No Firebase (data sovereignty concerns)
- No AWS Cognito or other auth (Supabase auth covers it)

---

## 3. Architecture overview

Three subsystems, one database.

```
┌─────────────────────────────────────────────────────────────┐
│                     SUPABASE POSTGRES                       │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐    │
│  │   public    │  │   staging    │  │  audit / system  │    │
│  │   tables    │  │   tables     │  │     tables       │    │
│  └─────────────┘  └──────────────┘  └──────────────────┘    │
└─────────────────────────────────────────────────────────────┘
        ▲                  ▲                       ▲
        │                  │                       │
┌───────┴──────┐  ┌────────┴──────────┐  ┌─────────┴────────┐
│   web app    │  │  ingestion jobs   │  │  admin panel     │
│  (Next.js)   │  │    (Inngest)      │  │   (Next.js,      │
│              │  │                   │  │   /admin route)  │
│  - public    │  │  - per-source     │  │                  │
│    routes    │  │    scrapers       │  │  - moderation    │
│  - intake    │  │  - API pullers    │  │    queue         │
│    form      │  │  - normalizers    │  │  - job health    │
│  - contrib   │  │                   │  │  - contribution  │
│    form      │  │  writes to        │  │    review        │
│              │  │  staging, then    │  │  - user/role     │
│  reads from  │  │  promotes to      │  │    management    │
│  public      │  │  public after     │  │                  │
│              │  │  verification     │  │                  │
└──────────────┘  └───────────────────┘  └──────────────────┘
```

**Key principle: ingestion writes to staging, verification promotes to public.**

This means:
- A broken scraper cannot corrupt live data
- A bad CAFR parse cannot publish wrong numbers
- Human moderators are always in the loop for new records
- The audit trail exists at the database level

---

## 4. Repository structure

Single repo. Monorepo-style without a monorepo tool — Next.js handles app + jobs in one codebase via Inngest's local dev support.

```
quien-gana/
├── CLAUDE.md                         # Conventions for Claude Code
├── SPEC.md                           # This file
├── README.md                         # Human-readable project intro
├── package.json
├── tsconfig.json
├── next.config.ts
├── tailwind.config.ts
├── drizzle.config.ts
├── .env.example                      # All required env vars documented
├── .env.local                        # Never committed
│
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── [locale]/                 # Bilingual routes
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx              # Platform home (the mockup)
│   │   │   ├── tesis/
│   │   │   ├── circuitos/
│   │   │   │   ├── page.tsx          # All circuits listing
│   │   │   │   ├── pensiones/
│   │   │   │   │   ├── page.tsx      # Pension deep-dive
│   │   │   │   │   └── [entity]/
│   │   │   │   │       └── page.tsx  # Individual entity record
│   │   │   │   ├── colonia-fiscal/
│   │   │   │   ├── luma/
│   │   │   │   ├── la-junta/
│   │   │   │   ├── contratos/
│   │   │   │   ├── farma/
│   │   │   │   └── desalojo/
│   │   │   ├── mapa/                 # El Mapa
│   │   │   ├── cable/                # El Cable (news wire)
│   │   │   ├── herramientas/         # Divestment toolkit
│   │   │   ├── reportar/             # Intake form
│   │   │   ├── contribuir/           # Contribution flow (auth required)
│   │   │   ├── metodologia/
│   │   │   ├── quienes-somos/        # About BA
│   │   │   └── api/                  # Public-facing API routes
│   │   │       ├── search/route.ts
│   │   │       └── intake/route.ts
│   │   │
│   │   ├── admin/                    # Internal-facing (auth required)
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx              # Dashboard
│   │   │   ├── intake/               # Intake submission moderation
│   │   │   ├── contributions/        # Contribution review queue
│   │   │   ├── circuits/             # Manage circuit data
│   │   │   ├── jobs/                 # Ingestion job health
│   │   │   ├── entities/             # Cross-circuit entity browser
│   │   │   └── users/                # Role management
│   │   │
│   │   └── api/
│   │       ├── inngest/route.ts      # Inngest webhook endpoint
│   │       └── webhooks/             # External integrations
│   │
│   ├── components/
│   │   ├── ui/                       # shadcn/ui primitives
│   │   ├── circuit/                  # Circuit-specific UI
│   │   ├── map/                      # MapLibre wrapper
│   │   ├── forms/                    # Reusable form components
│   │   ├── data/                     # Data tables, lookup grids
│   │   └── layout/                   # Header, footer, nav
│   │
│   ├── lib/
│   │   ├── db/
│   │   │   ├── client.ts             # Drizzle client
│   │   │   ├── schema.ts             # Full schema definitions
│   │   │   └── queries/              # Reusable query functions per table
│   │   ├── auth/                     # Supabase auth helpers
│   │   ├── i18n/                     # next-intl config
│   │   ├── moderation/               # Shared moderation logic
│   │   └── utils/
│   │
│   ├── jobs/                         # Inngest functions
│   │   ├── client.ts                 # Inngest client
│   │   ├── circuits/
│   │   │   ├── pensiones/
│   │   │   │   ├── pull-cafrs.ts
│   │   │   │   └── pull-sec-filings.ts
│   │   │   ├── contratos/
│   │   │   │   ├── pull-usaspending.ts
│   │   │   │   └── pull-fema.ts
│   │   │   ├── colonia-fiscal/
│   │   │   │   └── scrape-hacienda.ts
│   │   │   ├── la-junta/
│   │   │   │   ├── pull-promesa-docket.ts
│   │   │   │   └── pull-oversight-board.ts
│   │   │   ├── luma/
│   │   │   │   └── pull-energy-bureau.ts
│   │   │   ├── farma/
│   │   │   │   └── pull-fda-establishments.ts
│   │   │   └── desalojo/
│   │   │       └── pull-property-records.ts
│   │   ├── infrastructure/
│   │   │   ├── el-cable/
│   │   │   │   ├── poll-newsapi.ts
│   │   │   │   └── scrape-rss-fallback.ts
│   │   │   └── notifications/
│   │   │       └── intake-alerts.ts
│   │   └── shared/
│   │       ├── normalize-entity.ts   # Entity matching across circuits
│   │       └── promote-to-public.ts
│   │
│   ├── translations/                 # i18n message catalogs
│   │   ├── en.json
│   │   └── es.json
│   │
│   └── types/                        # Shared TS types
│       ├── circuits.ts
│       ├── entities.ts
│       └── api.ts
│
├── drizzle/                          # Drizzle-generated SQL migrations
│   └── 0000_initial.sql
│
├── scripts/                          # One-off scripts
│   ├── seed-pension-data.ts          # Seeds the In These Times pension data
│   └── backfill-entities.ts
│
├── tests/
│   ├── unit/
│   └── integration/
│
└── docs/                             # Living docs that change as platform evolves
    ├── METHODOLOGY.md
    ├── MODERATION_POLICY.md
    ├── DATA_SOURCES.md
    ├── INCIDENT_RESPONSE.md
    └── DEPLOYMENT.md
```

---

## 5. Database schema

The schema is the most consequential decision in this spec. Read carefully — agent work should match it exactly.

### Design principles

- **One `entities` table** that all circuits reference. The same hedge fund appearing in Pensiones and Colonia Fiscal is one row, joined to both circuits.
- **Staging vs. public separation** via `is_published` boolean + RLS policies (not separate tables — that fragments the model).
- **Full audit log** via `record_revisions` for every change to any published record.
- **UUIDs everywhere** for primary keys (Supabase convention; never expose serial IDs).
- **Soft delete only** (`deleted_at` timestamp) — never destructive deletes on published data.

### Tables

```sql
-- ============================================================
-- CORE: Entities (people, companies, governments, funds)
-- ============================================================
create table entities (
  id              uuid primary key default gen_random_uuid(),
  entity_type     text not null check (entity_type in (
                    'individual', 'corporation', 'hedge_fund', 'pension_fund',
                    'government_body', 'union', 'contractor', 'pharma_company',
                    'property_owner', 'other'
                  )),
  display_name    text not null,
  display_name_es text,                          -- optional Spanish name
  slug            text unique not null,           -- url-safe identifier
  description     text,
  description_es  text,
  aliases         text[] default '{}',            -- alternate names for search
  jurisdiction    text,                           -- 'US-NY', 'PR', 'CA', 'INTL', etc.
  founded_year    integer,
  external_ids    jsonb default '{}',             -- {sec_cik: '...', delaware_id: '...'}
  metadata        jsonb default '{}',
  is_published    boolean not null default false,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  created_by      uuid references auth.users(id),
  deleted_at      timestamptz
);
create index idx_entities_type on entities(entity_type) where deleted_at is null;
create index idx_entities_search on entities using gin(to_tsvector('simple', display_name || ' ' || coalesce(display_name_es, '')));
create index idx_entities_aliases on entities using gin(aliases);

-- ============================================================
-- CORE: Locations (for El Mapa)
-- ============================================================
create table locations (
  id              uuid primary key default gen_random_uuid(),
  entity_id       uuid references entities(id) on delete cascade,
  address         text,
  city            text,
  region          text,                          -- state/province
  country         text not null default 'US',
  postal_code     text,
  latitude        double precision,
  longitude       double precision,
  location_type   text,                          -- 'headquarters', 'manufacturing', 'project_site', 'residence'
  source          text,                          -- data origin
  metadata        jsonb default '{}',
  created_at      timestamptz not null default now()
);
create index idx_locations_entity on locations(entity_id);
create index idx_locations_geo on locations(latitude, longitude) where latitude is not null;

-- ============================================================
-- CIRCUIT: Pensiones — pension fund records
-- ============================================================
create table pension_investments (
  id                  uuid primary key default gen_random_uuid(),
  pension_fund_id     uuid not null references entities(id),
  hedge_fund_id       uuid not null references entities(id),
  amount_usd          bigint,                    -- stored as cents to avoid float issues
  amount_display      text,                      -- '$600M' for display
  fund_name           text,                      -- the specific LP fund name
  data_window_start   date,
  data_window_end     date,
  source_url          text not null,
  source_description  text not null,
  notes               text,
  is_published        boolean not null default false,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  deleted_at          timestamptz
);
create index idx_pension_investments_pension on pension_investments(pension_fund_id);
create index idx_pension_investments_hedge on pension_investments(hedge_fund_id);

create table ers_bond_claims (
  id                  uuid primary key default gen_random_uuid(),
  hedge_fund_id       uuid not null references entities(id),
  claimed_amount_usd  bigint,
  claimed_amount_display text,
  shell_entity        text,                      -- 'SV Credit', 'Ocher Rose', etc.
  filing_date         date,
  docket_reference    text,                      -- PROMESA docket reference
  source_url          text not null,
  is_published        boolean not null default false,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- ============================================================
-- CIRCUIT: Colonia Fiscal — Act 60 beneficiaries
-- ============================================================
create table act60_decrees (
  id                  uuid primary key default gen_random_uuid(),
  beneficiary_id      uuid not null references entities(id),
  decree_type         text not null check (decree_type in ('act_22', 'act_20', 'act_60_individual', 'act_60_export', 'act_60_other')),
  decree_number       text,
  granted_date        date,
  expiration_date     date,
  prior_residence     text,                      -- where they relocated from
  reported_business   text,
  source_url          text not null,
  hacienda_pull_date  date not null,             -- when we ingested this
  is_published        boolean not null default false,
  metadata            jsonb default '{}',
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);
create index idx_act60_beneficiary on act60_decrees(beneficiary_id);

-- ============================================================
-- CIRCUIT: LUMA — energy grid
-- ============================================================
create table luma_records (
  id                  uuid primary key default gen_random_uuid(),
  record_type         text not null check (record_type in ('contract_term', 'outage_event', 'executive_comp', 'rate_change', 'public_filing')),
  title               text not null,
  title_es            text,
  description         text,
  description_es      text,
  event_date          date,
  related_entity_id   uuid references entities(id),
  source_url          text not null,
  is_published        boolean not null default false,
  metadata            jsonb default '{}',
  created_at          timestamptz not null default now()
);

-- ============================================================
-- CIRCUIT: La Junta — PROMESA & debt
-- ============================================================
create table promesa_filings (
  id                  uuid primary key default gen_random_uuid(),
  docket_id           text not null,
  filing_date         date not null,
  filing_type         text,
  title               text not null,
  filed_by_entity_id  uuid references entities(id),
  summary             text,
  summary_es          text,
  source_url          text not null,
  pdf_url             text,
  is_published        boolean not null default false,
  created_at          timestamptz not null default now()
);
create index idx_promesa_docket on promesa_filings(docket_id);

create table pr_revenue_allocation (
  id                  uuid primary key default gen_random_uuid(),
  fiscal_period       text not null,             -- '2025-Q1', '2025-01'
  category            text not null,             -- 'debt_service', 'education', 'healthcare', etc.
  amount_usd          bigint not null,
  source_url          text not null,
  is_published        boolean not null default false,
  created_at          timestamptz not null default now()
);

-- ============================================================
-- CIRCUIT: Contratos — disaster contractors
-- ============================================================
create table federal_contracts (
  id                      uuid primary key default gen_random_uuid(),
  contract_id             text not null unique,   -- USASpending unique ID
  contractor_id           uuid not null references entities(id),
  awarding_agency         text,
  award_type              text,                   -- 'disaster_relief', 'reconstruction', etc.
  obligated_amount_usd    bigint,
  current_amount_usd      bigint,
  award_date              date,
  period_of_performance_start date,
  period_of_performance_end date,
  place_of_performance    text,
  description             text,
  related_disaster        text,                   -- 'maria', 'fiona', 'earthquakes_2020'
  source_url              text not null,
  raw_data                jsonb,                  -- full USASpending response
  is_published            boolean not null default false,
  created_at              timestamptz not null default now()
);
create index idx_contracts_contractor on federal_contracts(contractor_id);
create index idx_contracts_disaster on federal_contracts(related_disaster);

-- ============================================================
-- CIRCUIT: Farma — pharmaceutical extraction
-- ============================================================
create table drug_manufacturing (
  id                  uuid primary key default gen_random_uuid(),
  drug_name           text not null,
  drug_generic_name   text,
  manufacturer_id     uuid not null references entities(id),
  facility_name       text,
  facility_location_id uuid references locations(id),
  fda_establishment_id text,
  source_url          text not null,
  is_published        boolean not null default false,
  created_at          timestamptz not null default now()
);

-- ============================================================
-- CIRCUIT: El Desalojo — land & displacement
-- ============================================================
create table property_records (
  id                  uuid primary key default gen_random_uuid(),
  owner_id            uuid not null references entities(id),
  property_address    text not null,
  municipality        text not null,
  property_type       text,                       -- 'residential', 'commercial', 'mixed_use'
  is_short_term_rental boolean default false,
  acquired_date       date,
  acquired_amount_usd bigint,
  location_id         uuid references locations(id),
  source_url          text not null,
  is_published        boolean not null default false,
  created_at          timestamptz not null default now()
);

-- ============================================================
-- INFRASTRUCTURE: El Cable (news wire)
-- ============================================================
create table news_articles (
  id                  uuid primary key default gen_random_uuid(),
  url                 text not null unique,
  title               text not null,
  source              text not null,             -- publication name
  published_at        timestamptz not null,
  language            text not null check (language in ('en', 'es', 'other')),
  summary             text,
  full_text           text,
  pulled_at           timestamptz not null default now(),
  created_at          timestamptz not null default now()
);
create index idx_articles_published on news_articles(published_at desc);

create table news_article_mentions (
  article_id          uuid not null references news_articles(id) on delete cascade,
  entity_id           uuid not null references entities(id) on delete cascade,
  confidence          numeric(3,2),              -- match confidence 0.00–1.00
  context_excerpt     text,
  created_at          timestamptz not null default now(),
  primary key (article_id, entity_id)
);

-- ============================================================
-- INFRASTRUCTURE: Las Herramientas (divestment toolkit)
-- ============================================================
create table campaign_resources (
  id                  uuid primary key default gen_random_uuid(),
  resource_type       text not null check (resource_type in ('letter_template', 'model_resolution', 'fact_sheet', 'guide', 'tracker_entry')),
  title               text not null,
  title_es            text,
  body                text not null,
  body_es             text,
  target_audience     text,                       -- 'union_member', 'pension_trustee', 'state_legislator'
  related_circuit     text,                       -- 'pensiones', 'colonia_fiscal', etc.
  related_entity_id   uuid references entities(id),
  download_url        text,                       -- if PDF/docx
  is_published        boolean not null default false,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create table divestment_campaigns (
  id                  uuid primary key default gen_random_uuid(),
  target_entity_id    uuid not null references entities(id),
  campaign_name       text not null,
  status              text not null check (status in ('active', 'won', 'lost', 'paused')),
  started_at          date,
  resolved_at         date,
  outcome_description text,
  led_by              text,                       -- coalition or org name
  source_url          text,
  is_published        boolean not null default false,
  created_at          timestamptz not null default now()
);

-- ============================================================
-- INFRASTRUCTURE: Completar el Expediente (contributions)
-- ============================================================
create table contributions (
  id                  uuid primary key default gen_random_uuid(),
  contributor_id      uuid references auth.users(id), -- null = anonymous
  target_table        text not null,             -- which table this contribution attaches to
  target_id           uuid not null,             -- the record's UUID
  contribution_type   text not null check (contribution_type in ('correction', 'addition', 'document', 'testimony', 'clarification')),
  content             text not null,
  attachments         jsonb default '[]',         -- array of {url, type, filename}
  status              text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'flagged_legal')),
  moderator_id        uuid references auth.users(id),
  moderator_notes     text,
  resolved_at         timestamptz,
  visibility          text not null default 'public' check (visibility in ('public', 'internal_only', 'attributed', 'anonymous')),
  contributor_display_name text,                  -- override for display
  ip_hash             text,                       -- hashed for abuse prevention; never plain
  created_at          timestamptz not null default now()
);
create index idx_contributions_target on contributions(target_table, target_id);
create index idx_contributions_status on contributions(status) where status = 'pending';

-- ============================================================
-- INTAKE: reports from the public via the form
-- ============================================================
create table intake_submissions (
  id                  uuid primary key default gen_random_uuid(),
  submitter_name      text,                       -- can be alias
  submitter_contact   text not null,              -- email or signal
  submitter_role      text,
  related_circuit     text,
  message             text not null,
  state_or_fund       text,
  attachments         jsonb default '[]',
  status              text not null default 'new' check (status in ('new', 'reviewing', 'contacted', 'archived', 'spam')),
  assigned_to         uuid references auth.users(id),
  internal_notes      text,
  contact_made_at     timestamptz,
  created_at          timestamptz not null default now()
);
create index idx_intake_status on intake_submissions(status) where status in ('new', 'reviewing');

-- ============================================================
-- AUDIT & SYSTEM
-- ============================================================
create table record_revisions (
  id                  uuid primary key default gen_random_uuid(),
  table_name          text not null,
  record_id           uuid not null,
  changed_by          uuid references auth.users(id),
  change_type         text not null check (change_type in ('create', 'update', 'publish', 'unpublish', 'soft_delete')),
  diff                jsonb,                      -- before/after snapshot
  reason              text,
  created_at          timestamptz not null default now()
);
create index idx_revisions_record on record_revisions(table_name, record_id);

create table job_runs (
  id                  uuid primary key default gen_random_uuid(),
  job_name            text not null,
  status              text not null check (status in ('running', 'success', 'failure', 'partial')),
  records_processed   integer default 0,
  records_created     integer default 0,
  records_updated     integer default 0,
  error_message       text,
  started_at          timestamptz not null,
  completed_at        timestamptz,
  metadata            jsonb default '{}'
);
create index idx_job_runs_recent on job_runs(job_name, started_at desc);

-- ============================================================
-- USERS & ROLES (extends Supabase auth.users)
-- ============================================================
create table user_profiles (
  user_id             uuid primary key references auth.users(id) on delete cascade,
  display_name        text,
  role                text not null default 'contributor' check (role in ('contributor', 'moderator', 'admin', 'partner_org')),
  organization        text,
  bio                 text,
  contributions_approved integer default 0,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);
```

### Row-level security (RLS) policies

Supabase RLS enforces access control at the database layer. Required policies:

- **Public read** on all `is_published = true` rows in circuit tables, entities, locations, news_articles, campaign_resources, divestment_campaigns
- **No anonymous write** on any circuit tables (only via authenticated server-side code)
- **Contributor write** on `contributions` (creating only; no edits after submit)
- **Moderator full access** to staging rows (where `is_published = false`) and to the moderation actions on contributions and intake_submissions
- **Admin full access** to all tables

Detailed policy SQL goes in `drizzle/0001_rls_policies.sql` — implement in Phase 1.

---

## 6. Authentication & authorization

### User roles

| Role | Capabilities |
|---|---|
| **anon** | Read all published content. Submit intake form. Submit contributions only after creating account. |
| **contributor** | Everything anon can do, plus: submit contributions, edit own contributions before approval, view own contribution history. |
| **partner_org** | Contributor + can attribute contributions to their org, faster review queue. |
| **moderator** | All above + access to `/admin/intake` and `/admin/contributions`, approve/reject contributions, mark intake as contacted. |
| **admin** | Everything. Can edit any record, manage circuits, run jobs manually, manage users. Reserved for BA core team. |

### Auth flow

- Magic link email (Supabase default). No passwords.
- Contributors must verify email before first contribution.
- Moderator/admin role assignment is manual (admin-only via `/admin/users`).
- Sessions: 30-day JWT; rotate on suspicious activity.

### Sensitive operations require re-auth

Re-prompt for magic link confirmation before:
- Approving a contribution that names an individual
- Bulk publishing records
- Deleting any record
- Changing user roles

---

## 7. Design system

The HTML mockup at `/mnt/user-data/outputs/quien_gana_platform.html` is the canonical design reference. Match its aesthetic. The system below is the systematized version of that mockup.

### Colors (Puerto Rico independence flag — celeste palette)

```css
:root {
  /* Primary palette */
  --celeste: #6BAACF;
  --celeste-deep: #4A8FB8;
  --celeste-pale: #DCECF5;
  --celeste-mist: #EFF6FA;

  --rojo: #CE2029;
  --rojo-deep: #9A1620;
  --rojo-pale: #F8E2E4;

  --cream: #FAF7EF;
  --cream-deep: #F3EEE2;

  --ink: #0F1419;
  --ink-muted: rgba(15, 20, 25, 0.62);
  --ink-faint: rgba(15, 20, 25, 0.4);
  --ink-line: rgba(15, 20, 25, 0.12);
  --ink-line-strong: rgba(15, 20, 25, 0.22);
}
```

### Typography

```css
--font-display: 'Fraunces', Georgia, serif;       /* Headlines */
--font-body: 'Manrope', -apple-system, sans-serif; /* Body */
--font-mono: 'JetBrains Mono', monospace;          /* Data labels, eyebrows */
```

Load via Google Fonts in `app/layout.tsx`. Use `next/font` for proper loading.

### Type scale

- Hero: clamp(48px, 6.5vw, 88px), weight 500, letter-spacing -0.04em, line-height 0.98
- Section title (h2): clamp(36px, 4.5vw, 56px), weight 500, letter-spacing -0.03em
- Card title: 24-26px, weight 500
- Body: 16px, line-height 1.65
- Mono labels: 11px, uppercase, letter-spacing 0.14em-0.18em

### Italics carry political voice

Headlines use italic Fraunces in either celeste-deep or rojo for emphasized words. This is the publication's voice and should be preserved across new pages.

### Components to build (Phase 1)

- `<FlagBar />` — top 6px stripe pattern
- `<Header />` — sticky nav with brand + lang toggle
- `<Eyebrow />` — section label with mono font + accent line
- `<SectionHead />` — eyebrow + title + intro + optional sidebar text
- `<CircuitCard />` — the card from the mockup
- `<LookupGrid />` — searchable entity grid
- `<IntakeForm />` — the main form
- `<FederalBlock />` — the dark callout block
- `<Footer />`

All components fully typed, accept bilingual props (or pull from next-intl).

### Aesthetic constraints (do not violate)

- No drop shadows
- No gradients except the brief radial blur on hero (filter: blur)
- Border radius: 2px (most things), 4px (cards)
- All cards have 0.5px or 1px borders, never thicker except 2px accent on featured
- No bold sans-serif headlines — use Fraunces, weight 500-600
- No emoji in UI

---

## 8. Bilingualization (i18n)

### Approach

- **next-intl** with `[locale]` segment in App Router
- Default locale: `es` (Spanish leads, English follows — political statement)
- Supported locales: `es`, `en`
- Messages in `src/translations/{en,es}.json`
- All user-facing strings go through `useTranslations()`
- No hard-coded text in components

### Locale routing

```
/             → redirect to /es
/es           → Spanish home
/en           → English home
/es/circuitos → Spanish circuits page
/en/circuitos → English circuits page (URL slug stays Spanish for political reasons)
```

URL slugs remain in Spanish (`/circuitos`, `/pensiones`, `/colonia-fiscal`) in both locales. This is deliberate — the project's identity is rooted in the Spanish names.

### Translation workflow

1. Developers add English keys to `en.json`
2. `npm run translate:check` flags missing keys in `es.json`
3. Translations done by humans (initial draft can use Claude as a helper, but BA reviews before merge)
4. The Spanish copy in the HTML mockup is a starting draft and needs human review by a native Puerto Rican speaker before public launch

### Database content bilingualization

Tables with user-facing content have `_es` columns alongside the default. The default column should be Spanish when natural (e.g., `display_name = "El asalto de pensiones"`, `display_name_es = null` if redundant, but `display_name_en = "The pension raid"` when needed). Reconsider this convention if it becomes confusing — pragmatic > principled.

---

## 9. Circuits — data specifications

For each circuit: what data we have, where it lives, refresh cadence, status at launch.

### 9.0 — Pensiones (Live at launch)

**Source data:** Already collected. See Appendix A for the full seed data from the In These Times 2018 investigation. Run `npm run seed:pensiones` after schema is up.

**Ongoing refresh:**
- Job: `jobs/circuits/pensiones/pull-cafrs.ts` — annual, runs each March (fiscal year crossover). Pulls latest CAFRs from the 9 named state pension systems, extracts LP holdings tables, attempts to match to hedge funds in our entity table.
- Job: `jobs/circuits/pensiones/pull-sec-filings.ts` — quarterly. Pulls 13F filings for the named hedge funds.

**Data quality flag:** The 2018 figures reflect the bankruptcy period. Display a clear "data window" indicator on every record. Updating to current state requires reading 2024-2025 CAFRs, which the job above does.

**Display:** Lookup interface from the mockup. Entity detail pages at `/circuitos/pensiones/[entity-slug]`.

### 9.1 — Colonia Fiscal (Building → Live in Phase 4)

**Source data:** Hacienda decree registry. Public but not API-accessible. Historically published as PDFs or web pages with limited filtering.

**Ongoing refresh:**
- Job: `jobs/circuits/colonia-fiscal/scrape-hacienda.ts` — monthly. Scrapes the public decree registry, parses entries, dedupes against existing, creates new entity records for new beneficiaries.
- Fallback: manual PDF upload via admin if the scraper breaks (which it will).

**Verification requirement:** Every new beneficiary record goes to moderation queue before publication. Critical given the legal sensitivity of naming individuals.

**Cross-reference:** Many Act 60 beneficiaries also appear as property buyers (El Desalojo). The entity-matching job should surface these.

### 9.2 — LUMA (Building → Live in Phase 5)

**Source data:** Mixed.
- PR Energy Bureau filings (scraping required)
- LUMA's own public reports (PDF, irregular)
- News coverage (via El Cable)
- Public records requests for redacted contract sections

**Ongoing refresh:**
- Job: `jobs/circuits/luma/pull-energy-bureau.ts` — weekly. Outage reports.
- Manual entry for executive comp updates (annual when 10-Ks for parent companies drop).

**Initial deliverable:** Static content page summarizing the contract, executive comp, and outage history, with intake form for affected residents.

### 9.3 — La Junta (Building → Live in Phase 4)

**Source data:**
- PACER (PROMESA Title III docket) — has an API but charges $0.10/page; budget for this
- Fiscal Oversight Board's published documents — scrapable
- Hacienda public revenue data — partially API'd

**Ongoing refresh:**
- Job: `jobs/circuits/la-junta/pull-promesa-docket.ts` — daily. Watches docket for new filings.
- Job: `jobs/circuits/la-junta/pull-oversight-board.ts` — weekly. Scrapes oversight board document releases.

**Live dashboard goal:** A "where did this month's tax revenue go" view comparing debt service vs. public services. Build in Phase 5 once data flow is stable.

### 9.4 — Contratos (Live at launch — easiest pipeline)

**Source data:**
- USASpending.gov API — clean JSON, generous rate limits
- OpenFEMA — supplementary disaster data

**Ongoing refresh:**
- Job: `jobs/circuits/contratos/pull-usaspending.ts` — weekly. Pulls all federal contracts with place-of-performance = PR.
- Job: `jobs/circuits/contratos/pull-fema.ts` — weekly. FEMA-specific disaster funds.

**Initial scope:** Maria, Fiona, and the 2020 earthquake recoveries. Filter by date and disaster code.

**This is the cleanest pipeline. Build it second in Phase 2 to validate the architecture works end-to-end.**

### 9.5 — Farma (Research → Live in Phase 6)

**Source data:**
- FDA Drug Establishment registrations — public, partially API'd
- SEC 10-K filings for major pharma — annual, parseable

**Ongoing refresh:**
- Job: `jobs/circuits/farma/pull-fda-establishments.ts` — annual.

**Initial deliverable:** "Look up your drug" feature — type a brand or generic name, see if it's made in PR and by whom.

### 9.6 — El Desalojo (Research → Live in Phase 6)

**Source data:**
- Registro de la Propiedad — partially digital, varies by municipality
- AirDNA (paid subscription required) — short-term rental data
- Crowdsourced testimony via intake and contributions

**Ongoing refresh:**
- Job: `jobs/circuits/desalojo/pull-property-records.ts` — quarterly. Where digital records exist.
- Heavy reliance on contributions and on-island partners.

**Sensitive circuit.** Strict moderation. Decisions about naming individual buyers require admin review.

---

## 10. Infrastructure features

### El Mapa

- MapLibre GL JS map component
- Self-hosted Protomaps tiles (set up in Phase 3)
- Layer toggles: each circuit is its own layer
- Filters: by date range, by entity type, by amount thresholds
- Click marker → entity detail page
- Clustering at low zoom

Single-page route: `/[locale]/mapa`. Initial bounding box: Puerto Rico + continental US East Coast.

### El Cable

- News article ingestion via NewsAPI (paid) + RSS scrapers as fallback
- Job: `jobs/infrastructure/el-cable/poll-newsapi.ts` — hourly. Queries for entity names in our database.
- Entity matching: simple substring + alias matching first; upgrade to embedding-based matching if needed
- Each article → `news_articles` + zero or more `news_article_mentions`
- Public route: `/[locale]/cable` — chronological feed, filterable by circuit and entity
- Each entity page has a "Recent coverage" section pulling its mentions

### Las Herramientas

- Mostly content. Markdown-stored in `campaign_resources` table.
- Templates rendered via MDX in `/[locale]/herramientas/[slug]`
- Templates support variable substitution (e.g., `{{pension_fund_name}}`) for personalization
- Campaign tracker is just a filterable list view of `divestment_campaigns` rows

### Completar el Expediente

- Auth required (contributor role minimum)
- Every entity page and circuit record has a "Contribuir" button
- Submission form: type (correction/addition/document/testimony/clarification), content, optional file attachment
- Submissions go to `contributions` table, status='pending'
- Moderation in `/admin/contributions`
- Approved contributions appear on the public record with attribution (or anonymous if requested)

---

## 11. Moderation & admin

### The moderation queue (`/admin/intake` and `/admin/contributions`)

Both moderation surfaces share a similar UI:

- List of pending items, oldest first
- Each item: full content, submitter info (where applicable), suggested actions
- Bulk actions: approve, reject, flag for legal review, archive
- Notes field for internal context
- Audit log of all moderator actions

### Intake-specific workflow

When a new intake submission arrives:
1. Email notification to all moderators (Resend)
2. Submission appears in queue with status 'new'
3. Moderator reviews and either:
   - Marks 'contacted' (after personal outreach)
   - Archives if spam/irrelevant
   - Escalates to admin if sensitive (e.g., legal threats, urgent safety concerns)
4. Audit log captures every action

### Contribution-specific workflow

When a new contribution arrives:
1. Email notification (same as above)
2. Moderator reviews content + attachments
3. Approve → contribution becomes visible on target record
4. Reject → contributor notified with reason
5. Flag legal → routed to admin
6. Each approved contribution increments contributor's `contributions_approved` counter

### Editorial guidelines for moderation

Document in `docs/MODERATION_POLICY.md` — but the spec-level principles:

- **Publish facts, not feelings.** "X is a slumlord" is opinion; "X's LLC is named on 8 code violations" with source link is fact.
- **Verify before publishing.** Especially for entries that name individuals.
- **Default to attribution unless requested otherwise.** Anonymity is granted on request, not as default.
- **Legal review threshold.** Any contribution that names a private individual, alleges criminal conduct, or relates to active litigation goes to admin review, not moderator approval.

---

## 12. Security & privacy

### Non-negotiable practices

- All traffic over TLS (Vercel handles this)
- Database connections via Supabase pooler with SSL required
- No production credentials in code; all in environment variables
- `.env.local` and any `.env.*.local` files in `.gitignore`
- Supabase service role key NEVER exposed to client — only used in server actions and jobs
- IP addresses in `contributions.ip_hash` are SHA-256 hashed with a secret salt, never stored raw
- Intake submitter contact info encrypted at rest (Supabase column encryption)
- Sessions JWT signed with HS256 minimum; rotate signing secret quarterly

### Data minimization

- Intake form retains submissions for 18 months by default; older records archived to cold storage with PII stripped
- Contributors can request data deletion under GDPR-style policy
- No analytics that track individual users (Plausible is cookie-free and aggregated)

### Incident response

`docs/INCIDENT_RESPONSE.md` documents the playbook. Required at launch:

- How to take the site read-only
- How to revoke compromised credentials
- Communication chain to BA members
- Legal counsel contact

### Operational security for sensitive intake

For intake submissions related to on-island matters or named individuals:
- Submitter contact never stored in browser-accessible APIs
- Moderator access to those records requires re-auth
- Option for submitters to provide Signal handle instead of email
- "Burn after reading" mode: certain submissions auto-delete after moderator contact (admin-toggleable per submission)

---

## 13. Environment & deployment

### Required environment variables

```bash
# Database (Supabase)
DATABASE_URL=
DIRECT_URL=                        # For migrations
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=         # Server-only

# Auth
SUPABASE_AUTH_SIGNING_SECRET=

# Inngest
INNGEST_EVENT_KEY=
INNGEST_SIGNING_KEY=

# External APIs
NEWSAPI_KEY=
USASPENDING_BASE_URL=https://api.usaspending.gov
PACER_USERNAME=
PACER_PASSWORD=
AIRDNA_API_KEY=                    # Phase 6+

# Email
RESEND_API_KEY=

# Map tiles
PROTOMAPS_API_KEY=                 # If using hosted Protomaps; otherwise self-host

# Monitoring
SENTRY_DSN=
SENTRY_AUTH_TOKEN=

# Crypto
INTAKE_ENCRYPTION_KEY=             # 32-byte hex for intake contact encryption
IP_HASH_SALT=                      # Random secret for hashing contributor IPs

# Site config
NEXT_PUBLIC_SITE_URL=https://quiengana.org
NEXT_PUBLIC_DEFAULT_LOCALE=es
```

### Deployment targets

- **Production**: `quiengana.org` → Vercel
- **Staging**: `staging.quiengana.org` → Vercel preview
- **Local**: localhost:3000 with Supabase local stack via `supabase start`

### Backup strategy

- Supabase point-in-time recovery (7 days on free tier; upgrade to 14+ as project matures)
- Weekly logical backup (`pg_dump`) to encrypted S3 bucket — admin-controlled
- Monthly export of contributions + intake to encrypted offline archive

---

## 14. Build phases

Sequential. Each phase has explicit deliverables and a kickoff prompt for Claude Code.

### Phase 1 — Foundation (Weeks 1–2)

**Goal:** Skeleton repo with auth, database, design system, deployed to staging.

**Deliverables:**
- Next.js 15 app initialized with TypeScript strict
- Tailwind v4 configured with the design system colors and fonts
- shadcn/ui base components installed
- Drizzle ORM configured; schema.ts matches section 5
- Initial migration applied to Supabase dev project
- RLS policies applied
- Supabase auth working (magic link)
- `[locale]` route segment with next-intl, ES default
- Home page (`/[locale]/page.tsx`) renders the platform mockup faithfully
- Header, Footer, FlagBar, Eyebrow, SectionHead components built
- Deployed to Vercel staging environment
- `CLAUDE.md` referenced and conventions followed throughout

**Claude Code kickoff prompt for Phase 1:**
> Read SPEC.md and CLAUDE.md in full. Begin Phase 1. Set up a new Next.js 15 project with App Router and TypeScript strict mode. Configure Tailwind v4 with the design system from section 7. Install and configure Drizzle ORM, shadcn/ui, and next-intl per the tech stack in section 2. Implement the schema from section 5 as a Drizzle schema file, generate the initial migration, and apply RLS policies per section 5. Set up Supabase auth with magic link. Build the home page route at `/[locale]/page.tsx` that matches the mockup at `quien_gana_platform.html`. Stop after the home page renders correctly and the migration is applied, and report status.

### Phase 2 — First circuits live (Weeks 3–4)

**Goal:** Pensiones and Contratos circuits fully functional with real data.

**Deliverables:**
- Pension data seeded from Appendix A
- Pension circuit page (`/[locale]/circuitos/pensiones`) with working lookup
- Entity detail page (`/[locale]/circuitos/pensiones/[slug]`)
- Contratos ingestion job (`pull-usaspending.ts`) functional
- Contratos circuit page with contract browsing
- Intake form working (saves to `intake_submissions`, emails moderators via Resend)
- Inngest configured and running locally
- Basic `/admin` route with auth-gated access
- Admin intake queue view

**Claude Code kickoff prompt for Phase 2:**
> Begin Phase 2. Seed the pension data from SPEC.md Appendix A. Build the Pensiones circuit page per section 9.0, including the lookup grid component from the mockup. Build the entity detail page template. Implement the USASpending ingestion job per section 9.4 — write to staging tables, log to job_runs, do not auto-promote. Build the Contratos circuit page. Wire up the intake form to write to intake_submissions and send email notifications via Resend. Create the basic /admin layout with auth gating, and build the intake moderation queue page. Stop and report status.

### Phase 3 — Infrastructure layer (Weeks 5–6)

**Goal:** El Mapa and El Cable operational.

**Deliverables:**
- MapLibre instance with Protomaps tiles
- Map page with togglable layers per circuit
- Locations data populated from existing entities
- El Cable ingestion job (`poll-newsapi.ts`) operational
- News article matching to entities (substring/alias-based)
- News wire page with chronological feed
- "Recent coverage" section on entity detail pages
- Contribution submission flow (form, auth gate, moderation queue admin view)

**Claude Code kickoff prompt for Phase 3:**
> Begin Phase 3. Set up MapLibre GL JS with self-hosted Protomaps tiles. Build the /[locale]/mapa page with toggleable layers per section 10. Backfill locations for entities we have. Implement the NewsAPI polling job per section 10 (El Cable). Build the entity-matching logic for news articles (start with substring + alias matching; mark for upgrade). Build the /[locale]/cable feed page. Add a "Recent coverage" section to the entity detail template. Implement the contribution submission flow per section 10 with the admin moderation queue. Stop and report status.

### Phase 4 — Colonia Fiscal & La Junta (Weeks 7–8)

**Goal:** Two more circuits live; admin tooling matures.

**Deliverables:**
- Hacienda scraper job (with fallback for manual upload)
- Colonia Fiscal circuit page
- PROMESA docket pull (PACER integration)
- Oversight board scraper
- La Junta circuit page with docket browser
- Admin views for managing circuit data
- Bulk operations in admin (publish, unpublish, soft-delete with audit)

**Claude Code kickoff prompt for Phase 4:**
> Begin Phase 4. Implement the Hacienda scraper per section 9.1, including a manual PDF upload fallback in the admin panel. Build the Colonia Fiscal circuit page. Set up PACER integration for the PROMESA docket per section 9.3 — note the per-page cost and implement caching aggressively. Build the oversight board scraper. Build the La Junta circuit page with docket browsing. Add bulk operations to the admin panel: publish/unpublish/soft-delete with full audit logging to record_revisions. Stop and report status.

### Phase 5 — LUMA & Las Herramientas (Weeks 9–10)

**Goal:** Active campaign tooling and a major journalistic circuit.

**Deliverables:**
- LUMA energy bureau scraper
- LUMA circuit page (initially heavy on synthesized content; data layered in)
- Campaign resources system (MDX templates, variable substitution)
- Las Herramientas index and detail pages
- Divestment campaign tracker
- "Take action" prompts on circuit and entity pages linking to relevant templates

**Claude Code kickoff prompt for Phase 5:**
> Begin Phase 5. Build the LUMA scraper for PR Energy Bureau filings per section 9.2. Build the LUMA circuit page — initially weighted toward content and synthesis, with data overlays where available. Implement the campaign resources system: MDX-based templates in /[locale]/herramientas/[slug] with variable substitution. Build the Las Herramientas index page and the divestment campaign tracker. Add "Take action" CTAs to circuit and entity pages that link to relevant templates. Stop and report status.

### Phase 6 — Farma, El Desalojo, and hardening (Weeks 11–12)

**Goal:** All seven circuits live. Production hardening.

**Deliverables:**
- FDA establishment pull
- "Look up your drug" interface
- Farma circuit page
- Property record ingestion (where digital)
- El Desalojo circuit page
- AirDNA integration (paid subscription required by this phase)
- Sentry, Plausible analytics, Resend templates polished
- Methodology page (`/[locale]/metodologia`) finalized
- Full test coverage on critical paths (intake, contribution, auth)
- Production launch checklist

**Claude Code kickoff prompt for Phase 6:**
> Begin Phase 6. Implement the FDA establishment pull per section 9.5 and build the "Look up your drug" interface and Farma circuit page. Implement property record ingestion per section 9.6 where digital records exist; integrate AirDNA (credentials required from operator). Build the El Desalojo circuit page. Configure Sentry, Plausible, and polish Resend templates. Finalize the Methodology page using docs/METHODOLOGY.md as source. Add integration tests covering the intake submission flow, contribution submission flow, auth flow, and admin moderation actions. Produce a production launch checklist and stop.

---

## 15. Decisions that require human judgment

Do NOT have Claude Code make these. They need Boricuas Antifascistas resolution before the relevant phase:

| # | Decision | Needed before | Owner |
|---|---|---|---|
| 1 | Legal entity / fiscal sponsorship | Phase 6 (before public launch) | BA core |
| 2 | Lawyer retention for moderation policy review | Phase 4 | BA core + counsel |
| 3 | Methodology page content (what we cite, what we don't) | Phase 6 | Editorial lead |
| 4 | Native Spanish review of all translated copy | Phase 6 | Native speaker on team |
| 5 | Domain registration (`quiengana.org` or alternative) | Phase 1 | BA core |
| 6 | Allied org partnerships (who launches with us) | Phase 5 | BA core |
| 7 | Initial intake moderator assignments | Phase 2 | BA core |
| 8 | Editorial line on naming individuals (Act 60, property owners) | Phase 4 | Editorial lead + counsel |
| 9 | AirDNA subscription budget approval | Phase 6 | BA core |
| 10 | PACER spending budget cap (per-page costs) | Phase 4 | BA core |
| 11 | Press launch strategy (when/how to announce) | Phase 6 | BA comms |
| 12 | Backup admin contacts (in case primary admin is unreachable) | Phase 1 | BA core |

---

## 16. Testing strategy

Not exhaustive — pragmatic. Coverage targets:

- **Critical paths (Vitest + Playwright):** intake form submission, contribution submission, magic link auth, admin approval/rejection, language toggle
- **Pure logic (Vitest):** entity matching, data normalization, RLS policy effects (using Supabase local test harness)
- **No coverage required for:** purely presentational components, generated migrations, vendored shadcn components

Run on every PR. Block merge on critical path failures.

---

## 17. Documentation that lives alongside code

Each of these gets its own file in `docs/` and is maintained as the platform evolves:

- `docs/METHODOLOGY.md` — How we source and verify claims. Public-facing.
- `docs/MODERATION_POLICY.md` — How moderators decide what to publish.
- `docs/DATA_SOURCES.md` — Every data source we pull from, refresh cadence, known gotchas.
- `docs/INCIDENT_RESPONSE.md` — What to do when something breaks or worse.
- `docs/DEPLOYMENT.md` — Step-by-step deploy procedures.
- `docs/CONTRIBUTING.md` — For external contributors.

---

## Appendix A — Pension data seed (from In These Times, 2018)

The following data should be inserted via `scripts/seed-pension-data.ts` after Phase 1 schema is in place. All values reflect holdings during the 2017–2018 PROMESA Title III bankruptcy proceedings — display this caveat prominently on every record.

### Entities — pension funds

| display_name | slug | jurisdiction | entity_type |
|---|---|---|---|
| Washington State Board of Investment | wa-state-board-investment | US-WA | pension_fund |
| Oregon Public Employees Retirement Fund | or-pers | US-OR | pension_fund |
| New York State and Local Retirement System | ny-state-local | US-NY | pension_fund |
| Florida State Board of Administration | fl-sba | US-FL | pension_fund |
| North Carolina Retirement System | nc-retirement | US-NC | pension_fund |
| Massachusetts PRIM Board | ma-prim | US-MA | pension_fund |
| CalSTRS — California State Teachers Retirement | ca-calstrs | US-CA | pension_fund |
| Illinois Teachers' Retirement System | il-trs | US-IL | pension_fund |
| New Jersey Public Employee Retirement System | nj-pers | US-NJ | pension_fund |

### Entities — hedge funds (the vulture funds)

| display_name | slug | jurisdiction | metadata |
|---|---|---|---|
| Oaktree Capital Management | oaktree | US-CA | `{"hq_city":"Los Angeles","funds_involved":7}` |
| Centerbridge Partners | centerbridge | US-NY | `{"hq_city":"New York","shell_entity":"SV Credit"}` |
| King Street Capital | king-street | US-NY | `{"hq_city":"New York","shell_entity":"Ocher Rose"}` |
| Stone Lion Capital | stone-lion | US-NY | `{"hq_city":"New York"}` |
| Mason Capital Management | mason-capital | US-NY | `{"hq_city":"New York"}` |
| Glendon Capital Management | glendon | INTL | `{"hq_city":"Cayman Islands"}` |

### pension_investments rows

| pension_fund | hedge_fund | amount_display | fund_name | data_window |
|---|---|---|---|---|
| wa-state-board-investment | oaktree | $600M | Oaktree Opportunities (2 funds) | 2017-01-01 to 2018-12-31 |
| or-pers | centerbridge | $500M | Centerbridge Special Credit Partners III | 2017-01-01 to 2018-12-31 |
| or-pers | oaktree | $125M | Oaktree Opportunities IX | 2017-01-01 to 2018-12-31 |
| ny-state-local | king-street | $249M | King Street Capital | 2017-01-01 to 2018-12-31 |
| fl-sba | king-street | $200M | King Street Capital | 2017-01-01 to 2018-12-31 |
| nc-retirement | oaktree | $190M | Oaktree Opportunities | 2017-01-01 to 2018-12-31 |
| ma-prim | oaktree | $175M | Oaktree Opportunities | 2017-01-01 to 2018-12-31 |
| ca-calstrs | centerbridge | $125M | Centerbridge Special Credit Partners III | 2017-01-01 to 2018-12-31 |
| il-trs | oaktree | $100M | Oaktree Opportunities | 2017-01-01 to 2018-12-31 |
| nj-pers | glendon | $100M | Glendon Opportunities Fund | 2017-01-01 to 2018-12-31 |

All rows: `source_url` = `https://inthesetimes.com/article/is-your-pension-fund-plundering-puerto-rico`, `source_description` = "In These Times investigation by Ethan Corey, January 2018, based on public ERS bankruptcy filings and SEC disclosures."

### ers_bond_claims rows

| hedge_fund | claimed_amount | shell_entity |
|---|---|---|
| oaktree | $410M | — |
| centerbridge | $390M | SV Credit |
| stone-lion | $325M | — |
| king-street | $197M | Ocher Rose |
| mason-capital | $141M | — |
| glendon | $34M | — |

All `source_url` references the In These Times piece and the underlying PROMESA Title III bankruptcy docket (docket reference to be filled in during seed by looking up the original filings).

---

## Appendix B — Glossary

- **BA** — Boricuas Antifascistas
- **CAFR** — Comprehensive Annual Financial Report (US state pension funds publish these)
- **ERS** — Employee Retirement System (Puerto Rico's public-worker pension)
- **La Junta** — informal name for the PROMESA fiscal oversight board
- **PROMESA** — Puerto Rico Oversight, Management, and Economic Stability Act (2016)
- **LP** — limited partner (a pension fund investing in a private fund is an LP)
- **Hacienda** — Puerto Rico's Department of Treasury
- **RLS** — Row-level security (Postgres/Supabase access control)

---

*This is the canonical spec. Update it as the platform evolves. Anything not specified here defers to `CLAUDE.md` conventions.*
