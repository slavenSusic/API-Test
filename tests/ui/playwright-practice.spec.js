import { test, expect } from './fixtures.js';

test.describe('Playwright practice page', () => {
  test('getByRole finds buttons, form controls, navigation and alerts', async ({
    playwrightPracticePage: { roleSection },
  }) => {
    await expect(roleSection.getByRole('button', { name: 'Primary Action' })).toBeEnabled();
    await expect(roleSection.getByRole('button', { name: 'Toggle Button', pressed: false })).toBeVisible();
    await expect(roleSection.getByRole('button', { name: 'Div with button role' })).toBeVisible();

    await roleSection.getByRole('textbox', { name: 'Username:' }).fill('playwright');
    await roleSection.getByRole('checkbox', { name: 'Accept terms' }).check();
    await expect(roleSection.getByRole('textbox', { name: 'Username:' })).toHaveValue('playwright');
    await expect(roleSection.getByRole('checkbox', { name: 'Accept terms' })).toBeChecked();

    await expect(roleSection.getByRole('navigation').getByRole('menuitem')).toHaveText([
      'Home',
      'Products',
      'Contact',
    ]);
    await expect(roleSection.getByRole('alert')).toHaveText('This is an important alert message!');
  });

  test('getByText matches whole and partial text', async ({
    playwrightPracticePage: { textSection },
  }) => {
    await expect(textSection.getByText('important', { exact: true })).toHaveCount(1);
    await expect(textSection.getByText('Special: Unique text identifier')).toBeVisible();
    await expect(textSection.getByText(/^List item \d/)).toHaveCount(2);
    await expect(textSection.getByText('colored text')).toHaveCSS('color', 'rgb(255, 0, 0)');
    await expect(textSection.getByRole('button', { name: 'Submit Form' })).toBeVisible();
  });

  test('getByLabel finds controls by for, wrapping and aria-labelledby labels', async ({
    playwrightPracticePage: { labelSection },
  }) => {
    await labelSection.getByLabel('Email Address:').fill('ada@example.com');
    await labelSection.getByLabel('Password:').fill('not-a-real-password');
    await labelSection.getByLabel('Your Age:').fill('36');
    await labelSection.getByLabel('Express').check();

    await expect(labelSection.getByLabel('Email Address:')).toHaveValue('ada@example.com');
    await expect(labelSection.getByLabel('Password:')).toHaveAttribute('type', 'password');
    await expect(labelSection.getByLabel('Your Age:')).toHaveValue('36');
    await expect(labelSection.getByRole('group', { name: 'Shipping Method' }).getByRole('radio'))
      .toHaveCount(2);
    await expect(labelSection.getByLabel('Express')).toBeChecked();
    await expect(labelSection.getByLabel('Standard')).not.toBeChecked();
  });

  test('getByPlaceholder fills every input', async ({
    playwrightPracticePage: { placeholderSection },
  }) => {
    const inputs = {
      'Enter your full name': 'Ada Lovelace',
      'Phone number (xxx-xxx-xxxx)': '555-123-4567',
      'Type your message here...': 'Hello from Playwright',
      'Search products...': 'laptop',
    };

    for (const [placeholder, value] of Object.entries(inputs)) {
      await placeholderSection.getByPlaceholder(placeholder).fill(value);
      await expect(placeholderSection.getByPlaceholder(placeholder)).toHaveValue(value);
    }
  });

  test('getByAltText finds the logo image', async ({
    playwrightPracticePage: { altTextSection },
  }) => {
    await expect(altTextSection.getByAltText('logo image')).toHaveAttribute(
      'src',
      'https://playwright.dev/img/playwright-logo.svg',
    );
  });

  test('getByTitle finds elements by their title attribute', async ({
    playwrightPracticePage: { titleSection },
  }) => {
    await expect(titleSection.getByTitle('Home page link')).toHaveText('Home');
    await expect(titleSection.getByTitle('HyperText Markup Language')).toHaveText('HTML');
    await expect(titleSection.getByTitle('Tooltip text')).toHaveText('This text has a tooltip');
    await expect(titleSection.getByTitle('Click to save your changes')).toHaveText('Save');
  });

  test('getByTestId finds the profile, products and navigation', async ({
    playwrightPracticePage: { page, testIdSection },
  }) => {
    const profile = testIdSection.getByTestId('user-profile-card');
    await expect(profile.getByTestId('profile-name')).toHaveText('John Doe');
    await expect(profile.getByTestId('profile-email')).toHaveText('john.doe@example.com');
    await expect(profile.getByTestId('edit-profile-btn')).toHaveText('Edit Profile');

    const products = testIdSection.getByTestId('product-grid');
    await expect(products.getByTestId('product-name')).toHaveText(['Product A', 'Product B', 'Product C']);
    await expect(products.getByTestId('product-price')).toHaveText(['$19.99', '$29.99', '$39.99']);
    await expect(
      products.getByTestId(/^product-card-/).filter({ hasText: 'Product B' }).getByTestId('product-price'),
    ).toHaveText('$29.99');

    await expect(testIdSection.getByTestId('main-navigation').getByTestId(/^nav-/)).toHaveText([
      'Home',
      'Products',
      'Contact',
    ]);
    await expect(page.getByTestId('footer-button')).toHaveAttribute('title', 'Back to top');
  });
});
