/* eslint-disable no-await-in-loop */
import winston from 'winston';
import yaml from 'js-yaml';

import {
  loadTemplate,
  writeFile
} from './file';
import constants from '../constants/constants';
import * as travisClient from '../clients/travis';

/**
 * Initialize TravisCI.  Creates the default travis.yml file with optional heroku information.
 *
 * @param config - Refer to README for the structure of the config object
 */
export function initTravisCI(config) {
  winston.log('verbose', 'initializing TravisCI');

  if (config.tooling.deployment === constants.heroku.name) {
    const file = yaml.safeLoad(loadTemplate('./../../templates/travis/.travis.yml', 'Failed to' +
      ' read from .travis.yml template file!'));
    const dockerBuild = `docker build -t ${config.projectConfigurations.projectName} .`;
    const dockerPs = 'docker ps -a';
    const afterSuccess =
      'if [ "$TRAVIS_BRANCH" == "master" ]; then\n' +
      'docker login -e="$HEROKU_EMAIL" -u="$HEROKU_USERNAME" -p="$HEROKU_PASSWORD" registry.heroku.com;\n' +
      `docker tag ${config.projectConfigurations.projectName} registry.heroku.com/${config.projectConfigurations.projectName}/web;\n` +
      `docker push registry.heroku.com/${config.projectConfigurations.projectName}/web;\n` +
      'fi';

    file.before_install = [dockerBuild, dockerPs];
    file.after_success = [afterSuccess];
    writeFile(
      `${config.projectConfigurations.projectName}/${constants.travisCI.fileName}`,
      yaml.safeDump(file, { lineWidth: 100 }),
      'Failed to write to .travis.yml'
    );
  } else {
    writeFile(
      `${config.projectConfigurations.projectName}/${constants.travisCI.fileName}`,
      loadTemplate(
        './../../templates/travis/.travis.yml',
        'Failed to read from .travis.yml template file',
        'Failed to write to .travis.yml'
      )
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
  winston.log('verbose', 'waiting for sync');

  return new Promise(async (resolve) => {
    setTimeout(async () => {
      const user = await travisClient.getUserInformation(travisAccessToken, account);
      if (!user.user.is_syncing) {
        resolve(user);
      } else {
        waitForSync(travisAccessToken, account);
      }
    }, 2000);
  });
}

/**
 * Initialize Travis-CI on the created project
 *
 * @param token
 * @param username
 * @param projectName
 * @param environmentVariables
 * @returns {Promise.<void>}
 */
export async function enableTravisOnProject(token, username, projectName, environmentVariables) {
  winston.log('verbose', 'enabling travis for project');

  try {
    // Use the GitHub token to get a Travis token
    const travisAccessToken = await travisClient.requestTravisToken(token);

    // get the accounts for the user
    const response = await travisClient.getUserAccount(travisAccessToken);
    let account = {};
    // a user may have many accounts, we should find the account associated with the github username
    for (let i = 0; i < response.accounts.length; i += 1) {
      if (response.accounts[i].login === username) {
        account = response.accounts[i];
      }

      // wait for the user's account to be done dsyncing....
      await waitForSync(travisAccessToken, account);

      // Sync Travis with GitHub, which must be done before activating the repository
      await travisClient.syncTravisWithGithub(travisAccessToken);

      // Get the project repository ID, and then use that ID to activate Travis for the project
      const repoId = await travisClient.getRepositoryId(travisAccessToken, username, projectName);
      await travisClient.activateTravisHook(repoId, travisAccessToken);

      // Add environment variables
      if (environmentVariables && environmentVariables.length !== 0) {
        for (const env of environmentVariables) { // eslint-disable-line no-restricted-syntax
          await travisClient.setEnvironmentVariable( // eslint-disable-line no-await-in-loop
            travisAccessToken,
            repoId,
            env
          );
        }
      }
    }

    winston.log('info', `TravisCI successfully enabled on ${username}/${projectName}`);
  } catch (err) {
    winston.log('error', `failed to enable TravisCI on ${username}/${projectName}`, JSON.stringify(err));
  }
}
