import { createBrowserClient } from "@supabase/ssr";

// Browser (client component) Supabase client. Uses the public anon key — never
// the service role key (SPEC §12). Safe to call from "use client" components.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
