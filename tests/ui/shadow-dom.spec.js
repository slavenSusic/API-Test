import { test, expect } from './fixtures.js';

test.describe('Shadow DOM', () => {
  test('shows text from the shadow root and the nested shadow root', async ({ homePage }) => {
    await expect(homePage.shadowHost.locator('#shadow_content')).toHaveText('Mobiles');
    await expect(homePage.shadowHost.locator('#nested_shadow_content')).toHaveText('Laptops');
  });

  test('controls inside the shadow root are usable', async ({ homePage }) => {
    const textbox = homePage.shadowHost.getByRole('textbox');
    const checkbox = homePage.shadowHost.getByRole('checkbox');
    const fileInput = homePage.shadowHost.locator('input[type="file"]');

    await textbox.fill('typed in the shadow DOM');
    await checkbox.check();
    await fileInput.setInputFiles({ name: 'notes.txt', mimeType: 'text/plain', buffer: Buffer.from('hi') });

    await expect(textbox).toHaveValue('typed in the shadow DOM');
    await expect(checkbox).toBeChecked();
    await expect(fileInput).toHaveValue(/notes\.txt$/);
  });

  test('links point to the blog and the YouTube channel', async ({ homePage }) => {
    await expect(homePage.shadowHost.getByRole('link', { name: 'Blog' })).toHaveAttribute(
      'href',
      'https://www.pavantestingtools.com/',
    );
    await expect(homePage.widget('ShadowDOM').getByRole('link', { name: 'Youtube' }))
      .toHaveAttribute('href', 'https://www.youtube.com/@sdetpavan/videos');
  });
});
