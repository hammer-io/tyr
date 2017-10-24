import superagent from 'superagent';
import chalk from 'chalk';
import * as authorizationUtil from './../utils/authorization';
import { getActiveLogger } from '../utils/winston';

const githubApiUrl = 'https://api.github.com';
const git = require('simple-git');

const log = getActiveLogger();

/**
 * Filters out sensitive header information (such as authentication headers or post data)
 *
 * @param err
 * @returns {Error}
 */
function filterErrorResponse(err) {
  if (err && err.response) {
    // GitHub API response.text returns a stringified JSON that needs to be parsed
    const filteredError = {
      status: err.response.status,
      text: JSON.parse(err.response.text),
      req: {}
    };
    if (err.response.req) {
      filteredError.req = {
        method: err.response.req.method,
        url: err.response.req.url
      };
    }
    return new Error(JSON.stringify(filteredError));
  }

  return err;
}

/**
 * Request GitHub OAuth token.
 *
 * @param username github username
 * @param password github password
 * @param otpCode the user's two factor authentication code.
 *                  If user does not use two factor authentication, otpCode
 *                 will be null or their two factor authentication has not been
 *                 provided.
 * @param note the remark assigned to the given token in the user's GitHub account
 * @returns github token information if successful, error information otherwise
 */
export function requestGitHubToken(username, password, otpCode, note = 'hammer-io token') {
  log.verbose('requestGitHubToken', username);
  let request = superagent
    .post(`${githubApiUrl}/authorizations`)
    .send({
      scopes: [
        'read:org', 'user:email', 'repo_deployment',
        'repo:status', 'public_repo', 'write:repo_hook',
        'user', 'repo'
      ],
      note
    });

  // if the user is using
  if (otpCode) {
    request = request.set({
      'X-GitHub-OTP': otpCode
    });
  }

  request = request.set({
    'Content-Type': 'application/json',
    Authorization: authorizationUtil.basicAuthorization(username, password)
  });

  return new Promise((resolve, reject) => {
    // Create a GitHub token via the GitHub API, store GitHub token and URL.
    request.end((err, res) => {
      if (err) {
        reject(filterErrorResponse(err));
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
  log.verbose('deleteGitHubToken');

  return new Promise((resolve, reject) => {
    superagent
      .delete(githubUrl)
      .set({ Authorization: authorizationUtil.basicAuthorization(username, password) })
      .end((err) => {
        if (err) {
          reject(filterErrorResponse(err));
        } else {
          resolve();
        }
      });
  });
}

/**
 * Initialize an empty repository within a git repo, add the gitignore, and the rest of the files.
 * Commit them, create the remote repository and push the commit to the remote repository.
 *
 * @param projectName
 * @param projectDescription
 * @param token
 */
export function createGitHubRepository(projectName, projectDescription, token) {
  log.debug('createGitHubRepository', { projectName });
  log.verbose('creating github repository', { projectName });

  return new Promise((resolve, reject) => {
    superagent
      .post(`${githubApiUrl}/user/repos`)
      .set({
        Authorization: authorizationUtil.tokenAuthorization(token)
      })
      .send({
        name: projectName,
        description: projectDescription,
        private: false
      })
      .end((err) => {
        if (err) {
          reject(filterErrorResponse(err));
        } else {
          resolve();
        }
      });
  });
}

/**
 * List repositories that are accessible to the authenticated user
 *
 * @param token
 */
export function listUserRepositories(token) {
  log.debug('listUserRepositories');

  return new Promise((resolve, reject) => {
    superagent
      .get(`${githubApiUrl}/user/repos`)
      .set({
        Authorization: authorizationUtil.tokenAuthorization(token)
      })
      .end((err, res) => {
        if (err) {
          reject(filterErrorResponse(err));
        } else {
          resolve(res);
        }
      });
  });
}

/**
 * Deleting a repository requires admin access.
 * If OAuth is used, the 'delete_repo' scope is required.
 * That's why we're using basic auth instead.
 */
export function deleteRepository(repositoryName, username, password) {
  log.debug('deleteRepository', { repositoryName });

  return new Promise((resolve, reject) => {
    superagent
      .delete(`${githubApiUrl}/repos/${username}/${repositoryName}`)
      .set({
        Authorization: authorizationUtil.basicAuthorization(username, password)
      })
      .end((err) => {
        if (err) {
          reject(filterErrorResponse(err));
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
 * @param isTwoFactorAuth
 */
export function initAddCommitAndPush(username, projectName, isTwoFactorAuth) {
  log.debug('initAddCommitAndPush', { username, projectName, isTwoFactorAuth });
  log.verbose('initialize github repo, create repo and push to repo', { username, projectName, isTwoFactorAuth });
  log.info('Pushing all files to the new git repository...');

  return new Promise((resolve) => {
    if (!isTwoFactorAuth) {
      git(`${process.cwd()}/${projectName}`)
        .init()
        .add('.gitignore')
        .add('./*')
        .commit('Initial Commit w/ :heart: by @hammer-io.')
        .addRemote('origin', `https://github.com/${username}/${projectName}.git`)
        .push('origin', 'master')
        .exec(() => {
          log.info('Please wait while files are pushed to GitHub...');
          setTimeout(() => {
            resolve();
          }, 10000); // TODO: Find a better way to do this than a timeout
        });
    } else {
      git(`${process.cwd()}/${projectName}`)
        .init()
        .add('.gitignore')
        .add('./*')
        .commit('Initial Commit w/ :heart: by @hammer-io.');
      log.warn('We cannot push hammer-io generated code to your repository because' +
      ' you have 2fa enabled. ' +
        'Please follow this link' +
        ' (https://help.github.com/articles/providing-your-2fa-authentication-code/) for' +
        ' support. Then manually add a new git remote and push your code using `git push origin' +
        ' master`');
      resolve();
    }
  });
}
