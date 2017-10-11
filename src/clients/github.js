import fs from 'fs';
import constants from '../constants/constants';
import gitignoreContents from '../constants/gitignore-contents';

const superagent = require('superagent');
const winston = require('winston');

const githubApiUrl = 'https://api.github.com';
const git = require('simple-git');
const Preferences = require('preferences');
const GitHubApi = require('github');

const github = new GitHubApi({
  version: '3.0.0'
});

/**
 * Returns the string used for the basic authorization header in a POST request.
 */
function basicAuthorization(username, password) {
  return `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`
}

/**
 * Request github oauth token
 */
export function requestGitHubToken(config) {
  winston.log('verbose', 'requestGitHubToken', { username: config.username });

  return new Promise((resolve, reject) => {
    // Create a GitHub token via the GitHub API, store GitHub token and URL.
    superagent
      .post(`${githubApiUrl}/authorizations`)
      .send({
        scopes: [
          'read:org', 'user:email', 'repo_deployment',
          'repo:status', 'public_repo', 'write:repo_hook',
          'user', 'repo'
        ],
        note: 'temporary token to auth against travis'
      })
      .set({
        'Content-Type': 'application/json',
        Authorization: basicAuthorization(config.username, config.password)
      })
      .end((err, res) => {
        if (err) {
          reject(err);
        } else {
          resolve({ token: res.body.token, url: res.body.url });
        }
      });
  });
}

/**
 * Delete github oauth token
 */
export function deleteGitHubToken(githubUrl, config) {
  winston.log('verbose', 'deleteGitHubToken', { username: config.username });

  return new Promise((resolve, reject) => {
    superagent
      .delete(githubUrl)
      .set({ Authorization: basicAuthorization(config.username, config.password) })
      .end((err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
  });
}

/**
 * If a token exists, use that token. Otherwise, create a new token and store the newly created
 * token in preferences
 * @param githubCredentials - { githubUsername : <username>, githubPassword : <password> }
 * @returns {*}
 */
export function getGitHubToken(githubCredentials) {
  winston.log('verbose', 'getGitHubToken', { username: githubCredentials.githubUsername });

  const prefs = new Preferences('hammer-cli');

  let githubToken;
  if (prefs.github && prefs.github.token) {
    githubToken = prefs.github.token;
  } else {
    // Create a temporary GitHub oauth token
    const githubResponse = requestGitHubToken({
      username: githubCredentials.githubUsername,
      password: githubCredentials.githubPassword
    });
    githubToken = githubResponse.token;

    prefs.github = {
      token: githubToken
    }
  }

  return githubToken;
}

/**
 * Create the .gitignore in the newly formed project folder with the basics for a node.js project
 * @param projectName
 */
export function createGitIgnore(projectName) {
  winston.log('verbose', 'createGitIgnore', { projectName });

  try {
    fs.writeFileSync(`${projectName}/${constants.github.gitIgnore.fileName}`, gitignoreContents.gitIgnore.fileContents);
  } catch (err) {
    winston.log('error', constants.github.gitIgnore.error.fileWrite, err);
  }
}

/**
 * Initialize an empty repository within a git repo, add the gitignore, and the rest of the files.
 * Commit them, create the remote repository and push the commit to the remote repository.
 * @param configs
 * @param githubToken
 * @param githubCredentials
 */
export function createGitHubRepository(configs, githubToken, githubCredentials) {
  winston.log('verbose', 'createGitHubRepository', { projectName: configs.projectName, githubToken });

  const data = {
    name: configs.projectName,
    description: configs.description,
    private: false
  };

  github.authenticate({
    type: 'oauth',
    token: githubToken
  });
  github.repos.create(
    data,
    (err) => {
      if (err) {
        winston.log('error', 'createGitHubRepository', err);
      }

      git(`${process.cwd()}/${configs.projectName}`)
        .init()
        .add('.gitignore')
        .add('./*')
        .commit('Initial commit')
        .addRemote('origin', `https://github.com/${githubCredentials.githubUsername}/${configs.projectName}.git`)
        .push('origin', 'master');
    }
  );
}

/**
 * Setups up a github repo, by requesting a github token, creating a .gitignore,
 * and initializing the local and remote repository
 * @param configs
 * @param githubCredentials
 */
export function setupGitHub(configs, githubCredentials) {
  winston.log('verbose', 'setupGitHub', { githubUsername: githubCredentials.githubUsername });

  const githubToken = getGitHubToken(githubCredentials);
  createGitIgnore(configs.projectName);
  createGitHubRepository(configs, githubToken, githubCredentials);
}
