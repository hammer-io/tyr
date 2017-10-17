import winston from 'winston';

import {
  requestGitHubToken,
  createGitHubRepository,
  initAddCommitAndPush,
  deleteGitHubToken
} from './../clients/github';
import {
  loadTemplate,
  writeFile
} from './file';
import constants from '../constants/constants';


/**
 * Create the .gitignore in the newly formed project folder with the basics for a node.js project.
 *
 * @param projectName
 */
export function createGitIgnore(projectName) {
  winston.log('verbose', 'createGitIgnore', { projectName });

  writeFile(
    `${projectName}/${constants.github.gitIgnore.fileName}`,
    loadTemplate('./../../templates/git/.gitignore', constants.github.gitIgnore.error.fileRead),
    constants.github.gitIgnore.error.fileWrite
  );
}

/**
 * Setups up a GitHub repo, by requesting a GitHub token, creating a .gitignore,
 * and initializing the local and remote repository
 *
 * @param projectName
 * @param projectDescription
 * @param username
 * @param password
 */
export async function setupGitHub(projectName, projectDescription, username, password) {
  winston.log('verbose', 'setupGitHub', { username });

  try {
    const githubResponse = await requestGitHubToken(username, password);
    await createGitIgnore(projectName);
    await createGitHubRepository(projectName, projectDescription, username, password);
    await initAddCommitAndPush(username, projectName);
    await deleteGitHubToken(githubResponse.url, username, password);
  } catch (err) {
    winston.log('error', 'setupGitHub failed for some reason', err);
  }
}
