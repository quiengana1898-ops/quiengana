import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

// Load local env (gitignored). DIRECT_URL is the unpooled connection — required
// for migrations/introspection (the pooled DATABASE_URL is for app runtime).
config({ path: ".env.local" });

const url = process.env.DIRECT_URL;
if (!url) throw new Error("DIRECT_URL is not set (.env.local)");

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dbCredentials: { url },
  // Only manage the public schema; never touch Supabase's auth/storage schemas.
  schemaFilter: ["public"],
  verbose: true,
  strict: true,
});
