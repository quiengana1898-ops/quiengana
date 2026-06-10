/**
 * Quién Gana database schema (SPEC §5).
 *
 * Design principles (do not break without updating SPEC §5):
 *  - ONE `entities` table all circuits reference (same actor = one row).
 *  - Staging vs public via `is_published` + RLS (not separate tables).
 *  - UUID PKs everywhere (gen_random_uuid); never expose serial IDs.
 *  - Soft delete only (`deleted_at`) on published data.
 *  - Full audit trail via `record_revisions`.
 *
 * RLS policies live in drizzle/0001_rls_policies.sql (applied separately).
 * Foreign keys to Supabase-managed `auth.users` use the stub below; drizzle-kit
 * is scoped to the `public` schema (schemaFilter) so it never touches `auth`.
 */
import { sql } from "drizzle-orm";
import {
  bigint,
  boolean,
  check,
  date,
  doublePrecision,
  index,
  integer,
  jsonb,
  numeric,
  pgSchema,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

// Stub of Supabase's managed auth.users — for FK typing only; not migrated.
const authSchema = pgSchema("auth");
export const authUsers = authSchema.table("users", {
  id: uuid("id").primaryKey(),
});

const tz = { withTimezone: true } as const;

// ============================================================
// CORE: Entities (people, companies, governments, funds)
// ============================================================
export const entities = pgTable(
  "entities",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    entityType: text("entity_type").notNull(),
    displayName: text("display_name").notNull(),
    displayNameEs: text("display_name_es"),
    slug: text("slug").notNull().unique(),
    description: text("description"),
    descriptionEs: text("description_es"),
    aliases: text("aliases").array().default(sql`'{}'`),
    jurisdiction: text("jurisdiction"),
    foundedYear: integer("founded_year"),
    externalIds: jsonb("external_ids").default({}),
    metadata: jsonb("metadata").default({}),
    isPublished: boolean("is_published").notNull().default(false),
    createdAt: timestamp("created_at", tz).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", tz).notNull().defaultNow(),
    createdBy: uuid("created_by").references(() => authUsers.id),
    deletedAt: timestamp("deleted_at", tz),
  },
  (t) => [
    check(
      "entities_entity_type_check",
      sql`${t.entityType} in ('individual','corporation','hedge_fund','pension_fund','government_body','union','contractor','pharma_company','property_owner','other')`,
    ),
    index("idx_entities_type")
      .on(t.entityType)
      .where(sql`deleted_at is null`),
    index("idx_entities_search").using(
      "gin",
      sql`to_tsvector('simple', ${t.displayName} || ' ' || coalesce(${t.displayNameEs}, ''))`,
    ),
    index("idx_entities_aliases").using("gin", t.aliases),
  ],
);

// ============================================================
// CORE: Locations (for El Mapa)
// ============================================================
export const locations = pgTable(
  "locations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    entityId: uuid("entity_id").references(() => entities.id, {
      onDelete: "cascade",
    }),
    address: text("address"),
    city: text("city"),
    region: text("region"),
    country: text("country").notNull().default("US"),
    postalCode: text("postal_code"),
    latitude: doublePrecision("latitude"),
    longitude: doublePrecision("longitude"),
    locationType: text("location_type"),
    source: text("source"),
    metadata: jsonb("metadata").default({}),
    createdAt: timestamp("created_at", tz).notNull().defaultNow(),
  },
  (t) => [
    index("idx_locations_entity").on(t.entityId),
    index("idx_locations_geo")
      .on(t.latitude, t.longitude)
      .where(sql`latitude is not null`),
  ],
);

