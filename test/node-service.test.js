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
        "    \"test\": \"\"\n" +
        "  },\n" +
        "  \"repository\": {},\n" +
        "  \"authors\": [],\n" +
        "  \"license\": \"\",\n" +
        "  \"bin\": {},\n" +
        "  \"dependencies\": {},\n" +
        "  \"devDependencies\": {}\n" +
        "}");
    });

    it('should run npm install', async () => {
      await npmInstall('test-npm-install');
      if(process.version.startsWith("v8")) { // node 8 doesn't create node modules folder for no dependencies
        assert.equal(fs.existsSync('test-npm-install/node_modules'), false); // a basic node project has no dependencies
      } else  { // node 6 creates node modules for no dependencies
        assert.equal(fs.existsSync('test-npm-install/node_modules'), true); // a basic node project has no dependencies
      }
    }).timeout(10000);

    afterEach(() => {
      fs.removeSync('test-npm-install');
    })
  });
});