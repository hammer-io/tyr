import assert from 'assert';
import fs from 'fs-extra';

import {npmInstall} from '../dist/services/node-service';

describe('Node Service Test', () => {
  describe('npmInstall()', () => {
    beforeEach(() => {
      fs.mkdirSync('test-npm-install');
      fs.mkdirSync('test-npm-install/src');
      fs.writeFileSync('test-npm-install/package.json', "{\n" +
        "  \"name\": \"test-npm-install\",\n" +
        "  \"version\": \"0.0.0\",\n" +
        "  \"description\": \"test-npm-install\",\n" +
        "  \"main\": \"src/index.js\",\n" +
        "  \"scripts\": {\n" +
        "    \"start\": \"node src/index.js\",\n" +
        "    \"test\": \"mocha\"\n" +
        "  },\n" +
        "  \"repository\": {},\n" +
        "  \"authors\": [],\n" +
        "  \"license\": \"\",\n" +
        "  \"bin\": {},\n" +
        "  \"dependencies\": {},\n" +
        "  \"devDependencies\": {\n" +
        "    \"mocha\": \"3.5.3\"\n" +
        "  }\n" +
        "}");
    });

    it('should run npm install', () => {
      npmInstall('test-npm-install')
      assert.equal(fs.existsSync('test-npm-install/node_modules'), true);
      assert.equal(fs.existsSync('test-npm-install/package-lock.json'), true);
    }).timeout(10000);

    afterEach(() => {
      fs.removeSync('test-npm-install');
    })
  });
});