import { DrizzleAdapter } from "@auth/drizzle-adapter";
import bcrypt from "bcryptjs";
import NextAuth, { DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";

import { db } from "@/drizzle/db";
import { userRoleValues } from "@/drizzle/schema";
import { getUserById, getUserByPhoneCached } from "@/lib/user";
import { LoginSchema } from "@/schemas";

export type ExtendedUser = DefaultSession["user"] & {
  role: userRoleValues;
  phone: string;
};

declare module "next-auth" {
  interface Session {
    user: ExtendedUser;
  }
}

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  providers: [
    Credentials({
      async authorize(credentials) {
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
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
  callbacks: {
    async signIn({ user }) {
      return !!(await getUserById(user.id ?? ""));
    },
    async session(props) {
      const { token, session } = props;
      if (token.sub && session.user) session.user.id = token.sub;
      if (token.role && session.user) {
        session.user.role = token.role as userRoleValues;
      }
      if (session.user) {
        session.user.phone = token.phone as string;
      }

      return session;
    },
    async jwt(props) {
      const { token } = props;
      if (!token.sub) return token;
      try {
        const user = await getUserById(token.sub);

        if (!user) return token;
        token.role = user.role;
        token.phone = user.phone;
        token.name = user.name;

        return token;
      } catch (e) {
        console.error(e);
        return token;
      }
    },
  },
  adapter: DrizzleAdapter(db),
  session: {
    strategy: "jwt",
  },
  trustHost: true,
});
