import createMiddleware from "next-intl/middleware";
import type { NextRequest } from "next/server";

import { routing } from "./i18n/routing";
import { updateSession } from "./lib/supabase/middleware";

const handleI18n = createMiddleware(routing);

// Run next-intl routing first (it produces the response — redirect/rewrite/next),
// then let Supabase refresh the auth session and attach rotated cookies to it.
export default async function proxy(request: NextRequest) {
  const response = handleI18n(request);
  return updateSession(request, response);
}

export const config = {
  // Run on everything except API/auth route handlers, Next internals, and files
  // with an extension. /auth/* are non-localized machine endpoints.
  matcher: ["/((?!api|auth|_next|_vercel|.*\\..*).*)"],
};
