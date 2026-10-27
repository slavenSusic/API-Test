import { test as base, expect } from '@playwright/test';
import { HomePage } from './pages/home-page.js';
import { HiddenElementsPage } from './pages/hidden-elements-page.js';
import { DownloadFilesPage } from './pages/download-files-page.js';
import { PlaywrightPracticePage } from './pages/playwright-practice-page.js';

/** Builds a fixture that opens the page object's page before the test. */
const opened = (PageObject) => async ({ page }, use) => {
  const pageObject = new PageObject(page);
  const response = await pageObject.goto();
  // The site answers 503 or 429 when rate-limited; fail here instead of timing out inside the test.
  expect(response?.status(), `Loading ${page.url()}`).toBe(200);
  await use(pageObject);
};

// Page HTML already downloaded by this worker, by URL. The site rate-limits repeated loads
// (Google answers 429 on CI runners), so each worker fetches every page once per run.
const pageCache = new Map();

export const test = base.extend({
  page: async ({ page, baseURL }, use) => {
    await page.route(`${baseURL}/**`, async (route) => {
      if (route.request().resourceType() !== 'document') return route.fallback();

      const url = route.request().url();
      if (!pageCache.has(url)) {
        const response = await route.fetch();
        if (!response.ok()) return route.fulfill({ response });
        pageCache.set(url, await response.text());
      }
      return route.fulfill({ contentType: 'text/html; charset=UTF-8', body: pageCache.get(url) });
    });


    // Visitors from the EU get Blogger's cookie notice, which covers the page and intercepts clicks.
    // Removing it instead of clicking "OK" keeps tests deterministic without giving consent.
    await page.addLocatorHandler(page.locator('#cookieChoiceInfo'), (notice) =>
      notice.evaluate((element) => element.remove()),
    );
    await use(page);
  },
  homePage: opened(HomePage),
  hiddenElementsPage: opened(HiddenElementsPage),
  downloadFilesPage: opened(DownloadFilesPage),
  playwrightPracticePage: opened(PlaywrightPracticePage),
});

export { expect };
