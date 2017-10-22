import assert from 'assert';
import fs from 'fs-extra';
import path from 'path';
import winston from 'winston';

import {
  requestGitHubToken,
  deleteGitHubToken,
  createGitHubRepository,
  initAddCommitAndPush
} from '../src/clients/github';

const credentialsFilename = 'github-test-credentials.txt';

const configs = {
  username: '',
  password: '',
  projectName: '',
  description: ''
};

/**
 * Load credentials from a file
 */
function loadCredentials(filepath) {
  const contents = fs.readFileSync(path.join(__dirname, '/', filepath), 'utf-8').split('\n');
  if (!contents) {
    throw new Error(`Failed to read file: ${filepath}`);
  }
  contents.forEach((line) => {
    line = line.trim();
    if (line !== '' && !line.startsWith('#')) {
      const keyValue = line.split('=');
      configs[keyValue[0]] = keyValue[1];
    }
  });
}

describe('GitHub API:', () => {
  before(() => {
    winston.level = 'debug';
    loadCredentials(credentialsFilename);
    assert.notEqual(configs.username, '',
      `The credentials file '${credentialsFilename}' needs to be filled in with a valid username!`);
    assert.notEqual(configs.password, '',
      `The credentials file '${credentialsFilename}' needs to be filled in with a valid password!`);
  });

  after(() => {
    winston.level = 'info';
  });

  it('Should be able to create and delete oauth tokens', async () => {
    try {
      const date = new Date();
      const dateString = `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}`;
      const randomNumber = Math.floor(Math.random() * 1000000);
      const tokenNote = `hammer-io testing ${dateString} :  If I exist online, delete me! (${randomNumber})`;
      console.log(`TOKEN NOTE:  ${tokenNote}`);
      const resp = await requestGitHubToken(configs, null, tokenNote);
      assert.ok(resp.token, 'The response should include a token!');
      assert.ok(resp.url, 'The response should include a url!');
      if (resp.token && resp.url) {
        await deleteGitHubToken(resp.url, configs.username, configs.password);
      }
    } catch (err) {
      assert.fail(`Unable to create or delete the oauth token!\n${err}`);
    }
  });
});
