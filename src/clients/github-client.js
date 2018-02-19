/* eslint-disable import/prefer-default-export */
import superagent from 'superagent';
import * as authorizationUtil from '../utils/authorization';
import { getActiveLogger } from '../utils/winston';

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
  log.verbose('Github Client deleteGithubToken()');

  if (githubUrl) {
    log.http(`DELETE ${githubUrl} - deleting github token for ${username}`);
    return new Promise((resolve, reject) => {
      superagent
        .delete(githubUrl)
        .set({ Authorization: authorizationUtil.basicAuthorization(username, password) })
        .end((err) => {
          if (err) {
            log.debug(`ERROR: DELETE ${githubUrl} - error deleting github token for ${username} - 
              ${JSON.stringify({ status: err.status, message: err.message })}`);
            if (err.response.status !== 404) {
              reject(err);
            } else {
              resolve();
            }
          } else {
            log.debug(`RESPONSE: DELETE DELETE ${githubUrl} - successfully deleted github token for ${username}`);
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
  log.verbose('Github Client requestGithubToken', username);
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

  log.http(`POST ${githubApiUrl}/authorizations - getting token for ${username}`);
  return new Promise((resolve, reject) => {
    // Create a GitHub token via the GitHub API, store GitHub token and URL.
    request.end((err, res) => {
      if (err) {
        log.debug(`ERROR: ${githubApiUrl}/authorizations - error getting token for ${username} - 
        ${JSON.stringify({ status: err.status, message: err.message })}`);
        reject(err);
      } else {
        log.debug(`RESPONSE: ${githubApiUrl}/authorizations - successfully retrieved token for ${username}`);
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
  log.debug(`Github Client getCurrentUser() - ${username}`);

  log.http(`GET ${githubApiUrl}/user - getting current user information for ${username}`);
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
          log.debug(`ERROR: GET ${githubApiUrl}/user - error getting current user information - ${{ status: error.status, message: error.message }}`);
          reject(error);
        } else {
          log.debug(`RESPONSE: GET ${githubApiUrl}/user - successfully retrieved current user information for ${username}`);
          resolve(res.body);
        }
      });
  });
}

/**
 * Makes a GET request to the /users/repos?page=#.
 *
 * This gets the repositories for the signed in user. GitHub takes advantage of paging.
 * @param username the username to get repositories for
 * @param password the password of the user
 * @param pageNumber the page number, GitHub takes advantage of paging, so we will pass in a page
 *                      number which will get the page.
 * @returns {Promise<any>}
 */
export async function getRepositories(username, password, pageNumber) {
  log.verbose('Github Client - getUserRepositories()');

  log.http(`GET ${githubApiUrl}/users/repos?page=${pageNumber} - get user repositories`);
  return new Promise((resolve, reject) => {
    superagent
      .get(`${githubApiUrl}/user/repos?page=${pageNumber}`)
      .set({
        Authorization: authorizationUtil.basicAuthorization(username, password)
      })
      .end((err, res) => {
        if (err) {
          log.debug(`ERROR: GET ${githubApiUrl}/user/repos - error getting user repositories -
         ${JSON.stringify({ status: err.status, message: err.message })}`);
          reject(err);
        } else {
          log.debug(`RESPONSE: ${githubApiUrl}/user/repos - successfully got user repositories`);
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
 * @param isPrivate flag to determine if a private project should be created or not
 * @returns {Promise<any>}
 */
export async function createRepository(
  repositoryName,
  repositoryDescription,
  username,
  password,
  token,
  isPrivate
) {
  log.verbose('Github Client createRepository()');
  const payload = {
    name: repositoryName,
    description: repositoryDescription,
    private: isPrivate
  };

  let authorization;
  if (token) {
    authorization = authorizationUtil.tokenAuthorization(token);
  } else {
    authorization = authorizationUtil.basicAuthorization(username, password);
  }

  log.http(`POST ${githubApiUrl}/user/repos - creating github repository - ${JSON.stringify(payload)}`);
  return new Promise((resolve, reject) => {
    superagent
      .post(`${githubApiUrl}/user/repos`)
      .set({
        Authorization: authorization
      })
      .send(payload)
      .end((err) => {
        if (err) {
          log.debug(`ERROR: POST ${githubApiUrl}/user/repos - error creating github repository - 
            ${JSON.stringify({ status: err.status, message: err.message })}`);
          reject(err);
        } else {
          log.debug(`RESPONSE: ${githubApiUrl}/user/repos - successfully created github repository`);
          resolve();
        }
      });
  });
}
