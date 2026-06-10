import { type NextRequest, NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  await supabase.auth.signOut();
  // 303 so the browser issues a GET to the redirect target.
  return NextResponse.redirect(new URL("/", request.url), { status: 303 });
}
