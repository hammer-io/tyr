import assert from 'assert';
import fs from 'fs-extra';
import eol from 'eol';

import {generateMochaFiles} from '../dist/services/mocha-service';
import { generateExpressFiles } from '../dist/services/express-service';

describe('Mocha Service Test', () => {
  describe('generateMochaFiles()', () => {
    beforeEach(() => {
      fs.mkdirSync('test-mocha');
      fs.writeFileSync('test-mocha/package.json', "{\n" +
        "  \"name\": \"test-mocha\",\n" +
        "  \"version\": \"0.0.0\",\n" +
        "  \"description\": \"test-project\",\n" +
        "  \"main\": \"src/index.js\",\n" +
        "  \"scripts\": {\n" +
        "    \"start\": \"node src/index.js\",\n" +
        "  \"test\": \"\"\n" +
        "  },\n" +
        "  \"repository\": {},\n" +
        "  \"authors\": [],\n" +
        "  \"license\": \"\",\n" +
        "  \"bin\": {},\n" +
        "  \"dependencies\": {},\n" +
        "  \"devDependencies\": {\n" +
        "  }\n" +
        "}");
    });

    it('should generate a test file for mocha', async () => {
      const expectedMochaContents = "const assert = require('assert');\n" +
        "\n" +
        "describe('A sample test', () => {\n" +
        "  it('Assert false is the opposite of true', () => {\n" +
        "    assert(true, !false);\n" +
        "  })\n" +
        "});";

      await generateMochaFiles('test-mocha');

      assert.equal(fs.existsSync('test-mocha/test/test.js'), true);
      assert.equal(eol.auto(fs.readFileSync('test-mocha/test/test.js', 'utf-8')), eol.auto(expectedMochaContents));
    });

    it('should add mocha as a dev dependency and update the test script', async () => {
      const expectedPackageJsonContents = "{\n" +
        " \"name\": \"test-mocha\",\n" +
        " \"version\": \"0.0.0\",\n" +
        " \"description\": \"test-project\",\n" +
        " \"main\": \"src/index.js\",\n" +
        " \"scripts\": {\n" +
        "  \"start\": \"node src/index.js\",\n" +
        "  \"test\": \"mocha\"\n" +
        " },\n" +
        " \"repository\": {},\n" +
        " \"authors\": [],\n" +
        " \"license\": \"\",\n" +
        " \"bin\": {},\n" +
        " \"dependencies\": {},\n" +
        " \"devDependencies\": {\n" +
        "  \"mocha\": \"3.5.3\"\n" +
        " }\n" +
        "}";


      await generateMochaFiles('test-mocha');

      assert.equal(fs.existsSync('test-mocha/package.json'), true);
      assert.equal(eol.auto(fs.readFileSync('test-mocha/package.json', 'utf-8')), eol.auto(expectedPackageJsonContents));
    });

    afterEach(() => {
      fs.removeSync('test-mocha');
      fs.removeSync('test-mocha/test.js');
    });
  });
});