// ============================================================
// CIRCUIT: Pensiones — pension fund records
// ============================================================
export const pensionInvestments = pgTable(
  "pension_investments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    pensionFundId: uuid("pension_fund_id")
      .notNull()
      .references(() => entities.id),
    hedgeFundId: uuid("hedge_fund_id")
      .notNull()
      .references(() => entities.id),
    amountUsd: bigint("amount_usd", { mode: "number" }), // cents
    amountDisplay: text("amount_display"),
    fundName: text("fund_name"),
    dataWindowStart: date("data_window_start"),
    dataWindowEnd: date("data_window_end"),
    sourceUrl: text("source_url").notNull(),
    sourceDescription: text("source_description").notNull(),
    notes: text("notes"),
    isPublished: boolean("is_published").notNull().default(false),
    createdAt: timestamp("created_at", tz).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", tz).notNull().defaultNow(),
    deletedAt: timestamp("deleted_at", tz),
  },
  (t) => [
    index("idx_pension_investments_pension").on(t.pensionFundId),
    index("idx_pension_investments_hedge").on(t.hedgeFundId),
  ],
);

export const ersBondClaims = pgTable("ers_bond_claims", {
  id: uuid("id").primaryKey().defaultRandom(),
  hedgeFundId: uuid("hedge_fund_id")
    .notNull()
    .references(() => entities.id),
  claimedAmountUsd: bigint("claimed_amount_usd", { mode: "number" }),
  claimedAmountDisplay: text("claimed_amount_display"),
  shellEntity: text("shell_entity"),
  filingDate: date("filing_date"),
  docketReference: text("docket_reference"),
  sourceUrl: text("source_url").notNull(),
  isPublished: boolean("is_published").notNull().default(false),
  createdAt: timestamp("created_at", tz).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", tz).notNull().defaultNow(),
});

// ============================================================
// CIRCUIT: Colonia Fiscal — Act 60 beneficiaries
// ============================================================
export const act60Decrees = pgTable(
  "act60_decrees",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    beneficiaryId: uuid("beneficiary_id")
      .notNull()
      .references(() => entities.id),
    decreeType: text("decree_type").notNull(),
    decreeNumber: text("decree_number"),
    grantedDate: date("granted_date"),
    expirationDate: date("expiration_date"),
    priorResidence: text("prior_residence"),
    reportedBusiness: text("reported_business"),
    sourceUrl: text("source_url").notNull(),
    haciendaPullDate: date("hacienda_pull_date").notNull(),
    isPublished: boolean("is_published").notNull().default(false),
    metadata: jsonb("metadata").default({}),
    createdAt: timestamp("created_at", tz).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", tz).notNull().defaultNow(),
  },
  (t) => [
    check(
      "act60_decrees_decree_type_check",
      sql`${t.decreeType} in ('act_22','act_20','act_60_individual','act_60_export','act_60_other')`,
    ),
    index("idx_act60_beneficiary").on(t.beneficiaryId),
  ],
);

// ============================================================
// CIRCUIT: LUMA — energy grid
// ============================================================
export const lumaRecords = pgTable(
  "luma_records",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    recordType: text("record_type").notNull(),
    title: text("title").notNull(),
    titleEs: text("title_es"),
    description: text("description"),
    descriptionEs: text("description_es"),
    eventDate: date("event_date"),
    relatedEntityId: uuid("related_entity_id").references(() => entities.id),
    sourceUrl: text("source_url").notNull(),
    isPublished: boolean("is_published").notNull().default(false),
    metadata: jsonb("metadata").default({}),
    createdAt: timestamp("created_at", tz).notNull().defaultNow(),
  },
  (t) => [
    check(
      "luma_records_record_type_check",
      sql`${t.recordType} in ('contract_term','outage_event','executive_comp','rate_change','public_filing')`,
    ),
  ],
);

