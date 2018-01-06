import assert from 'assert';
import sinon from 'sinon'
import inqurier from 'inquirer';
;
import {promptForProjectConfigurations, promptForToolingConfigurations, promptForGithubCredentials, promptForHerokuCredentials } from '../dist/prompt/prompt';

describe('Prompting Test', () => {
  let inquirerMock = {};
  beforeEach(() => {
    inquirerMock = sinon.stub(inqurier, 'prompt');
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
    it('should return the tooling configurations in the proper format with all selected', async () => {
      // TODO test tooling prompt.
      // tried doing this, but could never get the next question answered

      // bddStdin(DOWN, ENTER);
      // bddStdin(DOWN, ENTER);
      // bddStdin(DOWN, ENTER);
      // bddStdin(DOWN, ENTER);
      // bddStdin(DOWN, ENTER);
      //
      // const tooling = await promptForToolingConfigurations();

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

  afterEach(() => {
    inquirerMock.restore();
  });
});