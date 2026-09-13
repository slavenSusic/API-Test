# API Test Suite

Playwright API tests for [JSONPlaceholder](https://jsonplaceholder.typicode.com/), with Allure result collection and HTML reporting.

## Requirements

- Node.js 18 or newer
- npm
- Java 8 or newer for the Allure command-line tool
- Internet access while running the tests; the suite calls the public JSONPlaceholder API

## Setup

Install the project dependencies:

```bash
npm ci
```

Create your local environment file:

```bash
cp .env.example .env
```

The test configuration loads `.env` automatically. `API_BASE_URL` is required and deliberately has no hardcoded fallback. In CI, provide `API_BASE_URL` through the environment instead of committing an `.env` file.

Install the Playwright browser binaries if the suite includes browser tests now or in the future:

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
npx playwright test
```

The configuration defines Chromium, Firefox, and WebKit projects, so the full command executes each test under all three project configurations.

Run a single test file:

```bash
npx playwright test tests/posts.spec.js
```

Run one project only:

```bash
npx playwright test --project=chromium
```

Run a test by title:

```bash
npx playwright test --grep "Validate schema"
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
allure serve allure-results
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
├── playwright.config.js       Playwright projects and reporters
├── tests/
│   ├── json-placeholder.js    JSONPlaceholder API client
│   ├── posts.spec.js          API test cases
│   └── schemas/               JSON schemas used for contract validation
├── allure-results/            Raw Allure results (generated)
└── allure-report/             Generated HTML report (generated)
```

## Troubleshooting

**No Allure results are generated**

Run Playwright without overriding the configured reporters. The project configuration registers both the terminal line reporter and `allure-playwright`.

**The `allure` command is not found**

Install `allure-commandline` globally and verify that npm's global binary directory is available on your `PATH`.

**The Allure command reports a Java error**

Install Java 8 or newer, then make sure `JAVA_HOME` points to that installation.

**API tests fail unexpectedly**

Confirm that `.env` exists, `API_BASE_URL` is set, and the configured service is reachable. The test suite depends on that external service and its responses.
