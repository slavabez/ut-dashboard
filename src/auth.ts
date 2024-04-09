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
  ...authConfig,
});
