import "server-only";

import { createClient } from "@supabase/supabase-js";

/**
 * Service-role Supabase client — BYPASSES RLS (SPEC §12). Server-only:
 * the `server-only` import makes the build fail if this is ever imported into a
 * client bundle. Use ONLY in trusted server code (ingestion jobs, admin
 * server actions). Never in component render paths or anything reachable by an
 * unauthenticated request without an explicit authorization check.
 */
export function createAdminClient() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
