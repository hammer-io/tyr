import fs from 'fs';
import constants from '../constants/constants';
import gitignoreContents from '../constants/gitignore-contents';

const superagent = require('superagent');
const winston = require('winston');

const githubApiUrl = 'https://api.github.com';
const git = require('simple-git');


/**
 * Returns the string used for the basic authorization header in a POST request.
 *
 * @param username
 * @param password
 * @returns {string}
 */
function basicAuthorization(username, password) {
  return `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`
}


/**
 * Request GitHub OAuth token.
 *
 * @param username
 * @param password
 * @returns {Promise}
 */
export function requestGitHubToken(username, password) {
  winston.log('verbose', 'requestGitHubToken', { username });

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
        Authorization: basicAuthorization(username, password)
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
 * Delete GitHub OAuth token.
 *
 * @param githubUrl
 * @param username
 * @param password
 * @returns {Promise}
 */
export function deleteGitHubToken(githubUrl, username, password) {
  winston.log('verbose', 'deleteGitHubToken', { username });

  return new Promise((resolve, reject) => {
    superagent
      .delete(githubUrl)
      .set({ Authorization: basicAuthorization(username, password) })
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
 * Create the .gitignore in the newly formed project folder with the basics for a node.js project.
 *
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
 *
 * @param projectName
 * @param projectDescription
 * @param username
 * @param password
 */
export function createGitHubRepository(projectName, projectDescription, username, password) {
  winston.log('verbose', 'createGitHubRepository', { projectName });

  return new Promise((resolve, reject) => {
    superagent
      .post(`${githubApiUrl}/user/repos`)
      .set({
        Authorization: basicAuthorization(username, password)
      })
      .send({
        name: projectName,
        description: projectDescription,
        private: false
      })
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
 * Init the git repository, add all the files, make the first commit,
 * add the remote origin, and push origin to master.
 *
 * @param username
 * @param projectName
 */
export function initAddCommitAndPush(username, projectName) {
  winston.log('verbose', 'initAddCommitAndPush', { username, projectName });
  winston.log('info', 'Pushing all files to the new git repository...');

  return new Promise((resolve) => {
    git(`${process.cwd()}/${projectName}`)
      .init()
      .add('.gitignore')
      .add('./*')
      .commit('Initial commit')
      .addRemote('origin', `https://github.com/${username}/${projectName}.git`)
      .push('origin', 'master')
      .exec(() => {
        console.log('Please wait while the files are uploaded...');
        setTimeout(() => {
          resolve();
        }, 10000); // TODO: Find a better way to do this than a timeout
      });
  });
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
