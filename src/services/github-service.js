/* eslint-disable import/prefer-default-export,no-await-in-loop,prefer-destructuring */
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
 * @returns {Promise<>}
 */
export async function getUserRepositories(username, password) {
  let repos = [];
  let pageNumber = 1;

  let done = false;
  while (!done) {
    const githubRepos = await githubClient.getRepositories(username, password, pageNumber);
    if (githubRepos.length === 0) {
      done = true;
    } else {
      repos = repos.concat(githubRepos);
      pageNumber += 1;
    }
  }

  return repos;
}

/**
 * Checks if the given repository name is a valid name. A repository name is valid if the name
 * does not already exist as a repository for the user on github.
 * @param repositoryName the repository name to check
 * @param repositories the github repositories for the user
 * @returns {Boolean} true if the name does not exist as a repository, false if it does.
 */
export function isValidGithubRepositoryName(repositoryName, repositories) {
  return repositories.filter(repo => repo.name === repositoryName).length === 0;
}

/**
 * Creates a github repository
 * @param repositoryName the name of the repository to create
 * @param repositoryDescription the description of the repository
 * @param credentials the password, username, and/or token of the user
 * @param isPrivate flag if the project should be private or not
 * @returns {Promise<void>}
 */
export async function createGitHubRepository(
  repositoryName,
  repositoryDescription,
  credentials,
  isPrivate
) {
  log.verbose(`Creating GitHub repository ${credentials.username}/${repositoryName}.`);

  try {
    await githubClient.createRepository(
      repositoryName,
      repositoryDescription,
      credentials,
      isPrivate
    );

    log.info(`Successfully created GitHub repository ${credentials.username}/${repositoryName}.`);
  } catch (error) {
    const errorMessage = 'Failed to create GitHub Repository!';
    log.debug(errorMessage, { status: error.status, message: error.message });
    throw new Error(errorMessage);
  }
}

/**
 * Generates the necessary git files, including .gitignore
 * @param projectPath the newly created project's file path
 * @returns {Promise<void>}
 */
export async function generateGithubFiles(projectPath) {
  log.verbose('Generating files for GitHub.');

  const path = `${projectPath}/.gitignore`;
  const contents = file.loadTemplate('./../../templates/git/gitignore');
  file.writeFile(path, contents);

  log.info(`Successfully generated file: ${path}`);
}


/**
 * Init the git repository, add all the files, make the first commit,
 * add the remote origin, and push origin to master.
 *
 * @param credentials the github credentials object
 * @param projectName the project's name
 * @param filePath the filePath where the project files are
 */
export function initAddCommitAndPush(credentials, projectName, filePath) {
  log.verbose('Github Service - initAddCommitAndPush()');
  const username = credentials.username;
  let secret = credentials.token;
  if (!secret) {
    if (!credentials.password || credentials.password.includes('/')) {
      throw new Error('Github password cannot contain backward slashes');
    }
    secret = credentials.password;
  }
  const uri = `https://${username}:${secret}@github.com/${username}/${projectName}.git`;
  return new Promise((resolve) => {
    git(`${filePath}/${projectName}`)
      .init()
      .add('.gitignore')
      .add('./*')
      .commit('Initial Commit w/ :heart: by @hammer-io.')
      .addRemote('origin', uri)
      .push('origin', 'master')
      .exec(() => {
        log.warn('Please wait while files are pushed to GitHub...');
        setTimeout(() => {
          resolve();
        }, 10000); // TODO: Find a better way to do this than a timeout
      });
  });
}
