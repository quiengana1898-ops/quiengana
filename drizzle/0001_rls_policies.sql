-- ============================================================
-- Quién Gana — Row-Level Security policies (SPEC §5 RLS + §6 roles)
-- ============================================================
-- This is the security boundary. Read SPEC §5 (RLS requirements) and §6
-- (roles) before changing anything here.
--
-- Model:
--   * Roles live in public.user_profiles.role: contributor | partner_org |
--     moderator | admin. Assignment is manual/admin-only (SPEC §6).
--   * The Supabase SERVICE ROLE bypasses RLS entirely — all ingestion jobs and
--     trusted server actions use it. These policies govern anon + authenticated
--     (anon key) access only.
--   * Public = read published, non-deleted content. Everything else is gated.
--
-- DECISIONS BAKED IN (flagged for operator review):
--   [D1] Contributions edit: SPEC §5 says "create only, no edits after submit";
--        SPEC §6 says contributors may "edit own contributions before approval".
--        ==> Implemented per §6 (edit own while status='pending'). Flip the
--            `contributions_update_own_pending` policy off to honor §5 instead.
--   [D2] Publishing (is_published false->true) is a MODERATOR action: the
--        per-table "moderator_staging" policy lets moderators mutate rows while
--        is_published=false (so they can promote them); once published, only
--        admins can modify. SPEC §6's "re-auth before bulk publish" is enforced
--        at the app layer, not here.
--   [D3] intake_submissions: NO public/contributor read — submitter contact is
--        sensitive (SPEC §12). Anyone may INSERT (the public report form);
--        only moderators+ may read/triage.
--   [D4] Role self-escalation is blocked: contributors may edit their own
--        profile but not change their own `role` (admins change roles).
-- ============================================================

-- ------------------------------------------------------------
-- Role helper functions (SECURITY DEFINER so they bypass RLS on user_profiles
-- and never recurse; STABLE so they use the statement snapshot).
-- ------------------------------------------------------------
create or replace function public.qg_current_role()
  returns text language sql stable security definer set search_path = public as $$
  select role from public.user_profiles where user_id = auth.uid();
$$;

create or replace function public.qg_is_moderator()
  returns boolean language sql stable security definer set search_path = public as $$
  select coalesce(
    (select role from public.user_profiles where user_id = auth.uid())
      in ('moderator', 'admin'),
    false);
$$;

create or replace function public.qg_is_admin()
  returns boolean language sql stable security definer set search_path = public as $$
  select coalesce(
    (select role from public.user_profiles where user_id = auth.uid()) = 'admin',
    false);
$$;

grant execute on function public.qg_current_role() to anon, authenticated;
grant execute on function public.qg_is_moderator() to anon, authenticated;
grant execute on function public.qg_is_admin() to anon, authenticated;

-- ------------------------------------------------------------
-- Enable RLS on every public table (deny-by-default until policies allow).
-- ------------------------------------------------------------
alter table public.entities                enable row level security;
alter table public.locations               enable row level security;
alter table public.pension_investments     enable row level security;
alter table public.ers_bond_claims         enable row level security;
alter table public.act60_decrees           enable row level security;
alter table public.luma_records            enable row level security;
alter table public.promesa_filings         enable row level security;
alter table public.pr_revenue_allocation   enable row level security;
alter table public.federal_contracts       enable row level security;
alter table public.drug_manufacturing      enable row level security;
alter table public.property_records        enable row level security;
alter table public.news_articles           enable row level security;
alter table public.news_article_mentions   enable row level security;
alter table public.campaign_resources      enable row level security;
alter table public.divestment_campaigns    enable row level security;
alter table public.contributions           enable row level security;
alter table public.intake_submissions      enable row level security;
alter table public.record_revisions        enable row level security;
alter table public.job_runs                enable row level security;
alter table public.user_profiles           enable row level security;

-- ============================================================
-- PUBLISHED CONTENT TABLES
-- Pattern: public reads published (non-deleted) rows; moderators manage staging
-- (is_published=false); admins manage everything.
-- ============================================================

-- entities (has deleted_at) ----------------------------------
create policy "entities_public_read" on public.entities
  for select to anon, authenticated
  using (is_published = true and deleted_at is null);
create policy "entities_admin_all" on public.entities
  for all to authenticated
  using (public.qg_is_admin()) with check (public.qg_is_admin());
create policy "entities_moderator_staging" on public.entities
  for all to authenticated
  using (public.qg_is_moderator() and is_published = false)
  with check (public.qg_is_moderator());

-- pension_investments (has deleted_at) -----------------------
create policy "pension_investments_public_read" on public.pension_investments
  for select to anon, authenticated
  using (is_published = true and deleted_at is null);
create policy "pension_investments_admin_all" on public.pension_investments
  for all to authenticated
  using (public.qg_is_admin()) with check (public.qg_is_admin());
