import { test, expect } from './fixtures.js';

test('Dynamic button toggles between START and STOP', async ({ homePage }) => {
  await expect(homePage.dynamicButton).toHaveText('START');

  await homePage.dynamicButton.click();
  await expect(homePage.dynamicButton).toHaveText('STOP');
  await expect(homePage.dynamicButton).toHaveAttribute('name', 'stop');

  await homePage.dynamicButton.click();
  await expect(homePage.dynamicButton).toHaveText('START');
  await expect(homePage.dynamicButton).toHaveAttribute('name', 'start');
});

test('Mouse hover opens the dropdown menu', async ({ homePage }) => {
  await expect(homePage.hoverMenu).toBeHidden();

  await homePage.pointMeButton.hover();

  await expect(homePage.hoverMenu).toBeVisible();
  await expect(homePage.hoverMenu.getByRole('link')).toHaveText(['Mobiles', 'Laptops']);
});

test('Double click copies Field1 into Field2', async ({ homePage }) => {
  await homePage.field1.fill('Copied by Playwright');
  await expect(homePage.field2).toBeEmpty();

  await homePage.copyTextButton.dblclick();

  await expect(homePage.field2).toHaveValue('Copied by Playwright');
});

test('Drag and drop marks the target as dropped', async ({ homePage }) => {
  await expect(homePage.droppable).toHaveText('Drop here');

  await homePage.draggable.dragTo(homePage.droppable);

  await expect(homePage.droppable).toHaveText('Dropped!');
  await expect(homePage.droppable).toHaveClass(/ui-state-highlight/);
});

test('Slider handles move with the keyboard', async ({ homePage }) => {
  const [minHandle, maxHandle] = await homePage.sliderHandles.all();
  await expect(homePage.priceRange).toHaveValue('$75 - $300');

  await minHandle.press('ArrowRight');
  await minHandle.press('ArrowRight');
  await expect(homePage.priceRange).toHaveValue('$77 - $300');

  await minHandle.press('Home');
  await maxHandle.press('End');
  await expect(homePage.priceRange).toHaveValue('$0 - $500');
});

test('SVG elements draw a red circle, a green rectangle and a blue triangle', async ({
  homePage,
}) => {
  await expect(homePage.svgContainer.locator('svg')).toHaveCount(3);
  await expect(homePage.svgContainer.locator('circle')).toHaveAttribute('fill', 'red');
  await expect(homePage.svgContainer.locator('rect')).toHaveAttribute('fill', 'green');
  await expect(homePage.svgContainer.locator('polygon')).toHaveAttribute('fill', 'blue');
});

test.describe('Scrolling dropdown', () => {
  test('loads more items when scrolled to the bottom', async ({ homePage }) => {
    await homePage.comboBox.click();
    await expect(homePage.comboOptions).toHaveCount(100);

    await homePage.comboOptions.last().scrollIntoViewIfNeeded();

    await expect(homePage.comboOptions).toHaveCount(120);
  });

  test('fills the box with the clicked item', async ({ homePage }) => {
    await homePage.comboBox.click();
    await homePage.comboOptions.getByText('Item 42', { exact: true }).click();

    await expect(homePage.comboBox).toHaveValue('Item 42');
    await expect(homePage.comboOptions.first()).toBeHidden();
  });
});

test('Footer form sections keep their own values', async ({ homePage }) => {
  for (const number of [1, 2, 3]) {
    const section = homePage.formSection(number);
    await expect(section.getByRole('paragraph')).toHaveText(
      `This is a paragraph in Section ${number}.`,
    );
    await section.getByRole('textbox').fill(`Value ${number}`);
    await section.getByRole('button', { name: 'Submit' }).click();
  }

  for (const number of [1, 2, 3]) {
    await expect(homePage.formSection(number).getByRole('textbox')).toHaveValue(
      `Value ${number}`,
    );
  }
});
