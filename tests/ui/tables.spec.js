import { test, expect } from './fixtures.js';

test.describe('Static web table', () => {
  test('shows every book', async ({ homePage }) => {
    await expect(homePage.bookTable).toMatchAriaSnapshot(`
      - table:
        - rowgroup:
          - row "BookName Author Subject Price"
          - row "Learn Selenium Amit Selenium 300"
          - row "Learn Java Mukesh Java 500"
          - row "Learn JS Animesh Javascript 300"
          - row "Master In Selenium Mukesh Selenium 3000"
          - row "Master In Java Amod JAVA 2000"
          - row "Master In JS Amit Javascript 1000"
    `);
  });

  test('finds the books written by one author', async ({ homePage, page }) => {
    const mukeshBooks = homePage.bookTable
      .getByRole('row')
      .filter({ has: page.getByRole('cell', { name: 'Mukesh', exact: true }) });

    await expect(mukeshBooks.locator('td:first-child')).toHaveText([
      'Learn Java',
      'Master In Selenium',
    ]);
  });

  test('book prices add up to 7100', async ({ homePage }) => {
    const prices = await homePage.bookTable
      .getByRole('row')
      .locator('td:nth-child(4)')
      .allInnerTexts();

    expect(prices.reduce((sum, price) => sum + Number(price), 0)).toBe(7100);
  });
});

test.describe('Dynamic web table', () => {
  const displayed = [
    { label: 'CPU load of Chrome process', process: 'Chrome', column: 'CPU (%)' },
    { label: 'Memory Size of Firefox process', process: 'Firefox', column: 'Memory (MB)' },
    { label: 'Network speed of Chrome process', process: 'Chrome', column: 'Network (Mbps)' },
    { label: 'Disk space of Firefox process', process: 'Firefox', column: 'Disk (MB/s)' },
  ];

  for (const { label, process, column } of displayed) {
    test(`"${label}" matches the table`, async ({ homePage }) => {
      await expect(homePage.taskTableHeaders).toHaveCount(5);

      const cell = await homePage.taskCell(process, column);
      const value = homePage.displayedValues
        .getByRole('paragraph')
        .filter({ hasText: label })
        .locator('strong');

      await expect(value).toHaveText(await cell.innerText());
    });
  }

  test('keeps Name first and shuffles the other columns', async ({ homePage }) => {
    await expect(homePage.taskTableHeaders.first()).toHaveText('Name');
    const headers = await homePage.taskTableHeaders.allInnerTexts();

    expect(headers.slice(1).toSorted()).toEqual(
      ['CPU (%)', 'Disk (MB/s)', 'Memory (MB)', 'Network (Mbps)'],
    );
  });
});

test.describe('Pagination web table', () => {
  test('shows five products per page across four pages', async ({ homePage }) => {
    await expect(homePage.pagination.getByRole('link')).toHaveText(['1', '2', '3', '4']);

    const ids = [];
    for (const pageNumber of [1, 2, 3, 4]) {
      await homePage.goToProductPage(pageNumber);
      await expect(homePage.pagination.locator('a.active')).toHaveText(String(pageNumber));
      await expect(homePage.productRows).toHaveCount(5);
      await expect(homePage.productRows.first().getByRole('cell').first())
        .toHaveText(String((pageNumber - 1) * 5 + 1));
      ids.push(...await homePage.productRows.locator('td:first-child').allInnerTexts());
    }

    expect(ids.map(Number)).toEqual(Array.from({ length: 20 }, (_, i) => i + 1));
  });

  test('selects a product on another page', async ({ homePage, page }) => {
    await homePage.goToProductPage(3);
    const router = homePage.productRows.filter({
      has: page.getByRole('cell', { name: 'Router', exact: true }),
    });

    await router.getByRole('checkbox').check();

    await expect(router.getByRole('checkbox')).toBeChecked();
    await expect(router.getByRole('cell').nth(2)).toHaveText('$24.99');
  });
});
