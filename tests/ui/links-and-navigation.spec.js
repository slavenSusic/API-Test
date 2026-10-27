import { test, expect } from './fixtures.js';

test.describe('Header and navigation', () => {
  test('shows the site title and description', async ({ homePage, page }) => {
    await expect(page).toHaveTitle('Automation Testing Practice');
    await expect(homePage.heading).toHaveText('Automation Testing Practice');
    await expect(homePage.description).toBeVisible();
  });

  test('top navigation lists every page', async ({ homePage }) => {
    await expect(homePage.pagesNav).toMatchAriaSnapshot(`
      - list:
        - listitem:
          - link "Home":
            - /url: http://testautomationpractice.blogspot.com/
        - listitem:
          - link "Udemy Courses":
            - /url: https://www.pavanonlinetrainings.com/#udemy
        - listitem:
          - link "Online Trainings":
            - /url: https://www.pavanonlinetrainings.com/
        - listitem:
          - link "Blog":
            - /url: https://www.pavantestingtools.com/
        - listitem:
          - link "PlaywrightPractice":
            - /url: https://testautomationpractice.blogspot.com/p/playwrightpractice.html
    `);
  });

  const internalPages = [
    { links: 'pagesNav', name: 'PlaywrightPractice', path: '/p/playwrightpractice.html' },
    { links: 'footerLinks', name: 'Hidden Elements & AJAX', path: '/p/gui-elements-ajax-hidden.html' },
    { links: 'footerLinks', name: 'Download Files', path: '/p/download-files_25.html' },
  ];

  for (const { links, name, path } of internalPages) {
    test(`"${name}" link opens its page`, async ({ homePage, page }) => {
      await homePage[links].getByRole('link', { name, exact: true }).click();

      await expect(page).toHaveURL(path);
      await expect(page).toHaveTitle(`Automation Testing Practice: ${name}`);
    });
  }
});

test.describe('Labels and links', () => {
  test('lists the mobile labels', async ({ homePage }) => {
    await expect(homePage.mobileLabels).toHaveText(['Samsung', 'Real Me', 'Moto']);
  });

  test('laptop links point to the vendor sites', async ({ homePage }) => {
    await expect(homePage.laptopLinks).toHaveText(['Apple', 'Lenovo', 'Dell']);
    for (const [index, site] of ['apple', 'lenovo', 'dell'].entries()) {
      await expect(homePage.laptopLinks.nth(index)).toHaveAttribute(
        'href',
        `https://www.${site}.com/`,
      );
    }
  });

  test('each broken link points at the error page for its code', async ({ homePage }) => {
    const codes = ['400', '401', '403', '404', '408', '500', '502', '503'];
    await expect(homePage.brokenLinks).toHaveText(codes.map((code) => `Errorcode ${code}`));

    for (const [index, code] of codes.entries()) {
      await expect(homePage.brokenLinks.nth(index)).toHaveAttribute(
        'href',
        `http://www.deadlinkcity.com/error-page.asp?e=${code}`,
      );
    }
  });

  test('every broken link really is broken', async ({ homePage, request, browserName }) => {
    test.skip(browserName !== 'chromium', 'Checks HTTP responses only, so one browser is enough');

    const hrefs = await homePage.brokenLinks.evaluateAll((links) => links.map((link) => link.href));
    // A link that times out or refuses the connection counts as broken too.
    const statuses = await Promise.all(
      hrefs.map((href) =>
        request.get(href, { timeout: 10_000 }).then((response) => response.status(), () => 'no response'),
      ),
    );

    for (const [index, status] of statuses.entries()) {
      expect
        .soft(status === 'no response' || status >= 400, `${hrefs[index]} answered ${status}`)
        .toBe(true);
    }
  });
});

test.describe('Wikipedia search', () => {
  /** The widget calls Wikipedia's opensearch API via JSONP; answer it locally so tests are deterministic. */
  async function mockWikipedia(page, titles) {
    await page.route(/en\.wikipedia\.org\/w\/api\.php/, (route) => {
      const url = new URL(route.request().url());
      const callback = url.searchParams.getAll('callback').at(-1);
      const results = [url.searchParams.get('search'), titles];
      return route.fulfill({
        contentType: 'application/javascript',
        body: `${callback}(${JSON.stringify(results)})`,
      });
    });
  }

  test('shows the first five results and a link to the rest', async ({ homePage, page }) => {
    await mockWikipedia(page, [
      'Playwright', 'Playwright (software)', 'Playwrights Horizons', 'Playwriting',
      'Playwright Award', 'Playwrights Guild', 'Playwrights Center',
    ]);

    await homePage.wikiSearchInput.fill('playwright');
    await homePage.wikiSearchButton.click();

    await expect(homePage.wikiResults.getByRole('link')).toHaveText([
      'Playwright', 'Playwright (software)', 'Playwrights Horizons', 'Playwriting', 'Playwright Award',
    ]);
    await expect(homePage.wikiResults.getByRole('link', { name: 'Playwright (software)' }))
      .toHaveAttribute('href', 'https://en.wikipedia.org/wiki/Playwright_(software)');
    await expect(homePage.wikiMoreLink).toHaveText('More »');
    await expect(homePage.wikiMoreLink).toHaveAttribute('href', /search=playwright/);
  });

  test('says when nothing is found', async ({ homePage, page }) => {
    await mockWikipedia(page, []);

    await homePage.wikiSearchInput.fill('qwxzv');
    await homePage.wikiSearchButton.click();

    await expect(homePage.wikiResults).toHaveText('No results found.');
  });
});
