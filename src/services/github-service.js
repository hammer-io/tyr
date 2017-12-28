/* eslint-disable import/prefer-default-export */
import * as githubClient from './../clients/github';
import * as file from './../utils/files/file';
import { getActiveLogger } from '../utils/log/winston';

const log = getActiveLogger();
/**
 * Checks if the user's github credentials are valid by requesting account information.
 * @param username the username
 * @param password the password
 * @returns {Boolean} true if valid, false if invalid, throws error if something went wrong
 * connecting to the api
 */
export async function isValidCredentials(username, password) {
  try {
    await githubClient.getCurrentUser(username, password);
    return true;
  } catch (error) {
    if (error.status !== 401) {
      throw new Error('Something went wrong contacting the GitHub API!');
    } else {
      return false;
    }
  }
}

/**
 * Creates a github repository
 * @param repositoryName the name of the repository to create
 * @param repositoryDescription the description of the repository
 * @param username the username of the user
 * @param password the password of the user
 * @returns {Promise<void>}
 */
export async function createGitHubRepository(
  repositoryName, repositoryDescription, username,
  password
) {
  try {
    await githubClient.createRepository(repositoryName, repositoryDescription, username, password);
    log.info(`Successfully created GitHub repository ${username}/${repositoryName}.`);
  } catch (error) {
    throw new Error('Failed to create GitHub Repository');
  }
}

/**
 * Generates the necessary git files, including .gitignore
 * @param configs the configuraiton object
 * @returns {Promise<void>}
 */
export async function generateGithubFiles(projectName) {
  const path = `${projectName}/.gitignore`;
  const contents = file.loadTemplate('./../../../templates/git/gitignore');
  file.writeFile(path, contents);
  log.info('Successfully generated .gitignore file.');
}
