import assert from 'assert';
import fs from 'fs-extra';
import sinon from 'sinon';

import {generateProject} from '../dist/tyr';
import * as tyr from '../dist/tyr';

describe('Tyr Test', () => {

    // note: this test only tests if the proper files are generated and the right methods are called
    // functionality is tested in the individual service tests
    describe('generateProject()', () => {
      it('should generate a project with express', async () => {
          const noThirdPartyConfig = JSON.parse(fs.readFileSync('test/test-configurations/valid-project-configuration-no-third-party-services'));
          const projectName = noThirdPartyConfig.projectConfigurations.projectName;
          noThirdPartyConfig.toolingConfigurations.web = "ExpressJS";
          await generateProject(noThirdPartyConfig);

          assert.equal(fs.existsSync(projectName), true, 'should create a top level folder with' +
              ' project name');

          assert.equal(fs.existsSync(projectName + '/src'), true, 'should create a src folder' +
              ' within the project folder');

          assert.equal(fs.existsSync(projectName + '/src/' + 'index.js'), true, 'should create an' +
              ' index.js file.');

          assert.equal(fs.existsSync(projectName + '/src/' + 'routes.js'), true, 'should create a routes.js file');

          assert.equal(fs.existsSync(projectName + '/src/' + 'index.html'), true, 'should create a index.html file');

          assert.equal(fs.existsSync(projectName + '/' + 'package.json'), true, 'should create a' +
              ' package.json file.');

          assert.equal(fs.existsSync(projectName + '/' + 'README.md'), true, 'should create a' +
              ' README.md file.');

          assert.equal(fs.existsSync(projectName + '/' + 'test.js'), true, 'should create a' +
              ' test.js file.');

          assert.equal(fs.existsSync(projectName + '/node_modules'), true, 'should run NPM install,' +
              ' thus creating a node_modules folder');
      }).timeout(10000);

      it('should generate a project with no third party services', async () => {
          const noThirdPartyConfig = JSON.parse(fs.readFileSync('test/test-configurations/valid-project-configuration-no-third-party-services'));
          const projectName = noThirdPartyConfig.projectConfigurations.projectName;
          await generateProject(noThirdPartyConfig);

          assert.equal(fs.existsSync(projectName), true, 'should create a top level folder with' +
              ' project name');

          assert.equal(fs.existsSync(projectName + '/src'), true, 'should create a src folder' +
              ' within the project folder');

          assert.equal(fs.existsSync(projectName + '/src/' + 'index.js'), true, 'should create an' +
              ' index.js file.');

          assert.equal(fs.existsSync(projectName + '/' + 'package.json'), true, 'should create a' +
              ' package.json file.');

          assert.equal(fs.existsSync(projectName + '/' + 'README.md'), true, 'should create a' +
              ' README.md file.');

          assert.equal(fs.existsSync(projectName + '/' + 'test.js'), true, 'should create a' +
              ' test.js file.');

          assert.equal(fs.existsSync(projectName + '/node_modules'), true, 'should run NPM install,' +
              ' thus creating a node_modules folder');

          assert.equal(fs.existsSync(projectName + '/.tyrfile'), true, 'should create a .tyrfile');

          // these files should not exist since express is not being used
          assert.equal(fs.existsSync(projectName + '/src/' + 'routes.js'), false, 'should create a routes.js file');
          assert.equal(fs.existsSync(projectName + '/src/' + 'index.html'), false, 'should create a index.html file');
      }).timeout(10000);;

      afterEach(() => {
        fs.removeSync('test-project');
      })
    });
});