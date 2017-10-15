import fs from 'fs';
import winston from 'winston';
import path from 'path';

import constants from '../constants/constants';
import * as githubClient from '../clients/github';
import * as travisClient from '../clients/travis';

/**
 * Load template file
 */
function loadTemplate(filepath) {
  return fs.readFileSync(path.join(__dirname, '/', filepath), 'utf-8');
}

export function initTravisCI(config) {
  fs.writeFileSync(
    `${config.projectName}/${constants.travisCI.fileName}`,
    loadTemplate('./../../templates/travis/.travis.yml')
  );
}

/**
 * Initialize Travis-CI on the created project
 */
export async function enableTravisOnProject(username, password, projectName, environmentVariables) {
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
