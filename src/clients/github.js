/* eslint-disable import/prefer-default-export */
import superagent from 'superagent';
import * as authorizationUtil from './../utils/authorization/authorization';
import { getActiveLogger } from '../utils/log/winston';

const githubApiUrl = 'https://api.github.com';
const githubApiAccept = 'application/vnd.github.v3+json';

const log = getActiveLogger();

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
