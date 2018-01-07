import assert from 'assert';
import fs from 'fs-extra';
import eol from 'eol';

import {readFile, loadTemplate, writeFile} from '../dist/utils/files/file';

describe('Test File Util', () => {
  before(() => {
    fs.mkdirSync(__dirname + '/files');
    fs.writeFileSync(__dirname + '/files/test', 'Hello, World');
  });

  describe('readFile()', () => {
    it('should read a file and return the contents', async () => {
      const contents = await readFile(__dirname + '/files/test');
      assert.equal(contents, 'Hello, World');

    });

    it('should throw an error if something goes wrong', () => {
      try {
        readFile(__dirname + 'notARealFile');
        assert.equal(true, false, 'This function should throw an error');
      } catch (error) {
        assert.equal(error.message, 'Failed to read file ' + __dirname + 'notARealFile!');
      }
    });
  });

  describe('loadTemplate()', () => {
    it('should load a template file ', () => {
      const expectedContents = "language: node_js\n" +
        "node_js:\n" +
        "  - '5'\n" +
        "\n" +
        "notifications:\n" +
        "  email:\n" +
        "    on_success: never";
        const actualContents = loadTemplate('../../../templates/travis/travis.yml');
        assert.equal(eol.auto(actualContents), eol.auto(expectedContents));

    });

    it('should throw an error if something goes wrong', () => {
      try {
        loadTemplate('notARealFile');
        assert.equal(true, false, 'This function should throw an error');
      } catch (error) {
        assert.equal(error.message, 'Failed to read template notARealFile!');
      }
    });
  });

  describe('writeFile()', () => {
    it('should write the contents to a file', () => {
      const exepctedContentsAfterFileWrite = 'Hello, World';
      writeFile(__dirname + '/files/test1', exepctedContentsAfterFileWrite);

      assert.equal(fs.existsSync(__dirname + '/files/test1'), true);
      assert.equal(fs.readFileSync(__dirname + '/files/test1', 'utf-8'), exepctedContentsAfterFileWrite);
    });

    it('should throw an error if it cannot write to a file', () => {
      try {
        const exepctedContentsAfterFileWrite = 'Hello, World';
        writeFile(__dirname + '/files/test/test1', exepctedContentsAfterFileWrite);
        assert.equal(true, false, 'This function should throw an error');
      } catch (error) {
        assert.equal(error.message, 'Failed to write ' + __dirname + '/files/test/test1!');
      }

      afterEach(() => {
        fs.removeSync('Failed to write ' + __dirname + '/files/test/test1');
      })
    });
  });

  after(() => {
    fs.removeSync(__dirname + '/files/test');
    fs.removeSync(__dirname + '/files');
  });
});