import fs from 'fs';
import path from 'path';
import winston from 'winston';
import inquirer from 'inquirer';

import {
  requestGitHubToken,
  createGitHubRepository,
  initAddCommitAndPush
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
 * Gets the user's github credentials
 */
function promptGithubCredentials() {
  const questions = [{
    name: 'username',
    type: 'input',
    message: constants.github.username.message,
    validate: (value) => {
      if (typeof value === 'undefined' || value === '' || value.indexOf(' ') !== -1) {
        return 'Username cannot be blank!';
      }

      return true;
    }
  }, {
    name: 'password',
    type: 'password',
    message: constants.github.password.message,
    validate: (value) => {
      if (typeof value === 'undefined' || value === '' || value.indexOf(' ') !== -1) {
        return 'Password cannot be blank!';
      }

      return true;
    }
  }];

  return inquirer.prompt(questions);
}

/**
 * Prompts the user for their two factor authentication code
 */
function prompt2fa() {
  const questions = [{
    name: 'code',
    value: 'input',
    message: 'Two Factor Authentication Code:',
    validate: (value) => {
      if (typeof value === 'undefined' || value === '' || value.indexOf(' ') !== -1 ||
        value.length !== 6) {
        return 'Invalid 2fa code!';
      }

      return true;
    }
  }];

  return inquirer.prompt(questions);
}

/**
 * Signs a user into github and credentials for a user
 *
 * @returns Sample Return object:
 *  {
 *    username: 'username',
 *    password: 'password',
 *    token: 'token',
 *    url: 'www.github.com/hello/world'
 *  }
 */
export async function signIntoGithub() {
  const credentials = {};

  // prompt user for github username and password
  const githubCredentials = await promptGithubCredentials();

  try {
    // request a token using only username and password
    const token = await requestGitHubToken(githubCredentials, null);

    // if the above call was successful, set the important information and returns
    credentials.username = githubCredentials.username;
    credentials.password = githubCredentials.password;
    credentials.token = token.token;
    credentials.url = token.url;
    credentials.isTwoFactorAuth = false;
    return credentials;
  } catch (err) {
    // if the above call was not successful, we will end up here...

    // if the user's github account has 2fa enabled, the above call will
    // fail with a status of 401 and have the 'x-github-otp' code of
    // `required; sms` or `required; application`.
    // We should prompt for a 2fa code if this the case
    if (err.status === 401 && typeof err.response.headers['x-github-otp'] !== 'undefined'
      && err.response.headers['x-github-otp'].includes('required;')) {
      const code = await prompt2fa();

      try {
        const token = await requestGitHubToken(githubCredentials, code.code);
        credentials.username = githubCredentials.username;
        credentials.password = githubCredentials.password;
        credentials.token = token.token;
        credentials.url = token.url;
        credentials.isTwoFactorAuth = true;
        return credentials;
      } catch (error) {
        winston.log('error', 'failed logging into github', error);
      }
    } else if (err.status === 401) {
      // if the user had a bad username and password combination,
      // we wil go here. We prompt them for their credentials
      await signIntoGithub();
    } else {
      // something bad has happened if we get here.
      winston.log('error', 'failed logging into github', err);
    }
  }

  return credentials;
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
export async function setupGitHub(projectName, projectDescription, credentials) {
  winston.log('verbose', 'setupGitHub', credentials.username);

  try {
    await createGitIgnore(projectName);
    await createGitHubRepository(projectName, projectDescription, credentials.token);
    await initAddCommitAndPush(credentials.username, projectName, credentials.isTwoFactorAuth);
  } catch (err) {
    winston.log('error', 'setupGitHub failed for some reason', err);
  }
}
