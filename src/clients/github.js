/* eslint-disable import/prefer-default-export */
import superagent from 'superagent';
import * as authorizationUtil from './../utils/authorization/authorization';
import { getActiveLogger } from '../utils/log/winston';

const githubApiUrl = 'https://api.github.com';
const githubApiAccept = 'application/vnd.github.v3+json';

const log = getActiveLogger();

/**
 * Delete GitHub OAuth token.
 *
 * @param githubUrl
 * @param username
 * @param password
 * @returns {Promise}
 */
export async function deleteGitHubToken(githubUrl, username, password) {
  log.verbose('deleting github token');
  log.debug('deleteGitHubToken', { username });

  if (githubUrl) {
    return new Promise((resolve, reject) => {
      superagent
        .delete(githubUrl)
        .set({ Authorization: authorizationUtil.basicAuthorization(username, password) })
        .end((err) => {
          if (err) {
            if (err.response.status !== 404) {
              reject(err);
            } else {
              resolve();
            }
          } else {
            log.info('Successfully deleted github token');
            resolve();
          }
        });
    });
  }
  return undefined;
}

/**
 * Request GitHub OAuth token.
 *
 * @param username github username
 * @param password github password

 * @param note the remark assigned to the given token in the user's GitHub account
 * @returns Promise github token information if successful, error information otherwise
 */
export function requestGitHubToken(username, password, note = 'hammer-io token') {
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

  request = request.set({
    'Content-Type': 'application/json',
    Authorization: authorizationUtil.basicAuthorization(username, password)
  });

  return new Promise((resolve, reject) => {
    // Create a GitHub token via the GitHub API, store GitHub token and URL.
    request.end((err, res) => {
      if (err) {
        reject(err);
      } else {
        resolve({ token: res.body.token, url: res.body.url });
      }
    });
  });
}

/**
 * Make a request to https://api.github.com/user, and authenticate with basic authentication
 * @param username the username
 * @param password the password
 * @returns {Promise<any>} returns the user information
 */
export async function getCurrentUser(username, password) {
  log.debug('getCurrentUser', { username });

  return new Promise((resolve, reject) => {
    superagent
      .get(`${githubApiUrl}/user`)
      .set({
        Accept: githubApiAccept,
        Authorization:
          authorizationUtil.basicAuthorization(username, password),
      })
      .end((error, res) => {
        if (error) {
          reject(error);
        } else {
          resolve(res.body);
        }
      });
  });
}

/**
 * Make a request to https://api.github.com/user/repos, and authenticate with basic auth
 * @param repositoryName the repository name to create
 * @param repositoryDescription the description of the repository
 * @param username the username of the user
 * @param password the password of the user
 * @returns {Promise<any>}
 */
export async function createRepository(repositoryName, repositoryDescription, username, password) {
  log.debug('createGitHubRepository', { repositoryName });

  return new Promise((resolve, reject) => {
    superagent
      .post(`${githubApiUrl}/user/repos`)
      .set({
        Authorization: authorizationUtil.basicAuthorization(username, password)
      })
      .send({
        name: repositoryName,
        description: repositoryDescription,
        private: false
      })
      .end((error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
  });
}
