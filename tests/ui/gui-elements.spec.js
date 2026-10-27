import { test, expect } from './fixtures.js';

test.describe('GUI elements form', () => {
  test('fills the text inputs and the address', async ({ homePage }) => {
    await homePage.nameInput.fill('Ada Lovelace');
    await homePage.emailInput.fill('ada@example.com');
    await homePage.phoneInput.fill('0123456789');
    await homePage.addressInput.fill('12 Analytical Engine St\nLondon');

    await expect(homePage.nameInput).toHaveValue('Ada Lovelace');
    await expect(homePage.emailInput).toHaveValue('ada@example.com');
    await expect(homePage.phoneInput).toHaveValue('0123456789');
    await expect(homePage.addressInput).toHaveValue('12 Analytical Engine St\nLondon');
  });

  test('limits the text inputs to their maximum length', async ({ homePage }) => {
    await homePage.nameInput.pressSequentially('A name longer than fifteen');
    await homePage.phoneInput.pressSequentially('0123456789999');

    await expect(homePage.nameInput).toHaveValue('A name longer t');
    await expect(homePage.phoneInput).toHaveValue('0123456789');
  });

  test('allows only one gender to be selected', async ({ homePage }) => {
    await homePage.maleRadio.check();
    await expect(homePage.maleRadio).toBeChecked();
    await expect(homePage.femaleRadio).not.toBeChecked();

    await homePage.femaleRadio.check();
    await expect(homePage.femaleRadio).toBeChecked();
    await expect(homePage.maleRadio).not.toBeChecked();
  });

  test('checks and unchecks days independently', async ({ homePage }) => {
    const weekend = ['Saturday', 'Sunday'];
    for (const day of weekend) {
      await homePage.dayCheckbox(day).check();
    }

    for (const day of weekend) {
      await expect(homePage.dayCheckbox(day)).toBeChecked();
    }
    await expect(homePage.dayCheckbox('Monday')).not.toBeChecked();

    await homePage.dayCheckbox('Sunday').uncheck();
    await expect(homePage.dayCheckbox('Sunday')).not.toBeChecked();
    await expect(homePage.dayCheckbox('Saturday')).toBeChecked();
  });

  test('lists the countries and selects one', async ({ homePage }) => {
    await expect(homePage.countrySelect.getByRole('option')).toHaveText([
      'United States', 'Canada', 'United Kingdom', 'Germany', 'France',
      'Australia', 'Japan', 'China', 'Brazil', 'India',
    ]);

    await homePage.countrySelect.selectOption({ label: 'Japan' });
    await expect(homePage.countrySelect).toHaveValue('japan');
  });

  test('selects several colors', async ({ homePage }) => {
    await homePage.colorsSelect.selectOption(['blue', 'yellow', 'white']);

    await expect(homePage.colorsSelect).toHaveValues(['blue', 'yellow', 'white']);
  });

  test('colors list repeats Red and Green', async ({ homePage }) => {
    const colors = (await homePage.colorsSelect.getByRole('option').allTextContents())
      .map((color) => color.trim());

    const duplicates = colors.filter((color, index) => colors.indexOf(color) !== index);
    expect(duplicates).toEqual(['Red', 'Green']);
  });

  test('sorted list is in alphabetical order', async ({ homePage }) => {
    const animals = (await homePage.animalsSelect.getByRole('option').allTextContents())
      .map((animal) => animal.trim());

    expect(animals).toHaveLength(10);
    expect(animals).toEqual(animals.toSorted());
  });
});

test.describe('Date pickers', () => {
  test('Date Picker 1 selects a day from the next month', async ({ homePage }) => {
    const now = new Date();
    const target = new Date(now.getFullYear(), now.getMonth() + 1, 15);
    const month = String(target.getMonth() + 1).padStart(2, '0');

    await homePage.datePicker1.click();
    await expect(homePage.calendar).toBeVisible();
    await homePage.calendar.getByTitle('Next').click();
    await homePage.calendarDay(15).click();

    await expect(homePage.datePicker1).toHaveValue(`${month}/15/${target.getFullYear()}`);
    await expect(homePage.calendar).toBeHidden();
  });

  test('Date Picker 1 accepts a typed date', async ({ homePage }) => {
    await homePage.datePicker1.fill('12/25/2030');

    await expect(homePage.datePicker1).toHaveValue('12/25/2030');
  });

  test('Date Picker 2 selects a leap day with the month and year dropdowns', async ({
    homePage,
  }) => {
    await homePage.datePicker2.click();
    await homePage.calendar.locator('.ui-datepicker-year').selectOption('2024');
    await homePage.calendar.locator('.ui-datepicker-month').selectOption({ label: 'Feb' });
    await homePage.calendarDay(29).click();

    await expect(homePage.datePicker2).toHaveValue('29/02/2024');
  });

  test('Date Picker 3 counts the days in a range', async ({ homePage }) => {
    await homePage.startDateInput.fill('2024-01-01');
    await homePage.endDateInput.fill('2024-01-31');
    await homePage.dateRangeSubmit.click();

    await expect(homePage.dateRangeResult).toHaveText('You selected a range of 30 days.');
  });

  test('Date Picker 3 rejects an end date before the start date', async ({ homePage }) => {
    await homePage.startDateInput.fill('2024-02-10');
    await homePage.endDateInput.fill('2024-02-01');
    await homePage.dateRangeSubmit.click();

    await expect(homePage.dateRangeResult).toHaveText('End date must be after start date.');
  });

  test('Date Picker 3 requires both dates', async ({ homePage }) => {
    await homePage.startDateInput.fill('2024-02-10');
    await homePage.dateRangeSubmit.click();

    await expect(homePage.dateRangeResult).toHaveText('Please select both start and end dates.');
  });
});
