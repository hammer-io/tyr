import assert from 'assert';
import fs from 'fs-extra';
import eol from 'eol';

import { generateSkadiFiles} from '../dist/services/skadi-service';
import { generateSequelizeFiles } from '../dist/services/sequelize-service';
import { generateBasicNodeFiles } from '../dist/services/project-service';
import { generateExpressFiles } from '../dist/services/express-service';

let input = {};
describe('Skadi Service Test', () => {

  beforeEach(async () => {
    input = JSON.parse(fs.readFileSync('test/test-configurations/valid-configuration-with-skadi', 'utf-8'));
    await generateBasicNodeFiles(input, `${process.cwd()}/test-skadi`);
    await generateExpressFiles(`${process.cwd()}/test-skadi`);
  });

  it('should update the package.json file with the skadi dependency', async () => {
    await generateSkadiFiles(input, `${process.cwd()}/test-skadi`);

    const expectedContents = '{\n' +
      ' "name": "test-skadi",\n' +
      ' "version": "0.0.0",\n' +
      ' "description": "test-project",\n' +
      ' "main": "src/index.js",\n' +
      ' "scripts": {\n' +
      '  "start": "node src/index.js",\n' +
      '  "test": ""\n' +
      ' },\n' +
      ' "repository": {},\n' +
      ' "authors": [\n' +
      '  ""\n' +
      ' ],\n' +
      ' "license": "MIT",\n' +
      ' "bin": {},\n' +
      ' "dependencies": {\n' +
      '  "config": "^1.3.0",\n' +
      '  "express": "^4.16.0",\n' +
      '  "skadi-hammerio": "^0.0.1"\n' +
      ' },\n' +
      ' "devDependencies": {}\n' +
      '}';

    assert.equal(fs.existsSync('test-skadi/package.json'), true);
    assert.equal(eol.auto(fs.readFileSync('test-skadi/package.json', 'utf-8')), eol.auto(expectedContents));
  });

  describe('should create an index.js file', () => {
    it('should create an index.js file when sequelize is used', async () => {
      input.toolingConfigurations.orm = 'Sequelize';
      input.credentials = {};
      input.credentials.sequelize = {};
      input.credentials.sequelize.username = 'root';
      input.credentials.sequelize.password = 'root';
      await generateSequelizeFiles(input, `${process.cwd()}/test-skadi`);
      await generateSkadiFiles(input, `${process.cwd()}/test-skadi`);
      const expectedContents = '' +
        'const skadi = require(\'skadi-hammerio\');\n' +
        'const sequelize = require(\'./db/sequelize\');\n' +
        'const express = require(\'express\');\n' +
        'const routes = require(\'./routes\');\n' +
        '\n' +
        '// set our port\n' +
        'const port = process.env.PORT || 8080;\n' +
        '\n' +
        'const app = express();\n' +
        '\n' +
        'skadi.heartbeat();\n' +
        'skadi.osdata();\n' +
        '\n' +
        'app.use((req, res, next) => {\n' +
        '  skadi.captureRequestData(req);\n' +
        '  next();\n' +
        '});\n' +
        '\n' +
        '// routes\n' +
        'app.use(\'/\', routes);\n' +
        '\n' +
        'app.use((req, res, next) => {\n' +
        '  skadi.captureResponseData(req, res);\n' +
        '});\n' +
        '\n' +
        '// start app at localhost:8080\n' +
        'app.listen(port);\n' +
        '\n' +
        'console.log(`Listening on ${port}`);\n' +
        'module.exports = app;';

      assert.equal(fs.existsSync('test-skadi/src/index.js'), true);
      assert.equal(eol.auto(fs.readFileSync('test-skadi/src/index.js', 'utf-8')), eol.auto(expectedContents));
    });

    it('should create an index.js file when sequelize is not used', async () => {
      await generateSkadiFiles(input, `${process.cwd()}/test-skadi`);

      const expectedContents = 'const skadi = require(\'skadi-hammerio\');\n' +
        'const express = require(\'express\');\n' +
        'const routes = require(\'./routes\');\n' +
        '\n' +
        '// set our port\n' +
        'const port = process.env.PORT || 8080;\n' +
        '\n' +
        'const app = express();\n' +
        '\n' +
        'skadi.heartbeat();\n' +
        'skadi.osdata();\n' +
        '\n' +
        'app.use((req, res, next) => {\n' +
        '  skadi.captureRequestData(req);\n' +
        '  next();\n' +
        '});\n' +
        '\n' +
        '// routes\n' +
        'app.use(\'/\', routes);\n' +
        '\n' +
        'app.use((req, res, next) => {\n' +
        '  skadi.captureResponseData(req, res);\n' +
        '});\n' +
        '\n' +
        '// start app at localhost:8080\n' +
        'app.listen(port);\n' +
        '\n' +
        'console.log(`Listening on ${port}`);\n' +
        'module.exports = app;' +
        '';


      assert.equal(fs.existsSync('test-skadi/src/index.js'), true);
      assert.equal(eol.auto(fs.readFileSync('test-skadi/src/index.js', 'utf-8')), eol.auto(expectedContents));
    });
  });

  it('should create a .skadiconfig.json file', async () => {
    await generateSkadiFiles(input, `${process.cwd()}/test-skadi`);

    const expectedContents = '{\n' +
      ' "interval": "1000",\n' +
      ' "apiKey": "bff198fa-3afd-42d4-a884-9954a4384870",\n' +
      ' "heartbeatUrl": "http://localhost:3001/api/v1/heartbeats",\n' +
      ' "osDataUrl": "http://localhost:3001/api/v1/osdata",\n' +
      ' "httpDataUrl": "http://localhost:3001/api/v1/httpdata"\n' +
      '}';

    assert.equal(fs.existsSync('test-skadi/.skadiconfig.json'), true);
    assert.equal(eol.auto(fs.readFileSync('test-skadi/.skadiconfig.json', 'utf-8')), eol.auto(expectedContents));
  });

  afterEach(() => {
    fs.removeSync('test-skadi');
  });
});