// This page exists to practise locator strategies, so its tests use page.getBy* directly
// inside each section instead of hiding the locators behind this object.
export class PlaywrightPracticePage {
  constructor(page) {
    this.page = page;
    this.roleSection = page.locator('#role-locators');
    this.textSection = page.locator('#text-locators');
    this.labelSection = page.locator('#label-locators');
    this.placeholderSection = page.locator('#placeholder-locators');
    this.altTextSection = page.locator('#alttext-locators');
    this.titleSection = page.locator('#title-locators');
    this.testIdSection = page.locator('#testid-locators');
  }

  goto() {
    return this.page.goto('/p/playwrightpractice.html');
  }
}
