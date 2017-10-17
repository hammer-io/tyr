import winston from 'winston';
import yaml from 'js-yaml';

import {
  loadTemplate,
  writeFile
} from './file';
import constants from '../constants/constants';
import * as githubClient from '../clients/github';
import * as travisClient from '../clients/travis';

/**
 * Initialize TravisCI.  Creates the default travis.yml file with optional heroku information.
 *
 * @param config
 */
export function initTravisCI(config) {
  winston.log('verbose', 'initTravisCI');

  if (config.deployment === 'Heroku') {
    const file = yaml.safeLoad(loadTemplate('./../../templates/travis/.travis.yml', constants.travisCI.error.fileRead));
    const dockerBuild = `docker build -t ${config.projectName} .`;
    const dockerPs = 'docker ps -a';
    const afterSuccess =
      'if [ "$TRAVIS_BRANCH" == "master" ]; then\n' +
      'docker login -e="$HEROKU_EMAIL" -u="$HEROKU_USERNAME" -p="$HEROKU_PASSWORD" registry.heroku.com;\n' +
      `docker tag ${config.projectName} registry.heroku.com/${config.projectName}/web;\n` +
      `docker push registry.heroku.com/${config.projectName}/web;\n` +
      'fi';

    file.before_install = [dockerBuild, dockerPs];
    file.after_success = [afterSuccess];
    writeFile(
      `${config.projectName}/${constants.travisCI.fileName}`,
      yaml.safeDump(file, { lineWidth: 100 }),
      constants.travisCI.error.fileWrite
    );
  } else {
    writeFile(
      `${config.projectName}/${constants.travisCI.fileName}`,
      loadTemplate('./../../templates/travis/.travis.yml', constants.travisCI.error.fileRead),
      constants.travisCI.error.fileWrite
    );
  }
}

/**
 *  Initialize Travis-CI on the created project
 *
 * @param username
 * @param password
 * @param projectName
 * @param environmentVariables
 * @returns {Promise.<void>}
 */
export async function enableTravisOnProject(username, password, projectName, environmentVariables) {
  winston.log('verbose', 'enableTravisOnProject');

  try {
    // Create a temporary GitHub oauth token
    const githubResponse = await githubClient.requestGitHubToken(username, password);
    const githubToken = githubResponse.token;
    const githubUrl = githubResponse.url;

    // Use the GitHub token to get a Travis token
    const travisAccessToken = await travisClient.requestTravisToken(githubToken);

    // Delete the temporary GitHub token
    await githubClient.deleteGitHubToken(githubUrl, username, password);

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

    winston.log('info', `TravisCI successfully enabled on ${username}/${projectName}`);
  } catch (err) {
    winston.log('error', constants.travisCI.error.enableTravisOnProject, err);
  }
}
