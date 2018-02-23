import assert from 'assert';
import fs from 'fs-extra';
import sinon from 'sinon';

import {generateProject, generateStaticFiles, generateBasicNodeProject, heroku} from '../dist/tyr';
import * as herokuClient from "../dist/clients/heroku-client";

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
      }).timeout(10000);

      it('should generate a project with Mocha', async () => {
        const noThirdPartyConfig = JSON.parse(fs.readFileSync('test/test-configurations/valid-project-configuration-no-third-party-services'));
        const projectName = noThirdPartyConfig.projectConfigurations.projectName;
        noThirdPartyConfig.toolingConfigurations.test = "Mocha";
        await generateProject(noThirdPartyConfig);

        assert.equal(fs.existsSync(projectName), true, 'should create a top level folder with' +
          ' project name');

        assert.equal(fs.existsSync(projectName + '/src'), true, 'should create a src folder' +
          ' within the project folder');

        assert.equal(fs.existsSync(projectName + '/src/' + 'index.js'), true, 'should create an' +
          ' index.js file.');

        assert.equal(fs.existsSync(projectName, '/test.js'), true, 'should create a test.js file');

        assert.equal(fs.existsSync(projectName + '/' + 'package.json'), true, 'should create a' +
          ' package.json file.');


        assert.equal(fs.existsSync(projectName + '/' + 'README.md'), true, 'should create a' +
          ' README.md file.');
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

          assert.equal(fs.existsSync(projectName + '/.tyrfile'), true, 'should create a .tyrfile');

          // these files should not exist since express is not being used
          assert.equal(fs.existsSync(projectName + '/src/' + 'routes.js'), false, 'should create a routes.js file');
          assert.equal(fs.existsSync(projectName + '/src/' + 'index.html'), false, 'should create a index.html file');
      }).timeout(10000);

      afterEach(() => {
        fs.removeSync('test-project');
      })
    });

    describe('generateStaticFiles()', () => {
      it('should generate static tooling files', async function() {
        const validConfig = JSON.parse(fs.readFileSync('test/test-configurations/valid-project-configuration'));
        const projectName = validConfig.projectConfigurations.projectName;
        await generateBasicNodeProject(validConfig, process.cwd());
        await generateStaticFiles(validConfig, process.cwd());

        assert.equal(fs.existsSync(projectName), true, 'should create a top level folder with' +
          ' project name');

        assert.equal(fs.existsSync(projectName + '/src'), true, 'should create a src folder' +
          ' within the project folder');

        assert.equal(fs.existsSync(projectName + '/src/' + 'index.js'), true, 'should create an' +
          ' index.js file.');

        assert.equal(fs.existsSync(projectName + '/src/' + 'index.html'), true, 'should create a index.html file');

        assert.equal(fs.existsSync(projectName + '/' + 'package.json'), true, 'should create a' +
          ' package.json file.');

        assert.equal(fs.existsSync(projectName + '/' + 'README.md'), true, 'should create a' +
          ' README.md file.');

        assert.equal(fs.existsSync(projectName + '/' + '.gitignore'), true, 'should create a' +
          ' .gitignore file.');

        assert.equal(fs.existsSync(projectName + '/' + '.dockerignore'), true, 'should create a' +
          ' .dockerignore file.');

        assert.equal(fs.existsSync(projectName + '/' + '.travis.yml'), true, 'should create a' +
          ' .travis.yml file.');

        assert.equal(fs.existsSync(projectName + '/' + 'Dockerfile'), true, 'should create a' +
          ' Dockerfile.');
      }).timeout(10000);

      it('should generate static tooling files into the specified directory', async function() {
        const validConfig = JSON.parse(fs.readFileSync('test/test-configurations/valid-project-configuration'));
        const projectName = validConfig.projectConfigurations.projectName;
        // will be test-config/test-config to make project removal easier
        const filePath = `${process.cwd()}/test-config`;
        fs.mkdirSync(filePath);
        await generateBasicNodeProject(validConfig, filePath);
        await generateStaticFiles(validConfig, filePath);
        const projectPath = `${filePath}/${projectName}`;

        assert.equal(fs.existsSync(projectPath), true, 'should create a top level folder with' +
          ' project name');

        assert.equal(fs.existsSync(projectPath + '/src'), true, 'should create a src folder' +
          ' within the project folder');

        assert.equal(fs.existsSync(projectPath + '/src/' + 'index.js'), true, 'should create an' +
          ' index.js file.');

        assert.equal(fs.existsSync(projectPath + '/src/' + 'index.html'), true, 'should create a index.html file');

        assert.equal(fs.existsSync(projectPath + '/' + 'package.json'), true, 'should create a' +
          ' package.json file.');

        assert.equal(fs.existsSync(projectPath + '/' + 'README.md'), true, 'should create a' +
          ' README.md file.');

        assert.equal(fs.existsSync(projectPath + '/' + '.gitignore'), true, 'should create a' +
          ' .gitignore file.');

        assert.equal(fs.existsSync(projectPath + '/' + '.dockerignore'), true, 'should create a' +
          ' .dockerignore file.');

        assert.equal(fs.existsSync(projectPath + '/' + '.travis.yml'), true, 'should create a' +
          ' .travis.yml file.');

        assert.equal(fs.existsSync(projectPath + '/' + 'Dockerfile'), true, 'should create a' +
          ' Dockerfile.');
      }).timeout(10000);


      afterEach(() => {
        fs.removeSync('test-config');
      })
    });

    describe('heroku()', () => {
        it('should create a heroku app for the user', async function()  {
            const herokuCreateRepoStub = sinon.stub(herokuClient, 'createApp');
            herokuCreateRepoStub.resolves();

            const configs = JSON.parse(fs.readFileSync('test/test-configurations/valid-project-configurations-credentials'));
            const updatedConfigs = await heroku(configs);

            assert.equal(updatedConfigs.projectConfigurations.herokuAppName, 'test');

            herokuCreateRepoStub.restore();
        });

        it('should update the herokuAppName to remove any special characters', async function() {
            const herokuCreateRepoStub = sinon.stub(herokuClient, 'createApp');
            herokuCreateRepoStub.resolves();

            const configs = JSON.parse(fs.readFileSync('test/test-configurations/valid-project-configurations-credentials'));
            configs.projectConfigurations.projectName = '^^^TEST_PROJECT$$$';
            const updatedConfigs = await heroku(configs);

            assert.equal(updatedConfigs.projectConfigurations.herokuAppName, '---test-project---');

            herokuCreateRepoStub.restore();
        });

        it('should append a random UUID to the end of the name if the project name already exists', async function() {
            const herokuCreateRepoStub = sinon.stub(herokuClient, 'createApp');
            herokuCreateRepoStub.onFirstCall().rejects({status: 422, response : { body: { message: 'Name is already taken'}}});
            herokuCreateRepoStub.onSecondCall().resolves();

            const configs = JSON.parse(fs.readFileSync('test/test-configurations/valid-project-configurations-credentials'));
            const updatedConfigs = await heroku(configs);

            const pattern = RegExp("(-([a-z0-9-]{7}))$");

            const herokuAppName = updatedConfigs.projectConfigurations.herokuAppName;
            console.log(herokuAppName);
            assert.equal(pattern.test(herokuAppName), true);

            herokuCreateRepoStub.restore();
        });
    })
});