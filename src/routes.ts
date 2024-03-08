/**
 * @description Publicly accessible routes
 */
export const publicRoutes = ["/"];

/**
 * @description Authenticated routes.
 * These are used for authentication.
 * Logged in users will be redirected to /profile
 */
export const authRoutes = [
  "/auth/login",
  "/auth/register",
  "/auth/error",
  "/auth/reset",
];

/**
 * @description Prefix for API auth routes.
 */
export const apiAuthPrefix = "/api/auth";

/**
 * @description Default post-login redirect.
 */
export const DEFAULT_LOGIN_REDIRECT = `/profile`;
