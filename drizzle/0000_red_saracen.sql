CREATE TABLE "act60_decrees" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"beneficiary_id" uuid NOT NULL,
	"decree_type" text NOT NULL,
	"decree_number" text,
	"granted_date" date,
	"expiration_date" date,
	"prior_residence" text,
	"reported_business" text,
	"source_url" text NOT NULL,
	"hacienda_pull_date" date NOT NULL,
	"is_published" boolean DEFAULT false NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "act60_decrees_decree_type_check" CHECK ("act60_decrees"."decree_type" in ('act_22','act_20','act_60_individual','act_60_export','act_60_other'))
);
--> statement-breakpoint
-- NOTE: auth.users is Supabase-managed and already exists; its CREATE TABLE was
-- removed here intentionally. FKs below reference it. (Stub kept in the drizzle
-- snapshot so future migrations don't try to recreate it.)
CREATE TABLE "campaign_resources" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"resource_type" text NOT NULL,
	"title" text NOT NULL,
	"title_es" text,
	"body" text NOT NULL,
	"body_es" text,
	"target_audience" text,
	"related_circuit" text,
	"related_entity_id" uuid,
	"download_url" text,
	"is_published" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "campaign_resources_resource_type_check" CHECK ("campaign_resources"."resource_type" in ('letter_template','model_resolution','fact_sheet','guide','tracker_entry'))
);
--> statement-breakpoint
CREATE TABLE "contributions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"contributor_id" uuid,
	"target_table" text NOT NULL,
	"target_id" uuid NOT NULL,
	"contribution_type" text NOT NULL,
	"content" text NOT NULL,
	"attachments" jsonb DEFAULT '[]'::jsonb,
	"status" text DEFAULT 'pending' NOT NULL,
	"moderator_id" uuid,
	"moderator_notes" text,
	"resolved_at" timestamp with time zone,
	"visibility" text DEFAULT 'public' NOT NULL,
	"contributor_display_name" text,
	"ip_hash" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "contributions_contribution_type_check" CHECK ("contributions"."contribution_type" in ('correction','addition','document','testimony','clarification')),
	CONSTRAINT "contributions_status_check" CHECK ("contributions"."status" in ('pending','approved','rejected','flagged_legal')),
	CONSTRAINT "contributions_visibility_check" CHECK ("contributions"."visibility" in ('public','internal_only','attributed','anonymous'))
);
--> statement-breakpoint
CREATE TABLE "divestment_campaigns" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"target_entity_id" uuid NOT NULL,
	"campaign_name" text NOT NULL,
	"status" text NOT NULL,
	"started_at" date,
	"resolved_at" date,
	"outcome_description" text,
	"led_by" text,
	"source_url" text,
	"is_published" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "divestment_campaigns_status_check" CHECK ("divestment_campaigns"."status" in ('active','won','lost','paused'))
);
--> statement-breakpoint
CREATE TABLE "drug_manufacturing" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"drug_name" text NOT NULL,
	"drug_generic_name" text,
	"manufacturer_id" uuid NOT NULL,
	"facility_name" text,
	"facility_location_id" uuid,
	"fda_establishment_id" text,
	"source_url" text NOT NULL,
	"is_published" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "entities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entity_type" text NOT NULL,
	"display_name" text NOT NULL,
	"display_name_es" text,
	"slug" text NOT NULL,
	"description" text,
	"description_es" text,
	"aliases" text[] DEFAULT '{}',
	"jurisdiction" text,
	"founded_year" integer,
	"external_ids" jsonb DEFAULT '{}'::jsonb,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"is_published" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "entities_slug_unique" UNIQUE("slug"),
	CONSTRAINT "entities_entity_type_check" CHECK ("entities"."entity_type" in ('individual','corporation','hedge_fund','pension_fund','government_body','union','contractor','pharma_company','property_owner','other'))
);
--> statement-breakpoint
CREATE TABLE "ers_bond_claims" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"hedge_fund_id" uuid NOT NULL,
	"claimed_amount_usd" bigint,
	"claimed_amount_display" text,
	"shell_entity" text,
	"filing_date" date,
	"docket_reference" text,
	"source_url" text NOT NULL,
	"is_published" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "federal_contracts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"contract_id" text NOT NULL,
	"contractor_id" uuid NOT NULL,
	"awarding_agency" text,
	"award_type" text,
	"obligated_amount_usd" bigint,
	"current_amount_usd" bigint,
	"award_date" date,
	"period_of_performance_start" date,
	"period_of_performance_end" date,
	"place_of_performance" text,
	"description" text,
	"related_disaster" text,
	"source_url" text NOT NULL,
	"raw_data" jsonb,
	"is_published" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "federal_contracts_contract_id_unique" UNIQUE("contract_id")
);
--> statement-breakpoint
CREATE TABLE "intake_submissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"submitter_name" text,
	"submitter_contact" text NOT NULL,
	"submitter_role" text,
	"related_circuit" text,
	"message" text NOT NULL,
	"state_or_fund" text,
	"attachments" jsonb DEFAULT '[]'::jsonb,
	"status" text DEFAULT 'new' NOT NULL,
	"assigned_to" uuid,
	"internal_notes" text,
	"contact_made_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "intake_submissions_status_check" CHECK ("intake_submissions"."status" in ('new','reviewing','contacted','archived','spam'))
);
--> statement-breakpoint
CREATE TABLE "job_runs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_name" text NOT NULL,
	"status" text NOT NULL,
	"records_processed" integer DEFAULT 0,
	"records_created" integer DEFAULT 0,
	"records_updated" integer DEFAULT 0,
	"error_message" text,
	"started_at" timestamp with time zone NOT NULL,
	"completed_at" timestamp with time zone,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	CONSTRAINT "job_runs_status_check" CHECK ("job_runs"."status" in ('running','success','failure','partial'))
);
--> statement-breakpoint
CREATE TABLE "locations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entity_id" uuid,
	"address" text,
	"city" text,
	"region" text,
	"country" text DEFAULT 'US' NOT NULL,
	"postal_code" text,
	"latitude" double precision,
	"longitude" double precision,
	"location_type" text,
	"source" text,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "luma_records" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"record_type" text NOT NULL,
	"title" text NOT NULL,
	"title_es" text,
	"description" text,
	"description_es" text,
	"event_date" date,
	"related_entity_id" uuid,
	"source_url" text NOT NULL,
	"is_published" boolean DEFAULT false NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "luma_records_record_type_check" CHECK ("luma_records"."record_type" in ('contract_term','outage_event','executive_comp','rate_change','public_filing'))
);
--> statement-breakpoint
CREATE TABLE "news_article_mentions" (
	"article_id" uuid NOT NULL,
	"entity_id" uuid NOT NULL,
	"confidence" numeric(3, 2),
	"context_excerpt" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "news_article_mentions_article_id_entity_id_pk" PRIMARY KEY("article_id","entity_id")
);
--> statement-breakpoint
CREATE TABLE "news_articles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"url" text NOT NULL,
	"title" text NOT NULL,
	"source" text NOT NULL,
	"published_at" timestamp with time zone NOT NULL,
	"language" text NOT NULL,
	"summary" text,
	"full_text" text,
	"pulled_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "news_articles_url_unique" UNIQUE("url"),
	CONSTRAINT "news_articles_language_check" CHECK ("news_articles"."language" in ('en','es','other'))
);
--> statement-breakpoint
CREATE TABLE "pension_investments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pension_fund_id" uuid NOT NULL,
	"hedge_fund_id" uuid NOT NULL,
	"amount_usd" bigint,
	"amount_display" text,
	"fund_name" text,
	"data_window_start" date,
	"data_window_end" date,
	"source_url" text NOT NULL,
	"source_description" text NOT NULL,
	"notes" text,
	"is_published" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "pr_revenue_allocation" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"fiscal_period" text NOT NULL,
	"category" text NOT NULL,
	"amount_usd" bigint NOT NULL,
	"source_url" text NOT NULL,
	"is_published" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "promesa_filings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"docket_id" text NOT NULL,
	"filing_date" date NOT NULL,
	"filing_type" text,
	"title" text NOT NULL,
	"filed_by_entity_id" uuid,
	"summary" text,
	"summary_es" text,
	"source_url" text NOT NULL,
	"pdf_url" text,
	"is_published" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "property_records" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" uuid NOT NULL,
	"property_address" text NOT NULL,
	"municipality" text NOT NULL,
	"property_type" text,
	"is_short_term_rental" boolean DEFAULT false,
	"acquired_date" date,
	"acquired_amount_usd" bigint,
	"location_id" uuid,
	"source_url" text NOT NULL,
	"is_published" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "record_revisions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"table_name" text NOT NULL,
	"record_id" uuid NOT NULL,
	"changed_by" uuid,
	"change_type" text NOT NULL,
	"diff" jsonb,
	"reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "record_revisions_change_type_check" CHECK ("record_revisions"."change_type" in ('create','update','publish','unpublish','soft_delete'))
);
--> statement-breakpoint
CREATE TABLE "user_profiles" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"display_name" text,
	"role" text DEFAULT 'contributor' NOT NULL,
	"organization" text,
	"bio" text,
	"contributions_approved" integer DEFAULT 0,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_profiles_role_check" CHECK ("user_profiles"."role" in ('contributor','moderator','admin','partner_org'))
);
--> statement-breakpoint
ALTER TABLE "act60_decrees" ADD CONSTRAINT "act60_decrees_beneficiary_id_entities_id_fk" FOREIGN KEY ("beneficiary_id") REFERENCES "public"."entities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaign_resources" ADD CONSTRAINT "campaign_resources_related_entity_id_entities_id_fk" FOREIGN KEY ("related_entity_id") REFERENCES "public"."entities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contributions" ADD CONSTRAINT "contributions_contributor_id_users_id_fk" FOREIGN KEY ("contributor_id") REFERENCES "auth"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contributions" ADD CONSTRAINT "contributions_moderator_id_users_id_fk" FOREIGN KEY ("moderator_id") REFERENCES "auth"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "divestment_campaigns" ADD CONSTRAINT "divestment_campaigns_target_entity_id_entities_id_fk" FOREIGN KEY ("target_entity_id") REFERENCES "public"."entities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "drug_manufacturing" ADD CONSTRAINT "drug_manufacturing_manufacturer_id_entities_id_fk" FOREIGN KEY ("manufacturer_id") REFERENCES "public"."entities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "drug_manufacturing" ADD CONSTRAINT "drug_manufacturing_facility_location_id_locations_id_fk" FOREIGN KEY ("facility_location_id") REFERENCES "public"."locations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "entities" ADD CONSTRAINT "entities_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ers_bond_claims" ADD CONSTRAINT "ers_bond_claims_hedge_fund_id_entities_id_fk" FOREIGN KEY ("hedge_fund_id") REFERENCES "public"."entities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "federal_contracts" ADD CONSTRAINT "federal_contracts_contractor_id_entities_id_fk" FOREIGN KEY ("contractor_id") REFERENCES "public"."entities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "intake_submissions" ADD CONSTRAINT "intake_submissions_assigned_to_users_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "auth"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "locations" ADD CONSTRAINT "locations_entity_id_entities_id_fk" FOREIGN KEY ("entity_id") REFERENCES "public"."entities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "luma_records" ADD CONSTRAINT "luma_records_related_entity_id_entities_id_fk" FOREIGN KEY ("related_entity_id") REFERENCES "public"."entities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "news_article_mentions" ADD CONSTRAINT "news_article_mentions_article_id_news_articles_id_fk" FOREIGN KEY ("article_id") REFERENCES "public"."news_articles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "news_article_mentions" ADD CONSTRAINT "news_article_mentions_entity_id_entities_id_fk" FOREIGN KEY ("entity_id") REFERENCES "public"."entities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pension_investments" ADD CONSTRAINT "pension_investments_pension_fund_id_entities_id_fk" FOREIGN KEY ("pension_fund_id") REFERENCES "public"."entities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pension_investments" ADD CONSTRAINT "pension_investments_hedge_fund_id_entities_id_fk" FOREIGN KEY ("hedge_fund_id") REFERENCES "public"."entities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "promesa_filings" ADD CONSTRAINT "promesa_filings_filed_by_entity_id_entities_id_fk" FOREIGN KEY ("filed_by_entity_id") REFERENCES "public"."entities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "property_records" ADD CONSTRAINT "property_records_owner_id_entities_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."entities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "property_records" ADD CONSTRAINT "property_records_location_id_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "record_revisions" ADD CONSTRAINT "record_revisions_changed_by_users_id_fk" FOREIGN KEY ("changed_by") REFERENCES "auth"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_act60_beneficiary" ON "act60_decrees" USING btree ("beneficiary_id");--> statement-breakpoint
CREATE INDEX "idx_contributions_target" ON "contributions" USING btree ("target_table","target_id");--> statement-breakpoint
CREATE INDEX "idx_contributions_status" ON "contributions" USING btree ("status") WHERE status = 'pending';--> statement-breakpoint
CREATE INDEX "idx_entities_type" ON "entities" USING btree ("entity_type") WHERE deleted_at is null;--> statement-breakpoint
CREATE INDEX "idx_entities_search" ON "entities" USING gin (to_tsvector('simple', "display_name" || ' ' || coalesce("display_name_es", '')));--> statement-breakpoint
CREATE INDEX "idx_entities_aliases" ON "entities" USING gin ("aliases");--> statement-breakpoint
CREATE INDEX "idx_contracts_contractor" ON "federal_contracts" USING btree ("contractor_id");--> statement-breakpoint
CREATE INDEX "idx_contracts_disaster" ON "federal_contracts" USING btree ("related_disaster");--> statement-breakpoint
CREATE INDEX "idx_intake_status" ON "intake_submissions" USING btree ("status") WHERE status in ('new', 'reviewing');--> statement-breakpoint
CREATE INDEX "idx_job_runs_recent" ON "job_runs" USING btree ("job_name","started_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_locations_entity" ON "locations" USING btree ("entity_id");--> statement-breakpoint
CREATE INDEX "idx_locations_geo" ON "locations" USING btree ("latitude","longitude") WHERE latitude is not null;--> statement-breakpoint
CREATE INDEX "idx_articles_published" ON "news_articles" USING btree ("published_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_pension_investments_pension" ON "pension_investments" USING btree ("pension_fund_id");--> statement-breakpoint
CREATE INDEX "idx_pension_investments_hedge" ON "pension_investments" USING btree ("hedge_fund_id");--> statement-breakpoint
CREATE INDEX "idx_promesa_docket" ON "promesa_filings" USING btree ("docket_id");--> statement-breakpoint
CREATE INDEX "idx_revisions_record" ON "record_revisions" USING btree ("table_name","record_id");