create policy "pension_investments_moderator_staging" on public.pension_investments
  for all to authenticated
  using (public.qg_is_moderator() and is_published = false)
  with check (public.qg_is_moderator());

-- ers_bond_claims --------------------------------------------
create policy "ers_bond_claims_public_read" on public.ers_bond_claims
  for select to anon, authenticated using (is_published = true);
create policy "ers_bond_claims_admin_all" on public.ers_bond_claims
  for all to authenticated using (public.qg_is_admin()) with check (public.qg_is_admin());
create policy "ers_bond_claims_moderator_staging" on public.ers_bond_claims
  for all to authenticated
  using (public.qg_is_moderator() and is_published = false)
  with check (public.qg_is_moderator());

-- act60_decrees ----------------------------------------------
create policy "act60_decrees_public_read" on public.act60_decrees
  for select to anon, authenticated using (is_published = true);
create policy "act60_decrees_admin_all" on public.act60_decrees
  for all to authenticated using (public.qg_is_admin()) with check (public.qg_is_admin());
create policy "act60_decrees_moderator_staging" on public.act60_decrees
  for all to authenticated
  using (public.qg_is_moderator() and is_published = false)
  with check (public.qg_is_moderator());

-- luma_records -----------------------------------------------
create policy "luma_records_public_read" on public.luma_records
  for select to anon, authenticated using (is_published = true);
create policy "luma_records_admin_all" on public.luma_records
  for all to authenticated using (public.qg_is_admin()) with check (public.qg_is_admin());
create policy "luma_records_moderator_staging" on public.luma_records
  for all to authenticated
  using (public.qg_is_moderator() and is_published = false)
  with check (public.qg_is_moderator());

-- promesa_filings --------------------------------------------
create policy "promesa_filings_public_read" on public.promesa_filings
  for select to anon, authenticated using (is_published = true);
create policy "promesa_filings_admin_all" on public.promesa_filings
  for all to authenticated using (public.qg_is_admin()) with check (public.qg_is_admin());
create policy "promesa_filings_moderator_staging" on public.promesa_filings
  for all to authenticated
  using (public.qg_is_moderator() and is_published = false)
  with check (public.qg_is_moderator());

-- pr_revenue_allocation --------------------------------------
create policy "pr_revenue_allocation_public_read" on public.pr_revenue_allocation
  for select to anon, authenticated using (is_published = true);
create policy "pr_revenue_allocation_admin_all" on public.pr_revenue_allocation
  for all to authenticated using (public.qg_is_admin()) with check (public.qg_is_admin());
create policy "pr_revenue_allocation_moderator_staging" on public.pr_revenue_allocation
  for all to authenticated
  using (public.qg_is_moderator() and is_published = false)
  with check (public.qg_is_moderator());

-- federal_contracts ------------------------------------------
create policy "federal_contracts_public_read" on public.federal_contracts
  for select to anon, authenticated using (is_published = true);
create policy "federal_contracts_admin_all" on public.federal_contracts
  for all to authenticated using (public.qg_is_admin()) with check (public.qg_is_admin());
create policy "federal_contracts_moderator_staging" on public.federal_contracts
  for all to authenticated
  using (public.qg_is_moderator() and is_published = false)
  with check (public.qg_is_moderator());

-- drug_manufacturing -----------------------------------------
create policy "drug_manufacturing_public_read" on public.drug_manufacturing
  for select to anon, authenticated using (is_published = true);
create policy "drug_manufacturing_admin_all" on public.drug_manufacturing
  for all to authenticated using (public.qg_is_admin()) with check (public.qg_is_admin());
create policy "drug_manufacturing_moderator_staging" on public.drug_manufacturing
  for all to authenticated
  using (public.qg_is_moderator() and is_published = false)
  with check (public.qg_is_moderator());

-- property_records -------------------------------------------
create policy "property_records_public_read" on public.property_records
  for select to anon, authenticated using (is_published = true);
create policy "property_records_admin_all" on public.property_records
  for all to authenticated using (public.qg_is_admin()) with check (public.qg_is_admin());
create policy "property_records_moderator_staging" on public.property_records
  for all to authenticated
  using (public.qg_is_moderator() and is_published = false)
  with check (public.qg_is_moderator());

-- campaign_resources -----------------------------------------
create policy "campaign_resources_public_read" on public.campaign_resources
  for select to anon, authenticated using (is_published = true);
create policy "campaign_resources_admin_all" on public.campaign_resources
  for all to authenticated using (public.qg_is_admin()) with check (public.qg_is_admin());
create policy "campaign_resources_moderator_staging" on public.campaign_resources
  for all to authenticated
  using (public.qg_is_moderator() and is_published = false)
  with check (public.qg_is_moderator());

-- divestment_campaigns ---------------------------------------
create policy "divestment_campaigns_public_read" on public.divestment_campaigns
  for select to anon, authenticated using (is_published = true);
create policy "divestment_campaigns_admin_all" on public.divestment_campaigns
  for all to authenticated using (public.qg_is_admin()) with check (public.qg_is_admin());
