export class DownloadFilesPage {
  constructor(page) {
    this.page = page;
    this.textInput = page.getByLabel('Enter Text:');
    this.generateTextButton = page.getByRole('button', { name: 'Generate and Download Text File' });
    this.textDownloadLink = page.getByRole('link', { name: 'Download Text File' });
    this.generatePdfButton = page.getByRole('button', { name: 'Generate and Download PDF File' });
    this.pdfDownloadLink = page.getByRole('link', { name: 'Download PDF File' });
    this.openPdfButton = page.getByRole('button', { name: 'Download PDF File', exact: true });
  }

  goto() {
    return this.page.goto('/p/download-files_25.html');
  }

  /** Clicks `link` and resolves with the download it starts. */
  async download(link) {
    const downloadPromise = this.page.waitForEvent('download');
    await link.click();
    return downloadPromise;
  }
}
