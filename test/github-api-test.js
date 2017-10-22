import assert from 'assert';
import fs from 'fs-extra';
import path from 'path';
import winston from 'winston';

import {
  requestGitHubToken,
  deleteGitHubToken,
  createGitHubRepository,
  listUserRepositories,
  deleteRepository
} from '../src/clients/github';

// You need to fill in these credentials before running the tests
const credentialsFilename = 'github-test-credentials.txt';

// These get filled and used dynamically
const configs = {
  username: '',
  password: '',
  projectName: '',
  description: '',
  token: '',
  authUrl: ''
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

/**
 * Pad a string on the left-hand side with zeros (up to 4 zeros)
 */
function padZeros(str, num) {
  return ("0000" + str).slice(-num);
}

/**
 * Creates an OAuth token for use during testing. It also fills
 * several aspects of the configs object for use elsewhere in the tests.
 */
async function createTestToken() {
  try {
    // The project name and token notes are given a timestamp so we
    // don't accidentally create duplicate tokens or projects
    const date = new Date();
    const dateString = date.getFullYear() + '-'
      + padZeros(date.getMonth()+1, 2) + '-'
      + padZeros(date.getDate(), 2) + '__'
      + 'h' + padZeros(date.getHours(), 2)
      + 'm' + padZeros(date.getMinutes(), 2)
      + 's' + padZeros(date.getSeconds(), 2)
      + 'ms' + padZeros(date.getMilliseconds(), 4);
    const tokenNote = `hammer-io testing ${dateString} :  If I exist online, delete me!`;

    // Set project name and description
    console.log(`TOKEN NOTE:  ${tokenNote}`);
    configs.projectName = `Test_${dateString}`;
    configs.description = tokenNote;

    // Create the token, and then update configs
    const resp = await requestGitHubToken(configs, null, tokenNote);
    configs.token = resp.token;
    configs.authUrl = resp.url;
  } catch (err) {
    assert.fail(err);
  }
}


describe('GitHub API:', function() {
  // API calls require a longer timeout than the default. Changing the timeout
  // means we can't use a lambda function for the function being defined.
  // Each it() test defined inherits this timeout amount.
  this.timeout(10000);

  before(async () => {
    // Enable 'debug' level logging
    winston.level = 'debug';

    // Load credentials from a file
    await loadCredentials(credentialsFilename);
    assert.notEqual(configs.username, '',
      `The credentials file '${credentialsFilename}' needs to be filled in with a valid username!`);
    assert.notEqual(configs.password, '',
      `The credentials file '${credentialsFilename}' needs to be filled in with a valid password!`);

    // Create a token for use in testing
    await createTestToken();
  });

  after(async () => {
    // Disable 'debug' level logging
    winston.level = 'info';

    // Delete the test token
    if (configs.authUrl) {
      await deleteGitHubToken(configs.authUrl, configs.username, configs.password);
    }
  });

  it('Should be able to create and delete oauth tokens', () => {
    assert.ok(configs.token, 'The response should include a token!');
    assert.ok(configs.authUrl, 'The response should include a url!');
  });

  it('Should be able to create and delete a new GitHub repository', async () => {
    // Create the repo
    await createGitHubRepository(configs.projectName, configs.description, configs.token);

    // List all repos fro the user account, and assert that the new repo is in the list
    const repos = await listUserRepositories(configs.token);
    const expectedFullName = `${configs.username}/${configs.projectName}`;
    let isCreated = false;
    repos.body.forEach((repo) => {
      if (repo.full_name === expectedFullName) {
        isCreated = true;
      }
    });
    assert.equal(isCreated, true, 'The repository was not successfully created and/or listed!');

    // Delete the new repository
    await deleteRepository(configs.projectName, configs.username, configs.password);
  });
});
