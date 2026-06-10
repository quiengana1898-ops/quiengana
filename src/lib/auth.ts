import "server-only";

import { eq } from "drizzle-orm";

import { db, schema } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";

export type Role = "contributor" | "partner_org" | "moderator" | "admin";

/** The verified Supabase user for this request, or null. */
export async function getSessionUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/** Role from user_profiles (read via Drizzle — no supabase-js needed). */
export async function getUserRole(userId: string): Promise<Role | null> {
  const [row] = await db
    .select({ role: schema.userProfiles.role })
    .from(schema.userProfiles)
    .where(eq(schema.userProfiles.userId, userId))
    .limit(1);
  return (row?.role as Role | undefined) ?? null;
}

export type ModeratorContext = { userId: string; role: Role };

/**
 * Returns {userId, role} iff the current session is a moderator or admin, else
 * null. Call this in BOTH the admin layout AND every privileged server action —
 * never trust the layout gate alone.
 */
export async function getModeratorContext(): Promise<ModeratorContext | null> {
  const user = await getSessionUser();
  if (!user) return null;
  const role = await getUserRole(user.id);
  if (role === "moderator" || role === "admin") return { userId: user.id, role };
  return null;
}
