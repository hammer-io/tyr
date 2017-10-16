import fs from 'fs';
import path from 'path';
import winston from 'winston';

import {
  requestGitHubToken,
  createGitHubRepository,
  initAddCommitAndPush,
  deleteGitHubToken
} from './../clients/github';
import constants from '../constants/constants';

/**
 * Load template file
 */
function loadTemplate(filepath) {
  return fs.readFileSync(path.join(__dirname, '/', filepath), 'utf-8');
}

/**
 * Create the .gitignore in the newly formed project folder with the basics for a node.js project.
 *
 * @param projectName
 */
export function createGitIgnore(projectName) {
  winston.log('verbose', 'createGitIgnore', { projectName });

  try {
    fs.writeFileSync(
      `${projectName}/${constants.github.gitIgnore.fileName}`,
      loadTemplate('./../../templates/git/.gitignore')
    );
  } catch (err) {
    winston.log('error', constants.github.gitIgnore.error.fileWrite, err);
  }
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
