import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "@/drizzle/schema";
import { env } from "@/env.js";

const client = postgres(env.PG_URL, {
  max: 20,
});

export const db = drizzle(client, { schema });
