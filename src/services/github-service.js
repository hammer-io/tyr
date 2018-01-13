/* eslint-disable import/prefer-default-export */
import git from 'simple-git';

import * as githubClient from '../clients/github-client';
import * as file from '../utils/file';
import { getActiveLogger } from '../utils/winston';

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
 * Gets the repositories for the given user
 * @param username the username of the user
 * @param password the password for the user
 * @returns {Promise<void>}
 */
export async function getUserRepositories(username, password) {
  try {
    return await githubClient.getRepositories(username, password);
  } catch (error) {
    throw new Error(`Failed to get repositories for user with username ${username}`);
  }
}

/**
 * Checks if the given repository name is a valid name. A repository name is valid if the name
 * does not already exist as a repository for the user on github.
 * @param repositoryName the repository name to check
 * @param username the user's username
 * @param password the user's password
 * @returns {Boolean} true if the name does not exist as a repository, false if it does.
 */
export async function isValidGithubRepositoryName(repositoryName, username, password) {
  const repos = await getUserRepositories(username, password);
  repos.forEach((repo) => {
    console.log(repo.name);
    if (repo.name === repositoryName) {
      return false;
    }
  });

  return true;
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
  log.verbose(`Creating GitHub repository ${username}/${repositoryName}.`);

  try {
    await githubClient.createRepository(repositoryName, repositoryDescription, username, password);
    log.info(`Successfully created GitHub repository ${username}/${repositoryName}.`);
  } catch (error) {
    const errorMessage = 'Failed to create GitHub Repository!';
    log.debug(errorMessage, { status: error.status, message: error.message });
    throw new Error(errorMessage);
  }
}

/**
 * Generates the necessary git files, including .gitignore
 * @param configs the configuraiton object
 * @returns {Promise<void>}
 */
export async function generateGithubFiles(projectName) {
  log.verbose('Generating files for GitHub.');

  const path = `${projectName}/.gitignore`;
  const contents = file.loadTemplate('./../../templates/git/gitignore');
  file.writeFile(path, contents);

  log.info(`Successfully generated file: ${path}`);
}


/**
 * Init the git repository, add all the files, make the first commit,
 * add the remote origin, and push origin to master.
 *
 * @param username
 * @param projectName
 * @param isTwoFactorAuth
 */
export function initAddCommitAndPush(username, projectName) {
  log.verbose('Github Service - initAddCommitAndPush()');
  return new Promise((resolve) => {
    git(`${process.cwd()}/${projectName}`)
      .init()
      .add('.gitignore')
      .add('./*')
      .commit('Initial Commit w/ :heart: by @hammer-io.')
      .addRemote('origin', `https://github.com/${username}/${projectName}.git`)
      .push('origin', 'master')
      .exec(() => {
        log.warn('Please wait while files are pushed to GitHub...');
        setTimeout(() => {
          resolve();
        }, 10000); // TODO: Find a better way to do this than a timeout
      });
  });
}
