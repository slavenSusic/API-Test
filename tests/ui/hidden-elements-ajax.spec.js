import { test, expect } from './fixtures.js';

test.describe('Hidden elements & AJAX', () => {
  test('starts with Input Box 2 and Checkbox 2 hidden', async ({ hiddenElementsPage }) => {
    await expect(hiddenElementsPage.status).toHaveText('Ready');
    await expect(hiddenElementsPage.inputBox1).toBeVisible();
    await expect(hiddenElementsPage.checkbox1).toBeVisible();
    await expect(hiddenElementsPage.inputBox2).toBeHidden();
    await expect(hiddenElementsPage.checkbox2).toBeHidden();
  });

  test('toggles Input Box 2', async ({ hiddenElementsPage }) => {
    await hiddenElementsPage.toggleInputButton.click();
    await expect(hiddenElementsPage.inputBox2).toBeVisible();
    await expect(hiddenElementsPage.status).toHaveText('Input Box 2 shown');

    await hiddenElementsPage.inputBox2.fill('now visible');
    await expect(hiddenElementsPage.inputBox2).toHaveValue('now visible');

    await hiddenElementsPage.toggleInputButton.click();
    await expect(hiddenElementsPage.inputBox2).toBeHidden();
    await expect(hiddenElementsPage.status).toHaveText('Input Box 2 hidden');
  });

  test('toggles Checkbox 2', async ({ hiddenElementsPage }) => {
    await hiddenElementsPage.toggleCheckboxButton.click();
    await expect(hiddenElementsPage.checkbox2).toBeVisible();
    await expect(hiddenElementsPage.status).toHaveText('Checkbox 2 shown');

    await hiddenElementsPage.checkbox2.check();
    await expect(hiddenElementsPage.checkbox2).toBeChecked();

    await hiddenElementsPage.toggleCheckboxButton.click();
    await expect(hiddenElementsPage.checkbox2).toBeHidden();
    await expect(hiddenElementsPage.status).toHaveText('Checkbox 2 hidden');
  });

  test('loads the AJAX content after its 3 second delay', async ({ hiddenElementsPage, page }) => {
    // A fake clock skips the page's 3 s setTimeout instead of waiting for it.
    await page.clock.install();
    await hiddenElementsPage.loadContentButton.click();
    await expect(hiddenElementsPage.ajaxContent).toBeEmpty();
    await expect(hiddenElementsPage.status).toHaveText('Ready');

    await page.clock.runFor(3_000);
    await expect(
      hiddenElementsPage.ajaxContent.getByRole('heading', { name: 'AJAX Content Loaded' }),
    ).toBeVisible();
    await expect(hiddenElementsPage.ajaxContent).toContainText(
      'This is some dynamic content loaded through AJAX.',
    );
    await expect(hiddenElementsPage.status).toHaveText('AJAX content loaded');
  });
});
