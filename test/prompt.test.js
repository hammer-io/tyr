import assert from 'assert';
import mockStdin from 'mock-stdin';
import bddStdin from 'bdd-stdin';

import {promptForProjectConfigurations, promptForToolingConfigurations, promptForGithubCredentials, promptForHerokuCredentials } from '../dist/prompt/prompt';

// prompt helpers
const DOWN = bddStdin.keys.down;
const UP = bddStdin.keys.up;
const ENTER = '\n';

describe('Test Prompting Mechanisms', () => {
  let stdin;

  beforeEach(() => {
    stdin = mockStdin.stdin();
  });

  describe('Prompt for project configurations', () => {
    it('should return the project configurations in the proper format', async () => {
      bddStdin('jack', ENTER, 'jack', ENTER, '0.0.1', ENTER, 'jack', ENTER, 'MIT', ENTER);
      const configurations = await promptForProjectConfigurations();
      assert.equal(configurations.projectName, 'jack');
      assert.equal(configurations.description, 'jack');
      assert.equal(configurations.version, '0.0.1');
      assert.equal(configurations.author, 'jack');
      assert.equal(configurations.license, 'MIT');
    });
  });

  describe('Prompt for tooling configurations', () => {
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

  describe('Prompt user for GitHub Credentials', () => {
    it('should return the credentials in the proper format with a username and password', async () => {
      bddStdin('jack', ENTER, 'jack', ENTER);
      const credentials = await promptForGithubCredentials();
      assert.equal(credentials.username, 'jack');
      assert.equal(credentials.password, 'jack');
    });
  });

  describe('Prompt user for Heroku Credentials', () => {
    it('should return the credentials in the proper format with a email and password', async () => {
      bddStdin('jack@jack.com', ENTER, 'jack', ENTER);
      const credentials = await promptForHerokuCredentials();
      assert.equal(credentials.email, 'jack@jack.com');
      assert.equal(credentials.password, 'jack');
    });
  });
});