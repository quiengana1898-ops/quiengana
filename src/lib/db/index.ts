import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema";

// App runtime uses the pooled connection (DATABASE_URL, Supabase transaction
// pooler). prepare:false is required for transaction-pooling (pgBouncer) mode.
const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is not set");

const client = postgres(connectionString, { prepare: false });

export const db = drizzle(client, { schema });
export { schema };
