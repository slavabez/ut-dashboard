import bcrypt from "bcryptjs";
import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";

import { getUserByPhoneCached } from "@/data/middleware-specific";
import { LoginSchema } from "@/schemas";

export default {
  providers: [
    Credentials({
      async authorize(credentials) {
        console.log("authorize called");
        const validatedFields = LoginSchema.safeParse(credentials);
        if (validatedFields.success) {
          const { phone, password } = validatedFields.data;

          const user = await getUserByPhoneCached(phone);
          if (!user || !user.password) {
            return null;
          }
          const passwordMatch = await bcrypt.compare(password, user.password);
          if (passwordMatch) {
            return user;
          }
        }
        return null;
      },
    }),
  ],
  trustHost: true,
} satisfies NextAuthConfig;
