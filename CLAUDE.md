# Quién Gana — Project Conventions for Claude Code

**Built by Boricuas Antifascistas. A bilingual public-accountability platform tracing the colonial circuits extracting wealth from Puerto Rico.**

`SPEC.md` in this repo is the canonical specification. Read it in full before any phase. Section numbers there are stable references. This file defines *conventions*; SPEC.md defines *what to build*. When they conflict, ask — don't guess.

---

## 0. ISOLATION — read first (non-negotiable)

This repo is **completely separate** from the operator's other two projects. Under no circumstances touch, import from, or reuse anything belonging to them:

- **Bon Bon Clean** — `~/Projects/BonBon/` (do not read, edit, or borrow code/creds/config)
- **Kollab** — `~/kollab/` (same)

Each of the three projects has its own repo, Supabase project, Vercel project, GitHub remote, and credentials. **Never** share an env var, key, database, or resource across them. If something here looks like it needs a BonBon/Kollab resource, stop and ask — the answer is to provision a dedicated one for Quién Gana.

## 1. Git identity & commit hygiene (sensitive)

This is a politically sensitive project — it names individuals, touches active litigation, and is explicitly antifascist. The git history must reflect a **dedicated Boricuas Antifascistas identity**, never the operator's personal (`hferran29@gmail.com`) or business (BonBon/Kollab) identities.

- A **pre-commit hook** (`.git/hooks/pre-commit`) currently **blocks all commits**. It exists to prevent the global identity from leaking into history before the BA identity is set up.
- Do **not** remove that hook, and do **not** set `user.name`/`user.email` yourself. The operator configures the dedicated BA identity and removes the hook when ready.
- Once unblocked: per-repo `user.name`/`user.email` only (set in `.git/config`, never relying on the global fallback). Push via the dedicated BA GitHub account / SSH host alias — never `git@github.com:` and never the bonbon/kollab aliases.
- **OPEN QUESTION for the operator:** whether commit messages should carry a `Co-Authored-By: Claude` trailer. For OPSEC it may be undesirable as a tooling fingerprint. Default to **omitting it** until the operator decides.
- Commit only when asked. Conventional-commit style (`feat:`, `fix:`, `chore:`, `docs:`) once commits are enabled.

## 2. Tech stack (decided — see SPEC §2)

Next.js 15 (App Router) · TypeScript strict · Supabase (Postgres 16, Auth, Storage) · **Drizzle** ORM (SQL-first; **never Prisma**) · Tailwind CSS v4 · shadcn/ui · React Hook Form + Zod · **next-intl** · Inngest (jobs) · MapLibre GL + Protomaps · Resend · Sentry · Plausible.

Explicitly NOT used: Google Analytics, Facebook Pixel, Mapbox, Firebase, any non-Supabase auth. Do not introduce a dependency that duplicates one of these without asking.

> Note: SPEC pins **Next.js 15**. Hold there unless the operator approves moving to 16.

## 3. Repo structure

Single repo, app + jobs + admin in one Next.js codebase. Full tree in **SPEC §4**. Match it. Key roots: `src/app/[locale]/` (public, ES default), `src/app/admin/` (auth-gated), `src/jobs/` (Inngest), `src/lib/db/` (Drizzle), `src/translations/`, `drizzle/` (migrations), `docs/`.

## 4. Data model rules (see SPEC §5)

- **One `entities` table** all circuits reference. Same actor = one row.
- **Staging → public**: ingestion writes `is_published = false`; humans promote. A broken scraper must never touch live data.
- **UUIDs** for all PKs (`gen_random_uuid()`). Never expose serial IDs.
- **Soft delete only** (`deleted_at`) on published data — never destructive deletes.
- **Audit everything** via `record_revisions` (create/update/publish/unpublish/soft_delete).
- RLS enforced at the DB layer (SPEC §5) — public reads only on `is_published = true`; no anonymous writes to circuit tables.

## 5. i18n rules (see SPEC §8)

- Default locale **`es`** (Spanish leads — a political choice). Locales: `es`, `en`.
- **No hard-coded user-facing strings** — everything through `next-intl` (`useTranslations()`), messages in `src/translations/{es,en}.json`.
- URL slugs stay **Spanish in both locales** (`/circuitos`, `/pensiones`, `/colonia-fiscal`). Deliberate — don't "translate" routes.
- Spanish copy from the mockup is a draft; flag it for native review, don't treat as final.

## 6. Design system (see SPEC §7)

Match the canonical HTML mockup. Fonts: Fraunces (display), Manrope (body), JetBrains Mono (labels), via `next/font`. Celeste/rojo/cream palette per SPEC §7. **Hard constraints:** no drop shadows; no gradients (except the hero radial blur); border-radius 2px (4px cards); 0.5–1px borders; no bold sans headlines (use Fraunces 500–600); **no emoji in UI**.

## 7. Security (see SPEC §12)

- Supabase **service role key** is server-only — never shipped to the client; only in server actions and Inngest jobs.
- `.env.local` / `.env.*.local` are gitignored — never commit secrets.
- `contributions.ip_hash` is SHA-256 with a secret salt — never store raw IPs.
- Intake submitter contact is sensitive; treat per SPEC §12 (encryption at rest, re-auth for moderator access, Signal option, burn-after-reading).

## 8. Build phases (see SPEC §14)

Six sequential phases. **Do not skip ahead.** Each has explicit deliverables and a kickoff prompt in SPEC §14. SPEC §15 lists decisions reserved for the operator (BA core) — do not make those for them.

## 9. Testing (see SPEC §16)

Pragmatic. Vitest + Playwright on critical paths: intake submission, contribution submission, magic-link auth, admin approve/reject, language toggle. Pure logic (entity matching, normalization, RLS effects) in Vitest. No coverage required for presentational components or vendored shadcn.
