import { getToken } from "@auth/core/jwt";
import { NextRequest } from "next/server";

import { userRoleValues } from "@/drizzle/schema";
import { env } from "@/env";
import {
  DEFAULT_LOGIN_REDIRECT,
  adminOnlyPrefix,
  apiAuthPrefix,
  authRoutes,
  publicRoutes,
} from "@/routes";

const middleware = async (req: NextRequest) => {
  const token = await getToken({
    req,
    secret: env.AUTH_SECRET,
    secureCookie: process.env.NODE_ENV === "production",
    salt:
      process.env.NODE_ENV === "production"
        ? "__Secure-authjs.session-token"
        : "authjs.session-token",
  });
  const isLoggedIn = token?.sub;
  const role = token?.role as userRoleValues | undefined;
  const { nextUrl } = req;

  const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix);
  const isAdminRoute = nextUrl.pathname.startsWith(adminOnlyPrefix);
  const isPublicRoute = publicRoutes.includes(nextUrl.pathname);
  const isAuthRoute = authRoutes.includes(nextUrl.pathname);

  console.log(
    `Middleware called for route ${nextUrl.pathname} as role:${role}`,
    token,
  );

  if (isApiAuthRoute) {
    return;
  }
  if (isAuthRoute) {
    if (isLoggedIn) {
      return Response.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl));
    }
    return;
  }
  if (!isLoggedIn && !isPublicRoute) {
    return Response.redirect(new URL("/auth/login", nextUrl));
  }
  if (isAdminRoute && role !== "admin") {
    return Response.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl));
  }
};

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};

export default middleware;
