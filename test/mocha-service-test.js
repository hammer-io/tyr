import assert from 'assert';
import fs from 'fs-extra';

import {generateMochaFiles} from '../dist/services/mocha-service';

describe('Mocha Service Test', () => {
  describe('generateMochaFiles()', () => {

    beforeEach(() => {
      fs.mkdirSync('test-mocha');
    });

    it('should generate a test for mocha', async () => {

      const expectedMochaContents = "const assert = require('assert');\n" +
        "\n" +
        "describe('A sample test', () => {\n" +
        "  it('Assert false is the opposite of true', () => {\n" +
        "    assert(true, !false);\n" +
        "  })\n" +
        "});";

      await generateMochaFiles('test-mocha');

      assert.equal(fs.existsSync('test-mocha/test.js'), true);
      assert.equal(fs.readFileSync('test-mocha/test.js', 'utf-8'), expectedMochaContents);
    });

    afterEach(() => {
      fs.removeSync('test-mocha');
    });
  });
});