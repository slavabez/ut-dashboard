import { defineConfig, devices } from "@playwright/test";

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
require("dotenv").config({
  path: ".env.test.local",
});

const E2E_BASE_URL = process.env.E2E_BASE_URL;

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: "./tests",
  /* Run tests in files in parallel */
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: E2E_BASE_URL ?? "http://localhost:3000",
    trace: "on-first-retry",
  },
  testMatch: "**/*.e2e.ts",
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },

    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },

    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },

    /* Test against mobile viewports. */
    {
      name: "Mobile Chrome",
      use: { ...devices["Pixel 5"] },
    },
    {
      name: "Mobile Safari",
      use: { ...devices["iPhone SE"] },
    },
  ],

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: "npm run dev",
  //   url: baseURL,
  //   reuseExistingServer: !process.env.CI,
  //   env: {
  //     PORT,
  //     NODE_ENV: "test",
  //     AUTH_SECRET: "test-secret",
  //     PG_URL:
  //       process.env.PG_URL ??
  //       "postgresql://e2e-user:e2e-password@postgres:5432/test-db",
  //     NEXT_PUBLIC_APP_URL:
  //       process.env.NEXT_PUBLIC_APP_URL ?? `http://localhost:${PORT}`,
  //     ODATA_API_URL: process.env.ODATA_API_URL ?? "",
  //     ODATA_API_AUTH_HEADER: process.env.ODATA_API_AUTH_HEADER ?? "",
  //     REDIS_HOST: process.env.REDIS_HOST ?? "",
  //     REDIS_PORT: process.env.REDIS_PORT ?? "",
  //     REDIS_PASSWORD: process.env.REDIS_PASSWORD ?? "",
  //   },
  // },
});
