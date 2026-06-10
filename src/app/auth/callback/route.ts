import { type NextRequest, NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

// PKCE code-exchange flow — what the DEFAULT Supabase magic-link email template
// hits (it redirects to emailRedirectTo with ?code=...). Works without editing
// the email template.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/entrar?error=auth`);
}
