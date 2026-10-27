# API & UI Test Suite

Playwright tests with Allure result collection and HTML reporting:

- **API tests** for [JSONPlaceholder](https://jsonplaceholder.typicode.com/)
- **UI tests** for [Automation Testing Practice](https://testautomationpractice.blogspot.com/), covering every page and widget of the site in Chromium, Firefox and WebKit

## Requirements

- Node.js 18 or newer
- npm
- Java 8 or newer for the Allure command-line tool
- Internet access while running the tests; the suite calls the public JSONPlaceholder API and loads the public practice site

## Setup

Install the project dependencies:

```bash
npm ci
```

Create your local environment file:

```bash
cp .env.example .env
```

The test configuration loads `.env` automatically. `API_BASE_URL` and `UI_BASE_URL` are required and deliberately have no hardcoded fallback. In CI, provide them through the environment instead of committing an `.env` file.

Install the Playwright browser binaries used by the UI tests:

```bash
npx playwright install
```

The Playwright integration for Allure is already included in the project. To generate and open HTML reports, install the Allure command-line tool once:

```bash
npm install --global allure-commandline
allure --version
```

If `allure --version` fails, confirm that Java is installed and that the npm global binary directory is on your `PATH`.

## Running tests

Run the complete suite:

```bash
npm test
```

The configuration defines an `api` project, which runs the API tests once, and `chromium`, `firefox` and `webkit` projects, which run every UI test in each browser.

Run only the API tests, or only the UI tests:

```bash
npm run test:api
```

```bash
npm run test:ui
```

Run a single test file:

```bash
npx playwright test tests/ui/tables.spec.js
```

Run one browser only:

```bash
npx playwright test --project=chromium
```

Run a test by title:

```bash
npx playwright test --grep "Validate schema"
```

Watch and step through UI tests in UI mode:

```bash
npx playwright test --ui
```

For debugging, run tests sequentially with the Playwright inspector:

```bash
npx playwright test --debug --workers=1
```

## Allure reports

Every test run writes raw Allure data to `allure-results/`. Generate the HTML report after the tests finish:

```bash
allure generate allure-results --clean --output allure-report
```

Open the generated report:

```bash
allure open allure-report
```

For a shorter local workflow, generate a temporary report and open it immediately:

```bash
npm run report
```

Allure appends data to an existing results directory. Remove old results before a run when the report should contain only the latest execution:

```bash
rm -rf allure-results allure-report
npx playwright test
allure generate allure-results --clean --output allure-report
```

Both Allure directories are excluded from Git and should remain local build artifacts.

## Project layout

```text
.
├── playwright.config.js           Playwright projects and reporters
├── tests/
│   ├── api/
│   │   ├── json-placeholder.js    JSONPlaceholder API client
│   │   ├── posts.spec.js          API test cases
│   │   └── schemas/               JSON schemas used for contract validation
│   └── ui/
│       ├── fixtures.js            Page object fixtures and the cookie-notice handler
│       ├── pages/                 Page objects, one per page of the site
│       └── *.spec.js              UI test cases, one file per feature area
├── allure-results/                Raw Allure results (generated)
└── allure-report/                 Generated HTML report (generated)
```

### UI test conventions

- Tests get a ready, opened page object from a fixture (`homePage`, `hiddenElementsPage`, `downloadFilesPage`, `playwrightPracticePage`) instead of navigating themselves.
- Locators prefer what a user sees: role, label, placeholder, text. IDs are used only where the site gives an element no accessible name.
- Assertions are web-first (`await expect(locator)...`), so they wait and retry; there are no fixed sleeps.
- Third-party services are stubbed with `page.route`/`context.route` (Wikipedia search, sites opened in new windows), so a test fails only when the practice site breaks. The one exception is the broken-links check, which calls the real links and runs in Chromium only.
- The AJAX test uses Playwright's fake clock to skip the page's 3-second delay.
- The site rate-limits repeated page loads (Google answers 429 to CI runners), so each test worker downloads every page once per run and serves later visits from memory.
- Visitors from the EU get a Google cookie notice that covers the page. A locator handler removes it instead of clicking "OK", so tests never give consent.

## Troubleshooting

**No Allure results are generated**

Run Playwright without overriding the configured reporters. The project configuration registers both the terminal line reporter and `allure-playwright`.

**The `allure` command is not found**

Install `allure-commandline` globally and verify that npm's global binary directory is available on your `PATH`.

**The Allure command reports a Java error**

Install Java 8 or newer, then make sure `JAVA_HOME` points to that installation.

**Tests fail unexpectedly**

Confirm that `.env` exists, `API_BASE_URL` and `UI_BASE_URL` are set, and both sites are reachable. The tests depend on those external services and their content.

**Browser executable doesn't exist**

Run `npx playwright install` after installing or updating `@playwright/test`.
