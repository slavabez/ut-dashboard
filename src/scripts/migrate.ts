import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

import { env } from "@/env.js";

(async () => {
  const client = postgres(env.PG_URL, {
    max: 1,
  });

  const db = drizzle(client);
  await migrate(db, { migrationsFolder: "drizzle" });
  await client.end();
})();
