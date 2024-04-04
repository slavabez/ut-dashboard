import { config } from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "@/drizzle/schema";

config({
  path: ".env.test",
});

const client = postgres(process.env.PG_URL ?? "", {
  max: 20,
});

export const testDb = drizzle(client, { schema });
