import assert from 'assert';
import fs from 'fs-extra';

import {generateSequelizeFiles} from '../dist/services/sequelize-service';
import * as projectService from '../dist/services/project-service';

describe('Sequelize Service Test', () => {
  describe('generateSequelizeFiles()', async () => {
    beforeEach(async () => {
      const configs = JSON.parse(fs.readFileSync('test/test-configurations/valid-project-configuration-sequalize'));
      const projectName = configs.projectConfigurations.projectName;
      // generate the basic node files
      await projectService.generateBasicNodeFiles(configs, `${process.cwd()}/${projectName}`);

      // then create the sequelize files
      await generateSequelizeFiles(configs, `${process.cwd()}/${projectName}`);
    });

    it('should create the config/default.json file', () => {
      const expected = "{}";

      assert.equal(fs.readFileSync('test-sequelize/config/default.json', 'utf-8'), expected);
    });

    it('should create the config/default-example.json file', () => {
      const expected = "{}";

      assert.equal(fs.readFileSync('test-sequelize/config/default-example.json', 'utf-8'), expected);
    });

    it('should create the sequelize.js file', () => {
      const expected = "const Sequelize = require('sequelize');\n" +
        "\n" +
        "// Add MySQL schema name, username, password and url here!\n" +
        "const sequelize = new Sequelize(\n" +
        "  '',\n" +
        "  '',\n" +
        "  '', {\n" +
        "    host: '',\n" +
        "    dialect: 'mysql',\n" +
        "  }\n" +
        ");";

      assert.equal(expected, fs.readFileSync('test-sequelize/src/db/sequelize.js', 'utf-8'));
    });

    it('should update the index.js file with the require line', () => {
      const expected = "const sequelize = require('./db/sequelize');\n" +
        "function main() {\n" +
        "  console.log('Hello World');\n" +
        "}\n" +
        "\n" +
        "main();";

      assert.equal(fs.readFileSync('test-sequelize/src/index.js', 'utf-8'), expected);
    });

    it('should update the package.json file with the sequelize and mysql2 dependencies', () => {
      const expected = "{\n" +
        " \"name\": \"test-sequelize\",\n" +
        " \"version\": \"0.0.0\",\n" +
        " \"description\": \"test\",\n" +
        " \"main\": \"src/index.js\",\n" +
        " \"scripts\": {\n" +
        "  \"start\": \"node src/index.js\",\n" +
        "  \"test\": \"\"\n" +
        " },\n" +
        " \"repository\": {},\n" +
        " \"authors\": [\n" +
        "  \"test\"\n" +
        " ],\n" +
        " \"license\": \"MIT\",\n" +
        " \"bin\": {},\n" +
        " \"dependencies\": {\n" +
        "  \"config\": \"^1.3.0\",\n" +
        "  \"sequelize\": \"^4.33.2\",\n" +
        "  \"mysql2\": \"^1.5.2\"\n" +
        " },\n" +
        " \"devDependencies\": {}\n" +
        "}";

      assert.equal(fs.readFileSync('test-sequelize/package.json', 'utf-8'), expected)
    });

    afterEach(() => {
      fs.removeSync('test-sequelize');
    });
  });
});