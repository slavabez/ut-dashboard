import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    AUTH_SECRET: z.string().min(1),
    PG_URL: z.string().min(1),
    PUBLIC_FILE_URL: z.string().min(1).optional(),
    ODATA_API_URL: z.string().min(1).optional(),
    ODATA_API_AUTH_HEADER: z.string().min(1).optional(),
  },
  client: {
    NEXT_PUBLIC_APP_URL: z.string().min(1).optional(),
  },
  runtimeEnv: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    AUTH_SECRET: process.env.AUTH_SECRET,
    PG_URL: process.env.PG_URL,
    PUBLIC_FILE_URL: process.env.PUBLIC_FILE_URL,
    ODATA_API_URL: process.env.ODATA_API_URL,
    ODATA_API_AUTH_HEADER: process.env.ODATA_API_AUTH_HEADER,
  },
});