// ============================================================
// CIRCUIT: La Junta — PROMESA & debt
// ============================================================
export const promesaFilings = pgTable(
  "promesa_filings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    docketId: text("docket_id").notNull(),
    filingDate: date("filing_date").notNull(),
    filingType: text("filing_type"),
    title: text("title").notNull(),
    filedByEntityId: uuid("filed_by_entity_id").references(() => entities.id),
    summary: text("summary"),
    summaryEs: text("summary_es"),
    sourceUrl: text("source_url").notNull(),
    pdfUrl: text("pdf_url"),
    isPublished: boolean("is_published").notNull().default(false),
    createdAt: timestamp("created_at", tz).notNull().defaultNow(),
  },
  (t) => [index("idx_promesa_docket").on(t.docketId)],
);

export const prRevenueAllocation = pgTable("pr_revenue_allocation", {
  id: uuid("id").primaryKey().defaultRandom(),
  fiscalPeriod: text("fiscal_period").notNull(),
  category: text("category").notNull(),
  amountUsd: bigint("amount_usd", { mode: "number" }).notNull(),
  sourceUrl: text("source_url").notNull(),
  isPublished: boolean("is_published").notNull().default(false),
  createdAt: timestamp("created_at", tz).notNull().defaultNow(),
});

// ============================================================
// CIRCUIT: Contratos — disaster contractors
// ============================================================
export const federalContracts = pgTable(
  "federal_contracts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    contractId: text("contract_id").notNull().unique(),
    contractorId: uuid("contractor_id")
      .notNull()
      .references(() => entities.id),
    awardingAgency: text("awarding_agency"),
    awardType: text("award_type"),
    obligatedAmountUsd: bigint("obligated_amount_usd", { mode: "number" }),
    currentAmountUsd: bigint("current_amount_usd", { mode: "number" }),
    awardDate: date("award_date"),
    periodOfPerformanceStart: date("period_of_performance_start"),
    periodOfPerformanceEnd: date("period_of_performance_end"),
    placeOfPerformance: text("place_of_performance"),
    description: text("description"),
    relatedDisaster: text("related_disaster"),
    sourceUrl: text("source_url").notNull(),
    rawData: jsonb("raw_data"),
    isPublished: boolean("is_published").notNull().default(false),
    createdAt: timestamp("created_at", tz).notNull().defaultNow(),
  },
  (t) => [
    index("idx_contracts_contractor").on(t.contractorId),
    index("idx_contracts_disaster").on(t.relatedDisaster),
  ],
);

// ============================================================
// CIRCUIT: Farma — pharmaceutical extraction
// ============================================================
export const drugManufacturing = pgTable("drug_manufacturing", {
  id: uuid("id").primaryKey().defaultRandom(),
  drugName: text("drug_name").notNull(),
  drugGenericName: text("drug_generic_name"),
  manufacturerId: uuid("manufacturer_id")
    .notNull()
    .references(() => entities.id),
  facilityName: text("facility_name"),
  facilityLocationId: uuid("facility_location_id").references(
    () => locations.id,
  ),
  fdaEstablishmentId: text("fda_establishment_id"),
  sourceUrl: text("source_url").notNull(),
  isPublished: boolean("is_published").notNull().default(false),
  createdAt: timestamp("created_at", tz).notNull().defaultNow(),
});

// ============================================================
// CIRCUIT: El Desalojo — land & displacement
// ============================================================
export const propertyRecords = pgTable("property_records", {
  id: uuid("id").primaryKey().defaultRandom(),
  ownerId: uuid("owner_id")
    .notNull()
    .references(() => entities.id),
  propertyAddress: text("property_address").notNull(),
  municipality: text("municipality").notNull(),
  propertyType: text("property_type"),
  isShortTermRental: boolean("is_short_term_rental").default(false),
  acquiredDate: date("acquired_date"),
  acquiredAmountUsd: bigint("acquired_amount_usd", { mode: "number" }),
  locationId: uuid("location_id").references(() => locations.id),
  sourceUrl: text("source_url").notNull(),
  isPublished: boolean("is_published").notNull().default(false),
  createdAt: timestamp("created_at", tz).notNull().defaultNow(),
});

