export class HiddenElementsPage {
  constructor(page) {
    this.page = page;
    // The footer "Form" widget reuses #input1/#input2, so stay inside the page's own container.
    const container = page.locator('#container');

    this.inputBox1 = container.getByLabel('Input Box 1:');
    this.inputBox2 = container.locator('#input2');
    this.checkbox1 = container.getByLabel('Checkbox 1');
    this.checkbox2 = container.getByLabel('Checkbox 2');
    this.toggleInputButton = container.getByRole('button', { name: 'Toggle Input Box 2' });
    this.toggleCheckboxButton = container.getByRole('button', { name: 'Toggle Checkbox 2' });
    this.loadContentButton = container.getByRole('button', { name: 'Load AJAX Content' });
    this.status = container.locator('#statusLabel');
    this.ajaxContent = container.locator('#ajaxContent');
  }

  goto() {
    return this.page.goto('/p/gui-elements-ajax-hidden.html');
  }
}
