import { test, expect } from './fixtures.js';

const notes = { name: 'notes.txt', mimeType: 'text/plain', buffer: Buffer.from('hello') };
const data = { name: 'data.json', mimeType: 'application/json', buffer: Buffer.from('{}') };

test.describe('Upload files', () => {
  test('reports the selected single file', async ({ homePage }) => {
    await homePage.singleFileInput.setInputFiles(notes);
    await homePage.singleFileSubmit.click();

    await expect(homePage.singleFileStatus).toHaveText(
      'Single file selected: notes.txt, Size: 5 bytes, Type: text/plain',
    );
  });

  test('reports every selected file', async ({ homePage }) => {
    await homePage.multipleFilesInput.setInputFiles([notes, data]);
    await homePage.multipleFilesSubmit.click();

    await expect(homePage.multipleFilesStatus).toContainText('Multiple files selected:');
    await expect(homePage.multipleFilesStatus).toContainText(
      'notes.txt, Size: 5 bytes, Type: text/plain',
    );
    await expect(homePage.multipleFilesStatus).toContainText(
      'data.json, Size: 2 bytes, Type: application/json',
    );
  });

  test('asks for a file when none is selected', async ({ homePage }) => {
    await homePage.singleFileSubmit.click();
    await homePage.multipleFilesSubmit.click();

    await expect(homePage.singleFileStatus).toHaveText('No file selected.');
    await expect(homePage.multipleFilesStatus).toHaveText('No files selected.');
  });
});
