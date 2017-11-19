/* eslint-disable no-await-in-loop */
import yaml from 'js-yaml';

import {
  loadTemplate,
  writeFile
} from './file';
import constants from '../constants/constants';
import * as travisClient from '../clients/travis';
import { getActiveLogger } from '../utils/winston';

const log = getActiveLogger();

/**
 * Initialize TravisCI.  Creates the default travis.yml file with optional heroku information.
 *
 * @param config - Refer to README for the structure of the config object
 */
export function initTravisCI(config) {
  log.verbose('initializing TravisCI');

  if (config.tooling.deployment === constants.heroku.name) {
    const file = yaml.safeLoad(loadTemplate('./../../templates/travis/.travis.yml'));
    const docker = 'docker';
    const dockerBuild = `docker build -t ${config.projectConfigurations.projectName} .`;
    const dockerPs = 'docker ps -a';
    const afterSuccess =
      'if [ "$TRAVIS_BRANCH" == "master" ]; then\n' +
      'docker login -e="$HEROKU_EMAIL" -u="$HEROKU_USERNAME" -p="$HEROKU_PASSWORD" registry.heroku.com;\n' +
      `docker build -t registry.heroku.com/${config.projectConfigurations.projectName}/web .;\n` +
      `docker push registry.heroku.com/${config.projectConfigurations.projectName}/web;\n` +
      'fi';

    file.services = [docker];
    file.before_install = [dockerBuild, dockerPs];
    file.after_success = [afterSuccess];
    writeFile(
      `${config.projectConfigurations.projectName}/${constants.travisCI.fileName}`,
      yaml.safeDump(file, { lineWidth: 100 })
    );
  } else {
    writeFile(
      `${config.projectConfigurations.projectName}/${constants.travisCI.fileName}`,
      loadTemplate('./../../templates/travis/.travis.yml')
    );
  }
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
 * Initialize Travis-CI on the created project
 *
 * @param githubToken
 * @param username
 * @param projectName
 * @param envVariables
 * @returns Promise: { travisAccessToken }
 */
export async function enableTravisOnProject(githubToken, username, projectName, envVariables) {
  log.verbose('enabling travis for project');

  try {
    // Use the GitHub token to get a Travis token
    const travisAccessToken = await travisClient.requestTravisToken(githubToken);

    // get the accounts for the user
    const response = await travisClient.getUserAccount(travisAccessToken);
    let account = {};
    // a user may have many accounts, we should find the account associated with the github username
    for (let i = 0; i < response.accounts.length; i += 1) {
      if (response.accounts[i].login === username) {
        account = response.accounts[i];
      }

      // Wait for the user's account to be done syncing....
      await waitForSync(travisAccessToken, account);

      // Sync Travis with GitHub, which must be done before activating the repository
      await travisClient.syncTravisWithGithub(travisAccessToken);

      // Get the project repository ID, and then use that ID to activate Travis for the project
      const repoId = await travisClient.getRepositoryId(travisAccessToken, username, projectName);
      await travisClient.activateTravisHook(repoId, travisAccessToken);

      // Add environment variables
      if (envVariables && envVariables.length !== 0) {
        for (const env of envVariables) { // eslint-disable-line no-restricted-syntax
          await travisClient.setEnvironmentVariable( // eslint-disable-line no-await-in-loop
            travisAccessToken,
            repoId,
            env
          );
        }
      }
    }

    log.info(`TravisCI successfully enabled on ${username}/${projectName}`);
    return travisAccessToken;
  } catch (err) {
    log.error(`failed to enable TravisCI on ${username}/${projectName}`, JSON.stringify(err));
  }
}
