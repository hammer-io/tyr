/* eslint-disable import/prefer-default-export,prefer-destructuring */
import yaml from 'js-yaml';

import * as githubClient from './../clients/github';
import * as travisClient from './../clients/travis';
import * as file from './../utils/files/file';
import { getActiveLogger } from '../utils/log/winston';

const log = getActiveLogger();
/**
 * Generates the TravisCI file.
 * @param configs the configurations object
 * @returns {Promise<void>}
 */
export async function generateTravisCIFile(configs) {
  // load in the base travis CI file.
  const travisCIFile = yaml.safeLoad(file.loadTemplate('./../../../templates/travis/travis.yml'));

  // if the user has selected heroku for deployment, then generate the specific heroku instances
  if (configs.toolingConfigurations.deployment === 'Heroku') {
    const docker = 'docker';
    const dockerBuild = `docker build -t ${configs.projectConfigurations.herokuAppName} .`;
    const dockerPs = 'docker ps -a';
    const afterSuccess =
      'if [ "$TRAVIS_BRANCH" == "master" ]; then\n' +
      'docker login -e="$HEROKU_EMAIL" -u="$HEROKU_USERNAME" -p="$HEROKU_PASSWORD" registry.heroku.com;\n' +
      `docker build -t registry.heroku.com/${configs.projectConfigurations.herokuAppName}/web .;\n` +
      `docker push registry.heroku.com/${configs.projectConfigurations.herokuAppName}/web;\n` +
      'fi';

    travisCIFile.services = [docker];
    travisCIFile.before_install = [dockerBuild, dockerPs];
    travisCIFile.after_success = [afterSuccess];
  }

  file.writeFile(`${configs.projectConfigurations.projectName}/.travis.yml`, yaml.safeDump(travisCIFile));
}


/**
 * Waits for the user's travis account to be done syncing.
 * Often times, the travis account can be found syncing.
 * We need to wait for the account to not be syncing and then return the user information.
 * This will hit the /users/{user.id} endpoint at travis every
 * 2 seconds until the user is not syncing anymore.
 *
 * @param travisAccessToken the access token to retrieve user information
 * @param account the account trying to get user informatin for
 * @returns {Promise}
 */
export async function waitForSync(travisAccessToken, account) {
  log.verbose('waiting for sync');
  log.warn('Waiting for TravisCI to sync account...');

  return new Promise(async (resolve) => {
    setTimeout(async () => {
      let user = await travisClient.getUserInformation(travisAccessToken, account);
      if (user.user.is_syncing) {
        user = await waitForSync(travisAccessToken, account);
      }
      resolve(user);
    }, 2000);
  });
}

/**
 * Enables TravisCI for the project
 * @param configs the configuration object
 * @returns {Promise<{}>}
 */
export async function enableTravis(configs) {
  const username = configs.credentials.github.username;
  const password = configs.credentials.github.password;
  const projectName = configs.projectConfigurations.projectName;

  const envVariables = [];
  if (configs.toolingConfigurations.deployment === 'Heroku') {
    envVariables.push({
      name: 'HEROKU_EMAIL',
      value: configs.credentials.heroku.email
    });
    envVariables.push({
      name: 'HEROKU_USERNAME',
      value: configs.credentials.heroku.email
    });
    envVariables.push({
      name: 'HEROKU_PASSWORD',
      value: configs.credentials.heroku.apiKey
    });
  }

  // get the github token
  let githubToken = {};
  try {
    githubToken = await githubClient.requestGitHubToken(username, password);
  } catch (error) {
    throw new Error(`Failed to enable travis on ${username}/${projectName} because we were unable to get a token from GitHub.`);
  }

  // Use the GitHub token to get a Travis token
  let travisAccessToken = {};
  try {
    travisAccessToken = await travisClient.requestTravisToken(githubToken.token);
  } catch (error) {
    throw new Error(`Failed to enable travis on ${username}/${projectName} because we were unable to get a token from TravisCI.`);
  }

  let response = {};
  let account = {};
  try {
    // get the accounts for the user
    response = await travisClient.getUserAccount(travisAccessToken);
    // a user may have many accounts, we should find the account associated with the github username
    for (let i = 0; i < response.accounts.length; i += 1) {
      if (response.accounts[i].login === username) {
        account = response.accounts[i];
        break;
      }
    }
  } catch (error) {
    throw new Error(`Failed to enable travis on ${username}/${projectName} because we were unable to get account information from TravisCI.`);
  }


  // Wait for the user's account to be done syncing....
  await waitForSync(travisAccessToken, account);

  // Sync Travis with GitHub, which must be done before activating the repository
  try {
    await travisClient.syncTravisWithGithub(travisAccessToken);
  } catch (error) {
    throw new Error(`Failed to enable travis on ${username}/{$projectName} because we were unable to sync TravisCI with GitHub.`);
  }
  // Get the project repository ID, and then use that ID to activate Travis for the project
  let repoId = '';
  try {
    repoId = await travisClient.getRepositoryId(travisAccessToken, username, projectName);
    await travisClient.activateTravisHook(repoId, travisAccessToken);
  } catch (error) {
    throw new Error(`Failed to enable travis on ${username}/${projectName} because we were unable to activate TravisCI.`);
  }

  // Add environment variables
  try {
    if (envVariables && envVariables.length !== 0) {
      for (const env of envVariables) { // eslint-disable-line no-restricted-syntax
        await travisClient.setEnvironmentVariable( // eslint-disable-line no-await-in-loop
          travisAccessToken,
          repoId,
          env
        );
      }
    }
  } catch (error) {
    throw new Error(`Failed to enable travis on ${username}/${projectName} because we were unable to set environment variables.`);
  }

  await githubClient.deleteGitHubToken(githubToken.url, username, password);

  log.info(`TravisCI successfully enabled on ${username}/${projectName}`);
  return travisAccessToken;
}
