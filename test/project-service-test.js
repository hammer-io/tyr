import assert from 'assert';
import fs from 'fs-extra';

import * as projectService from '../dist/services/project-service';

describe('Project Service Test', () => {
  const configs = JSON.parse(fs.readFileSync('test/test-configurations/valid-project-configuration2', 'utf-8'));
  const projectName = configs.projectConfigurations.projectName;

  describe('generateTyrfile()', () => {
    beforeEach(async () => {
      fs.mkdirSync('test-project');
    });

    it('should generate a .tyrfile', async () => {

      const expectedTyrFileConfigs = "{\n" +
        " \"projectConfigurations\": {\n" +
        "  \"projectName\": \"test-project\",\n" +
        "  \"description\": \"test-proejct\",\n" +
        "  \"version\": \"0.0.0\",\n" +
        "  \"author\": \"test\",\n" +
        "  \"license\": \"MIT\"\n" +
        " },\n" +
        " \"toolingConfigurations\": {\n" +
        "  \"sourceControl\": \"GitHub\",\n" +
        "  \"ci\": \"TravisCI\",\n" +
        "  \"containerization\": \"Docker\",\n" +
        "  \"deployment\": \"Heroku\",\n" +
        "  \"web\": \"ExpressJS\"\n" +
        " }\n" +
        "}";

      await projectService.generateTyrfile(configs);

      assert.equal(fs.existsSync(projectName + "/.tyrfile"), true);
      assert.equal(fs.readFileSync(projectName + "/.tyrfile", 'utf-8'), expectedTyrFileConfigs)
    });
  });

  describe('generateBasicNodeFiles()', () => {
    beforeEach(async () => {
      await projectService.generateBasicNodeFiles(configs);
    });

    it('should generate a top level folder with the project name', async () => {
      assert.equal(fs.existsSync(projectName), true);
    });

    it('should generate a src folder underneath the top level project', () => {
      assert.equal(fs.existsSync(projectName + '/src'), true);
    });

    it('should generate a index.js file', () => {

      const expectedIndexContents = "function main() {\n" +
        "  console.log('Hello World');\n" +
        "}\n" +
        "\n" +
        "main();";

      assert.equal(fs.existsSync(projectName + '/src/' + 'index.js'), true);
      assert.equal(fs.readFileSync(projectName + '/src/' + 'index.js'), expectedIndexContents);
    });

    it('should generate a package.json file', () => {
      const expectedPackageJsonContents = "{\n" +
        " \"name\": \"test-project\",\n" +
        " \"version\": \"0.0.0\",\n" +
        " \"description\": \"test-proejct\",\n" +
        " \"main\": \"src/index.js\",\n" +
        " \"scripts\": {\n" +
        "  \"start\": \"node src/index.js\",\n" +
        "  \"test\": \"mocha\"\n" +
        " },\n" +
        " \"repository\": {},\n" +
        " \"authors\": [\n" +
        "  \"test\"\n" +
        " ],\n" +
        " \"license\": \"MIT\",\n" +
        " \"bin\": {},\n" +
        " \"dependencies\": {},\n" +
        " \"devDependencies\": {\n" +
        "  \"mocha\": \"3.5.3\"\n" +
        " }\n" +
        "}";

      assert.equal(fs.existsSync(projectName + '/' + 'package.json'), true);
      assert.equal(fs.readFileSync(projectName + '/' + 'package.json', 'utf-8'), expectedPackageJsonContents);
    });

    it('should generate a README.md file', () => {
      const expectedReadmeContents = "# test-project\n" +
        "test-proejct\n" +
        "\n" +
        "## Installation\n" +
        "`npm install`\n" +
        "\n" +
        "## Usage\n" +
        "`npm start`\n" +
        "\n" +
        "Generated by [@hammer-io](https://github.com/hammer-io/tyr)";


      assert.equal(fs.existsSync(projectName + '/' + 'README.md'), true);
      assert.equal(fs.readFileSync(projectName + '/' + 'README.md', 'utf-8'), expectedReadmeContents);
    });
  });

  afterEach(() => {
    fs.removeSync('test-project');
  });
});