create policy "divestment_campaigns_moderator_staging" on public.divestment_campaigns
  for all to authenticated
  using (public.qg_is_moderator() and is_published = false)
  with check (public.qg_is_moderator());

-- ============================================================
-- PUBLIC-READ TABLES WITHOUT is_published
-- locations (derived from published entities) + the news wire are public read;
-- writes happen via service-role ingestion. Moderators+ may also manage.
-- ============================================================
create policy "locations_public_read" on public.locations
  for select to anon, authenticated using (true);
create policy "locations_moderator_all" on public.locations
  for all to authenticated using (public.qg_is_moderator()) with check (public.qg_is_moderator());

create policy "news_articles_public_read" on public.news_articles
  for select to anon, authenticated using (true);
create policy "news_articles_moderator_all" on public.news_articles
  for all to authenticated using (public.qg_is_moderator()) with check (public.qg_is_moderator());

create policy "news_article_mentions_public_read" on public.news_article_mentions
  for select to anon, authenticated using (true);
create policy "news_article_mentions_moderator_all" on public.news_article_mentions
  for all to authenticated using (public.qg_is_moderator()) with check (public.qg_is_moderator());

-- ============================================================
-- CONTRIBUTIONS (Completar el Expediente)
-- ============================================================
-- Public sees only approved + publicly-visible contributions.
create policy "contributions_public_read" on public.contributions
  for select to anon, authenticated
  using (status = 'approved' and visibility in ('public', 'attributed', 'anonymous'));
-- Contributors see their own (any status).
create policy "contributions_read_own" on public.contributions
  for select to authenticated using (contributor_id = auth.uid());
-- Moderators see all.
create policy "contributions_moderator_read" on public.contributions
  for select to authenticated using (public.qg_is_moderator());
-- INSERT: authenticated only, attributed to self (SPEC §6: account required).
create policy "contributions_insert_own" on public.contributions
  for insert to authenticated with check (contributor_id = auth.uid());
-- [D1] Edit own while pending (SPEC §6). Remove to honor SPEC §5 (create-only).
create policy "contributions_update_own_pending" on public.contributions
  for update to authenticated
  using (contributor_id = auth.uid() and status = 'pending')
  with check (contributor_id = auth.uid() and status = 'pending');
-- Moderators moderate (approve/reject/flag).
create policy "contributions_moderator_update" on public.contributions
  for update to authenticated
  using (public.qg_is_moderator()) with check (public.qg_is_moderator());
-- Admins full access (incl. delete; SPEC §6 requires app-layer re-auth).
create policy "contributions_admin_all" on public.contributions
  for all to authenticated using (public.qg_is_admin()) with check (public.qg_is_admin());

-- ============================================================
-- INTAKE SUBMISSIONS (public report form)
-- [D3] Anyone may submit; only moderators+ may read/triage. No public read.
-- ============================================================
create policy "intake_insert_public" on public.intake_submissions
  for insert to anon, authenticated with check (true);
create policy "intake_moderator_read" on public.intake_submissions
  for select to authenticated using (public.qg_is_moderator());
create policy "intake_moderator_update" on public.intake_submissions
  for update to authenticated using (public.qg_is_moderator()) with check (public.qg_is_moderator());
create policy "intake_admin_all" on public.intake_submissions
  for all to authenticated using (public.qg_is_admin()) with check (public.qg_is_admin());

-- ============================================================
-- AUDIT & SYSTEM (no public/contributor access)
-- record_revisions + job_runs are internal. Service role writes; admins read.
-- ============================================================
create policy "record_revisions_moderator_read" on public.record_revisions
  for select to authenticated using (public.qg_is_moderator());
create policy "record_revisions_admin_all" on public.record_revisions
  for all to authenticated using (public.qg_is_admin()) with check (public.qg_is_admin());

create policy "job_runs_moderator_read" on public.job_runs
  for select to authenticated using (public.qg_is_moderator());
create policy "job_runs_admin_all" on public.job_runs
  for all to authenticated using (public.qg_is_admin()) with check (public.qg_is_admin());

-- ============================================================
-- USER PROFILES
-- [D4] Read own; edit own but NOT own role; admins manage all.
-- ============================================================
create policy "user_profiles_read_own" on public.user_profiles
  for select to authenticated using (user_id = auth.uid());
create policy "user_profiles_moderator_read" on public.user_profiles
  for select to authenticated using (public.qg_is_moderator());
create policy "user_profiles_insert_self" on public.user_profiles
  for insert to authenticated with check (user_id = auth.uid() and role = 'contributor');
-- STABLE qg_current_role() returns the pre-update role, so new.role must match
-- it -> a contributor cannot escalate their own role.
create policy "user_profiles_update_own" on public.user_profiles
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid() and role = public.qg_current_role());
create policy "user_profiles_admin_all" on public.user_profiles
  for all to authenticated using (public.qg_is_admin()) with check (public.qg_is_admin());
