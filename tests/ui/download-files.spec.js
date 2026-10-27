import { readFile } from 'node:fs/promises';
import { test, expect } from './fixtures.js';

test.describe('Download files', () => {
  test('hides the download links until a file is generated', async ({ downloadFilesPage }) => {
    await expect(downloadFilesPage.textDownloadLink).toBeHidden();
    await expect(downloadFilesPage.pdfDownloadLink).toBeHidden();
  });

  const files = [
    { type: 'text', button: 'generateTextButton', link: 'textDownloadLink', filename: 'info.txt' },
    { type: 'PDF', button: 'generatePdfButton', link: 'pdfDownloadLink', filename: 'info.pdf' },
  ];

  for (const { type, button, link, filename } of files) {
    test(`downloads the entered text as a ${type} file`, async ({ downloadFilesPage }) => {
      await downloadFilesPage.textInput.fill('Downloaded by Playwright');
      await downloadFilesPage[button].click();
      await expect(downloadFilesPage[link]).toBeVisible();

      const download = await downloadFilesPage.download(downloadFilesPage[link]);

      expect(download.suggestedFilename()).toBe(filename);
      expect(await readFile(await download.path(), 'utf8')).toBe('Downloaded by Playwright');
    });
  }

  test('opens a generated PDF in a new tab', async ({ downloadFilesPage, page }) => {
    // Browsers differ in how a PDF tab loads (headless Chromium never shows it),
    // so record the URL the page opens and check that it serves a PDF.
    await page.evaluate(() => {
      const open = window.open;
      window.open = (url, ...rest) => {
        window.openedUrl = url;
        return open.call(window, url, ...rest);
      };
    });

    const popupPromise = page.waitForEvent('popup');
    await downloadFilesPage.openPdfButton.click();
    await popupPromise;

    const pdfHeader = await page.evaluate(async () =>
      (await (await fetch(window.openedUrl)).text()).slice(0, 5),
    );
    expect(pdfHeader).toBe('%PDF-');
  });
});
