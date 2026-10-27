// @ts-check
import 'dotenv/config';
import { defineConfig, devices } from '@playwright/test';

const { API_BASE_URL, UI_BASE_URL } = process.env;

for (const [name, value] of Object.entries({ API_BASE_URL, UI_BASE_URL })) {
  if (!value) {
    throw new Error(
      `${name} is required. See .env.example for the expected value.`,
    );
  }
}

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [['line'], ['allure-playwright']],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    /* API tests need no browser, so they run once instead of once per browser. */
    {
      name: 'api',
      testDir: './tests/api',
      use: { baseURL: API_BASE_URL },
    },

    /* UI tests against major browsers. */
    {
      name: 'chromium',
      testDir: './tests/ui',
      use: { ...devices['Desktop Chrome'], baseURL: UI_BASE_URL },
    },

    {
      name: 'firefox',
      testDir: './tests/ui',
      use: { ...devices['Desktop Firefox'], baseURL: UI_BASE_URL },
    },

    {
      name: 'webkit',
      testDir: './tests/ui',
      use: { ...devices['Desktop Safari'], baseURL: UI_BASE_URL },
    },
  ],
});
