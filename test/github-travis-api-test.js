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
import {
  enableTravisOnProject
} from '../src/utils/travis';
import {
  fetchRepository,
  listEnvironmentVariables
} from '../src/clients/travis';

// You need to fill in these credentials before running the tests
const credentialsFilename = 'github-test-credentials.txt';

// These get filled and used dynamically
const configs = {
  username: undefined,
  password: undefined,
  projectName: undefined,
  description: undefined,
  token: undefined,
  authUrl: undefined
};

/**
 * Loads credentials from either a file or the environment variables.
 * The local file trumps the environment variables. If neither one
 * properly sets the username/password, it throws an error.
 */
function loadCredentials(filepath) {
  function fromFile() {
    const contents = fs.readFileSync(path.join(__dirname, '/', filepath), 'utf-8').split('\n');
    if (contents) {
      contents.forEach((line) => {
        line = line.trim();
        if (line !== '' && !line.startsWith('#')) {
          const keyValue = line.split('=');
          configs[keyValue[0]] = keyValue[1];
        }
      });
    }
  }

  function fromEnv() {
    configs.username = process.env.GITHUB_TEST_USERNAME;
    configs.password = process.env.GITHUB_TEST_PASSWORD;
  }

  let errMsg;
  try {
    fromEnv();
    fromFile();
  } catch (_) {
    errMsg = `Failed to read file: '${filepath}'\n`;
  }

  // Make sure the username/password is set before continuing
  if (!configs.username || !configs.password) {
    throw new Error('Failed to set GitHub username or password!\n' + errMsg);
  }
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
    configs.projectName = `Test_${dateString}`;
    configs.description = tokenNote;

    // Create the token, and then update configs
    const resp = await requestGitHubToken(configs.username, configs.password, null, tokenNote);
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

    // Load credentials
    await loadCredentials(credentialsFilename);

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

  it('Should be able to enable TravisCI on a GitHub repository with environment variables', async function() {
    // Lengthen the timeout, since it could take a while to sync Travis
    this.timeout(120 * 1000);

    // Create the repo
    await createGitHubRepository(configs.projectName, configs.description, configs.token);

    // Enable TravisCI on the new repository, and fetch info for assertion
    const environmentVariables = [
      {
        name: 'MEANING_OF_LIFE',
        value: '42'
      },
      {
        name: 'HOLMGANG',
        value: 'A Viking trial-by-combat',
        public: true
      }
    ];
    let travisToken, repo, envVarsRetrieved;
    try {
      travisToken = await enableTravisOnProject(
        configs.token,
        configs.username,
        configs.projectName,
        environmentVariables
      );
      repo = await fetchRepository(travisToken, configs.username, configs.projectName);
      envVarsRetrieved = await listEnvironmentVariables(travisToken, repo.id);
    } finally {
      // Delete the repository
      await deleteRepository(configs.projectName, configs.username, configs.password);
    }

    // Verify it was initialized
    const expectedSlug = `${configs.username}/${configs.projectName}`;
    assert.equal(repo.slug, expectedSlug);

    // Verify the environment variables were properly set
    for (let i = 0; i < environmentVariables.length; i++) {
      assert.equal(envVarsRetrieved[i].name, environmentVariables[i].name);
      const expectedValue = (environmentVariables[i].public) ? environmentVariables[i].value : null;
      assert.equal(envVarsRetrieved[i].value, expectedValue);
      assert.equal(envVarsRetrieved[i].public, (environmentVariables[i].public || false));
    }
  });

});
