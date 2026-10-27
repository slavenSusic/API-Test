import { test, expect } from './fixtures.js';

test.describe('Alerts', () => {
  test('Simple Alert shows a message', async ({ homePage }) => {
    const dialog = await homePage.answerDialog(homePage.simpleAlertButton);

    expect(dialog.type()).toBe('alert');
    expect(dialog.message()).toBe('I am an alert box!');
  });

  test('Confirmation Alert reports OK', async ({ homePage }) => {
    const dialog = await homePage.answerDialog(homePage.confirmButton);

    expect(dialog.type()).toBe('confirm');
    expect(dialog.message()).toBe('Press a button!');
    await expect(homePage.dialogResult).toHaveText('You pressed OK!');
  });

  test('Confirmation Alert reports Cancel', async ({ homePage }) => {
    await homePage.answerDialog(homePage.confirmButton, { accept: false });

    await expect(homePage.dialogResult).toHaveText('You pressed Cancel!');
  });

  test('Prompt Alert greets the entered name', async ({ homePage }) => {
    const dialog = await homePage.answerDialog(homePage.promptButton, {
      promptText: 'Ada',
    });

    expect(dialog.type()).toBe('prompt');
    expect(dialog.message()).toBe('Please enter your name:');
    expect(dialog.defaultValue()).toBe('Harry Potter');
    await expect(homePage.dialogResult).toHaveText('Hello Ada! How are you today?');
  });

  test('Prompt Alert reports a cancelled prompt', async ({ homePage }) => {
    await homePage.answerDialog(homePage.promptButton, { accept: false });

    await expect(homePage.dialogResult).toHaveText('User cancelled the prompt.');
  });
});

test.describe('New windows', () => {
  test.beforeEach(async ({ context }) => {
    // The windows open third-party sites; stub them so only this site's behaviour is tested.
    await context.route(/pavantestingtools\.com|selenium\.dev|playwright\.dev/, (route) =>
      route.fulfill({ contentType: 'text/html', body: '<title>stub</title>' }),
    );
  });

  test('New Tab opens the blog in a new tab', async ({ homePage, page }) => {
    const popupPromise = page.waitForEvent('popup');
    await homePage.newTabButton.click();
    const popup = await popupPromise;

    await expect(popup).toHaveURL('https://www.pavantestingtools.com/');
  });

  test('Popup Windows opens Selenium and Playwright windows', async ({ homePage, page }) => {
    const popups = [];
    page.on('popup', (popup) => popups.push(popup));

    await homePage.popupWindowsButton.click();

    await expect
      .poll(() => popups.map((popup) => popup.url()).toSorted())
      .toEqual(['https://playwright.dev/', 'https://www.selenium.dev/']);
  });
});
