import assert from 'assert';
import sinon from 'sinon'
import inqurier from 'inquirer';

import {promptForProjectConfigurations, promptForToolingConfigurations, promptForGithubCredentials, promptForHerokuCredentials, cleanToolingData, promptForUsernamePassword, promptForEmailAndPasswordApiKey} from '../dist/prompt/prompt';
import { repromptForProjectName } from '../dist/prompt/prompt';

describe('Prompting Test', () => {
  let inquirerMock = {};
  beforeEach(() => {
    inquirerMock = sinon.stub(inqurier, 'prompt');
  });

  describe('cleanToolingData()', () => {
    it('should remove any key with <None> as a value', () => {
      const toolingConfigBefore = {
        sourceControl: '<None>',
        ci: '<None>',
        containerization: '<None>',
        web: '<None>',
        deployment: '<None>'
      };

      const after = {};
      cleanToolingData(toolingConfigBefore);
      assert.equal(typeof after.sourceControl, 'undefined');
      assert.equal(typeof after.ci, 'undefined');
      assert.equal(typeof after.containerization, 'undefined');
      assert.equal(typeof after.web, 'undefined');
      assert.equal(typeof after.deployment, 'undefined');
    });
  });

  describe('promptForProjectConfigurations()', () => {

    it('should return the project configurations in the proper format', async function(done) {
      inquirerMock.resolves({projectName: 'test', description: 'test', version: '0.0.1', author: 'test', license: 'MIT'}, done());

      const configurations = await promptForProjectConfigurations();
      assert.equal(configurations.projectName, 'test');
      assert.equal(configurations.description, 'test');
      assert.equal(configurations.version, '0.0.1');
      assert.equal(configurations.author, 'test');
      assert.equal(configurations.license, 'MIT');
    });
  });

  describe('promptForToolingConfigurations()', () => {
    it('should return the tooling configurations in the proper format with all selected', async (done) => {
      inquirerMock.resolves({sourceControl: 'GitHub', ci: 'TravisCI', containerization: 'Docker', deployment: 'Heroku', web: 'ExpressJS', test: 'Mocha'}, done());
      const tooling = await promptForToolingConfigurations();
      assert.equal(tooling.sourceControl, 'GitHub');
      assert.equal(tooling.ci, 'TravisCI');
      assert.equal(tooling.containerization, 'Docker');
      assert.equal(tooling.deployment, 'Heroku');
      assert.equal(tooling.web, 'ExpressJS');
      assert.equal(tooling.test, 'Mocha');
    });
  });

  describe('promptForUsernameAndPassword', () => {
    it('should return the credentials in the proper format with a username and password', async function () {
      inquirerMock.resolves({username: 'test', password: 'test'});
      const credentials = await promptForUsernamePassword();
      assert.equal(credentials.username, 'test');
      assert.equal(credentials.password, 'test');
    });
  });

  describe('promptForGithubCredentials()', () => {
    it('should return the credentials in the proper format with a username and password', async function () {
      inquirerMock.resolves({username: 'test', password: 'test'});
      const credentials = await promptForGithubCredentials();
      assert.equal(credentials.username, 'test');
      assert.equal(credentials.password, 'test');
    });
  });

  describe('promptForHerokuCredentials()', async function() {
    it('should return the credentials in the proper format with a email and password', async function (done) {
      inquirerMock.resolves({email: 'test@test.com', password: 'test', apiKey: '1234'}, done());
      const credentials = await promptForHerokuCredentials();
      assert.equal(credentials.email, 'test@test.com');
      assert.equal(credentials.password, 'test');
      assert.equal(credentials.apiKey, '1234');
    });
  });

  describe('promptForEmailAndPasswordApiKey()', async function() {
    it('should return the credentials in the proper format with a email and password', async function (done) {
      inquirerMock.resolves({email: 'test@test.com', password: 'test', apiKey: '1234'}, done());
      const credentials = await promptForEmailAndPasswordApiKey();
      assert.equal(credentials.email, 'test@test.com');
      assert.equal(credentials.password, 'test');
      assert.equal(credentials.apiKey, '1234');
    });
  });

  describe('repromptForProjectName()', function() {
    it('should return the new project name', async function (done) {
      inquirerMock.resolves({projectName: 'test'}, done());
      const repos = [];
      const projectName = await repromptForProjectName(repos);
      assert.equal('test', projectName);
    });
  });

  afterEach(() => {
    inquirerMock.restore();
  });
});