import { DrizzleAdapter } from "@auth/drizzle-adapter";
import NextAuth, { DefaultSession } from "next-auth";

import authConfig from "@/auth.config";
import { getUserById } from "@/data/user";
import { db } from "@/drizzle/db";
import { userRoleValues } from "@/drizzle/schema";

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
  callbacks: {
    async signIn({ user }) {
      return !!(await getUserById(user.id ?? ""));
    },
    async session({ token, session }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }
      if (token.role && session.user) {
        session.user.role = token.role as userRoleValues;
      }
      if (token.phone) session.user.phone = token.phone as string;
      if (token.name) session.user.name = token.name as string;

      return session;
    },
    async jwt({ token }) {
      if (!token.sub) return token;
      const user = await getUserById(token.sub);
      if (!user) return token;
      token.role = user.role;
      token.phone = user.phone;
      token.name = user.name;

      return token;
    },
  },
  adapter: DrizzleAdapter(db),
  session: {
    strategy: "jwt",
  },
  ...authConfig,
});
