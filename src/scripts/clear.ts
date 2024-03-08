import { config } from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import {
  manufacturers,
  measurementUnits,
  nomenclatureTypes,
  nomenclatures,
  partners,
  syncLogs,
} from "@/drizzle/schema";

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
  console.log("Dropping the database...");

  await db.delete(syncLogs);
  console.log("Dropped syncLogs");
  await db.delete(measurementUnits);
  console.log("Dropped measurementUnits");
  await db.delete(partners);
  console.log("Dropped partners");
  await db.delete(nomenclatures);
  console.log("Dropped nomenclature items");
  await db.delete(nomenclatureTypes);
  console.log("Dropped nomenclatureTypes");
  await db.delete(manufacturers);
  console.log("Dropped manufacturers");

  await client.end();
})();
