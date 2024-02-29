import { config } from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { nomenclatureTypes, syncLogs } from "@/drizzle/schema";

config({
  path: ".env.local",
});

if (!process.env.PG_URL) {
  throw new Error("PG_URL environment variable is not set");
}

(async () => {
  const client = postgres(process.env.PG_URL ?? "", {
    max: 1,
  });

  const db = drizzle(client);
  // Delete all data from the database
  console.log("Clearing the database");
  await db.delete(nomenclatureTypes);
  console.log("Cleared nomenclatureTypes");
  await db.delete(syncLogs);
  console.log("Cleared syncLogs");

  await client.end();
})();
