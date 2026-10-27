export class HomePage {
  constructor(page) {
    this.page = page;

    // Header and navigation
    this.heading = page.getByRole('heading', { level: 1 });
    this.description = page.getByText('For Selenium, Cypress & Playwright');
    this.pagesNav = page.locator('#PageList2');
    this.footerLinks = this.widget('Footer Links');

    // GUI elements form (its text inputs have broken `for` labels, so use placeholders)
    this.nameInput = page.getByPlaceholder('Enter Name');
    this.emailInput = page.getByPlaceholder('Enter EMail');
    this.phoneInput = page.getByPlaceholder('Enter Phone');
    this.addressInput = page.getByLabel('Address:');
    this.maleRadio = page.getByRole('radio', { name: 'Male', exact: true });
    this.femaleRadio = page.getByRole('radio', { name: 'Female', exact: true });
    this.countrySelect = page.getByLabel('Country:');
    this.colorsSelect = page.getByLabel('Colors:');
    this.animalsSelect = page.getByLabel('Sorted List:');

    // Date pickers
    this.datePicker1 = page.locator('#datepicker');
    this.datePicker2 = page.locator('#txtDate');
    this.calendar = page.locator('#ui-datepicker-div');
    this.startDateInput = page.getByPlaceholder('Start Date');
    this.endDateInput = page.getByPlaceholder('End Date');
    this.dateRangeSubmit = page
      .locator('.date-picker-box')
      .getByRole('button', { name: 'Submit' });
    this.dateRangeResult = page.locator('#result');

    // Upload files
    this.singleFileInput = page.locator('#singleFileInput');
    this.singleFileSubmit = page.getByRole('button', { name: 'Upload Single File' });
    this.singleFileStatus = page.locator('#singleFileStatus');
    this.multipleFilesInput = page.locator('#multipleFilesInput');
    this.multipleFilesSubmit = page.getByRole('button', { name: 'Upload Multiple Files' });
    this.multipleFilesStatus = page.locator('#multipleFilesStatus');

    // Tables
    this.bookTable = this.widget('Static Web Table').getByRole('table');
    this.taskTable = page.locator('#taskTable');
    this.taskTableHeaders = this.taskTable.getByRole('columnheader');
    this.displayedValues = page.locator('#displayValues');
    this.productTable = page.locator('#productTable');
    this.productRows = this.productTable.locator('tbody').getByRole('row');
    this.pagination = page.locator('#pagination');

    // Tabs (Wikipedia search)
    this.wikiSearchInput = page.locator('#Wikipedia1_wikipedia-search-input');
    this.wikiSearchButton = page.locator('.wikipedia-search-button');
    this.wikiResults = page.locator('#Wikipedia1_wikipedia-search-results');
    this.wikiMoreLink = page.locator('#Wikipedia1_wikipedia-search-more').getByRole('link');

    // Dynamic button
    this.dynamicButton = this.widget('Dynamic Button').getByRole('button');

    // Alerts, popups and new windows
    this.simpleAlertButton = page.getByRole('button', { name: 'Simple Alert' });
    this.confirmButton = page.getByRole('button', { name: 'Confirmation Alert' });
    this.promptButton = page.getByRole('button', { name: 'Prompt Alert' });
    this.dialogResult = page.locator('#demo');
    this.newTabButton = page.getByRole('button', { name: 'New Tab' });
    this.popupWindowsButton = page.getByRole('button', { name: 'Popup Windows' });

    // Mouse hover
    this.hoverWidget = this.widget('Mouse Hover');
    this.pointMeButton = this.hoverWidget.getByRole('button', { name: 'Point Me' });
    this.hoverMenu = this.hoverWidget.locator('.dropdown-content');

    // Double click
    this.field1 = page.locator('#field1');
    this.field2 = page.locator('#field2');
    this.copyTextButton = page.getByRole('button', { name: 'Copy Text' });

    // Drag and drop
    this.draggable = page.locator('#draggable');
    this.droppable = page.locator('#droppable');

    // Slider
    this.priceRange = page.getByLabel('Price range:');
    this.sliderHandles = page.locator('#slider-range .ui-slider-handle');

    // SVG elements
    this.svgContainer = page.locator('.svg-container');

    // Scrolling dropdown
    this.comboBox = page.getByPlaceholder('Select an item');
    this.comboOptions = page.locator('#dropdown .option');

    // Labels and links
    this.mobileLabels = page.locator('#mobiles label');
    this.laptopLinks = page.locator('#laptops').getByRole('link');
    this.brokenLinks = page.locator('#broken-links').getByRole('link');

    // ShadowDOM (Playwright locators pierce open shadow roots)
    this.shadowHost = page.locator('#shadow_host');
  }

  goto() {
    return this.page.goto('/');
  }

  /** A sidebar/footer widget, found by its heading. */
  widget(title) {
    return this.page
      .locator('.widget')
      .filter({ has: this.page.getByRole('heading', { name: title, exact: true }) });
  }

  dayCheckbox(day) {
    return this.page.getByRole('checkbox', { name: day, exact: true });
  }

  calendarDay(day) {
    return this.calendar.getByRole('link', { name: String(day), exact: true });
  }

  formSection(number) {
    return this.page.locator(`#section${number}`);
  }

  /** The Dynamic Web Table cell for a process, located by header text since columns are shuffled on every load. */
  async taskCell(processName, column) {
    const columnIndex = (await this.taskTableHeaders.allInnerTexts()).indexOf(column);
    return this.taskTable
      .getByRole('row')
      .filter({ has: this.page.getByRole('cell', { name: processName, exact: true }) })
      .getByRole('cell')
      .nth(columnIndex);
  }

  async goToProductPage(pageNumber) {
    await this.pagination.getByRole('link', { name: String(pageNumber), exact: true }).click();
  }

  /** Clicks `button`, answers the dialog it opens, and returns that dialog. */
  async answerDialog(button, { accept = true, promptText } = {}) {
    const dialogPromise = this.page.waitForEvent('dialog');
    this.page.once('dialog', (dialog) =>
      accept ? dialog.accept(promptText) : dialog.dismiss(),
    );
    await button.click();
    return dialogPromise;
  }
}
