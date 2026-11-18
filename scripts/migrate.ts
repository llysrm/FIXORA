/**
 * Run pending Drizzle migrations against the configured database.
 * Run: npm run db:migrate
 */
import "dotenv/config";
import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import { migrate } from "drizzle-orm/libsql/migrator";
import * as schema from "../db/schema";

const url = process.env.TURSO_DATABASE_URL || "file:./local.db";
const client = createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN || undefined });
const db = drizzle(client, { schema });

async function main() {
  console.log("Running migrations against:", url);
  await migrate(db, { migrationsFolder: "./drizzle" });
  console.log("Migrations complete.");
}

main()
  .then(() => process.exit(0))
  .catch((e) => { console.error(e); process.exit(1); });
