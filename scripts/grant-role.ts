/**
 * Grant a role to a user by email (designate moderators/admins).
 * The user must have signed in at least once (so an auth.users row exists).
 * Run: npm run admin:grant -- you@example.com admin
 */
import { config } from "dotenv";
config({ path: ".env.local" });

import postgres from "postgres";

const VALID = ["contributor", "partner_org", "moderator", "admin"];

async function main() {
  const email = process.argv[2];
  const role = process.argv[3] ?? "admin";
  if (!email || !VALID.includes(role)) {
    console.error("usage: npm run admin:grant -- <email> <contributor|partner_org|moderator|admin>");
    process.exit(1);
  }

  const sql = postgres(process.env.DIRECT_URL!, { prepare: false });
  const users = await sql`select id from auth.users where email = ${email}`;
  if (users.length === 0) {
    console.error(`No auth user for ${email}. They must sign in once first.`);
    process.exit(1);
  }
  const userId = users[0].id;
  await sql`
    insert into public.user_profiles (user_id, role)
    values (${userId}, ${role})
    on conflict (user_id) do update set role = ${role}, updated_at = now()`;
  console.log(`granted ${role} to ${email}`);
  await sql.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