// ============================================================
// INFRASTRUCTURE: El Cable (news wire)
// ============================================================
export const newsArticles = pgTable(
  "news_articles",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    url: text("url").notNull().unique(),
    title: text("title").notNull(),
    source: text("source").notNull(),
    publishedAt: timestamp("published_at", tz).notNull(),
    language: text("language").notNull(),
    summary: text("summary"),
    fullText: text("full_text"),
    pulledAt: timestamp("pulled_at", tz).notNull().defaultNow(),
    createdAt: timestamp("created_at", tz).notNull().defaultNow(),
  },
  (t) => [
    check(
      "news_articles_language_check",
      sql`${t.language} in ('en','es','other')`,
    ),
    index("idx_articles_published").on(t.publishedAt.desc()),
  ],
);

export const newsArticleMentions = pgTable(
  "news_article_mentions",
  {
    articleId: uuid("article_id")
      .notNull()
      .references(() => newsArticles.id, { onDelete: "cascade" }),
    entityId: uuid("entity_id")
      .notNull()
      .references(() => entities.id, { onDelete: "cascade" }),
    confidence: numeric("confidence", { precision: 3, scale: 2 }),
    contextExcerpt: text("context_excerpt"),
    createdAt: timestamp("created_at", tz).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.articleId, t.entityId] })],
);

// ============================================================
// INFRASTRUCTURE: Las Herramientas (divestment toolkit)
// ============================================================
export const campaignResources = pgTable(
  "campaign_resources",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    resourceType: text("resource_type").notNull(),
    title: text("title").notNull(),
    titleEs: text("title_es"),
    body: text("body").notNull(),
    bodyEs: text("body_es"),
    targetAudience: text("target_audience"),
    relatedCircuit: text("related_circuit"),
    relatedEntityId: uuid("related_entity_id").references(() => entities.id),
    downloadUrl: text("download_url"),
    isPublished: boolean("is_published").notNull().default(false),
    createdAt: timestamp("created_at", tz).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", tz).notNull().defaultNow(),
  },
  (t) => [
    check(
      "campaign_resources_resource_type_check",
      sql`${t.resourceType} in ('letter_template','model_resolution','fact_sheet','guide','tracker_entry')`,
    ),
  ],
);

export const divestmentCampaigns = pgTable(
  "divestment_campaigns",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    targetEntityId: uuid("target_entity_id")
      .notNull()
      .references(() => entities.id),
    campaignName: text("campaign_name").notNull(),
    status: text("status").notNull(),
    startedAt: date("started_at"),
    resolvedAt: date("resolved_at"),
    outcomeDescription: text("outcome_description"),
    ledBy: text("led_by"),
    sourceUrl: text("source_url"),
    isPublished: boolean("is_published").notNull().default(false),
    createdAt: timestamp("created_at", tz).notNull().defaultNow(),
  },
  (t) => [
    check(
      "divestment_campaigns_status_check",
      sql`${t.status} in ('active','won','lost','paused')`,
    ),
  ],
);

// ============================================================
// INFRASTRUCTURE: Completar el Expediente (contributions)
// ============================================================
export const contributions = pgTable(
  "contributions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    contributorId: uuid("contributor_id").references(() => authUsers.id), // null = anonymous
    targetTable: text("target_table").notNull(),
    targetId: uuid("target_id").notNull(),
    contributionType: text("contribution_type").notNull(),
    content: text("content").notNull(),
    attachments: jsonb("attachments").default([]),
    status: text("status").notNull().default("pending"),
    moderatorId: uuid("moderator_id").references(() => authUsers.id),
    moderatorNotes: text("moderator_notes"),
    resolvedAt: timestamp("resolved_at", tz),
    visibility: text("visibility").notNull().default("public"),
    contributorDisplayName: text("contributor_display_name"),
    ipHash: text("ip_hash"), // SHA-256 + secret salt; never plain IP
    createdAt: timestamp("created_at", tz).notNull().defaultNow(),
  },
  (t) => [
    check(
      "contributions_contribution_type_check",
      sql`${t.contributionType} in ('correction','addition','document','testimony','clarification')`,
    ),
    check(
      "contributions_status_check",
      sql`${t.status} in ('pending','approved','rejected','flagged_legal')`,
    ),
    check(
      "contributions_visibility_check",
      sql`${t.visibility} in ('public','internal_only','attributed','anonymous')`,
    ),
    index("idx_contributions_target").on(t.targetTable, t.targetId),
    index("idx_contributions_status")
      .on(t.status)
      .where(sql`status = 'pending'`),
  ],
);

// ============================================================
// INTAKE: reports from the public via the form
// ============================================================
export const intakeSubmissions = pgTable(
  "intake_submissions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    submitterName: text("submitter_name"),
    submitterContact: text("submitter_contact").notNull(),
    submitterRole: text("submitter_role"),
    relatedCircuit: text("related_circuit"),
    message: text("message").notNull(),
    stateOrFund: text("state_or_fund"),
    attachments: jsonb("attachments").default([]),
    status: text("status").notNull().default("new"),
    assignedTo: uuid("assigned_to").references(() => authUsers.id),
    internalNotes: text("internal_notes"),
    contactMadeAt: timestamp("contact_made_at", tz),
    createdAt: timestamp("created_at", tz).notNull().defaultNow(),
  },
  (t) => [
    check(
      "intake_submissions_status_check",
      sql`${t.status} in ('new','reviewing','contacted','archived','spam')`,
    ),
    index("idx_intake_status")
      .on(t.status)
      .where(sql`status in ('new', 'reviewing')`),
  ],
);

// ============================================================
// AUDIT & SYSTEM
// ============================================================
export const recordRevisions = pgTable(
  "record_revisions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tableName: text("table_name").notNull(),
    recordId: uuid("record_id").notNull(),
    changedBy: uuid("changed_by").references(() => authUsers.id),
    changeType: text("change_type").notNull(),
    diff: jsonb("diff"),
    reason: text("reason"),
    createdAt: timestamp("created_at", tz).notNull().defaultNow(),
  },
  (t) => [
    check(
      "record_revisions_change_type_check",
      sql`${t.changeType} in ('create','update','publish','unpublish','soft_delete')`,
    ),
    index("idx_revisions_record").on(t.tableName, t.recordId),
  ],
);

export const jobRuns = pgTable(
  "job_runs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    jobName: text("job_name").notNull(),
    status: text("status").notNull(),
    recordsProcessed: integer("records_processed").default(0),
    recordsCreated: integer("records_created").default(0),
    recordsUpdated: integer("records_updated").default(0),
    errorMessage: text("error_message"),
    startedAt: timestamp("started_at", tz).notNull(),
    completedAt: timestamp("completed_at", tz),
    metadata: jsonb("metadata").default({}),
  },
  (t) => [
    check(
      "job_runs_status_check",
      sql`${t.status} in ('running','success','failure','partial')`,
    ),
    index("idx_job_runs_recent").on(t.jobName, t.startedAt.desc()),
  ],
);

// ============================================================
// USERS & ROLES (extends Supabase auth.users)
// ============================================================
export const userProfiles = pgTable(
  "user_profiles",
  {
    userId: uuid("user_id")
      .primaryKey()
      .references(() => authUsers.id, { onDelete: "cascade" }),
    displayName: text("display_name"),
    role: text("role").notNull().default("contributor"),
    organization: text("organization"),
    bio: text("bio"),
    contributionsApproved: integer("contributions_approved").default(0),
    createdAt: timestamp("created_at", tz).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", tz).notNull().defaultNow(),
  },
  (t) => [
    check(
      "user_profiles_role_check",
      sql`${t.role} in ('contributor','moderator','admin','partner_org')`,
    ),
  ],
);
