/* eslint-disable import/prefer-default-export */
import superagent from 'superagent';
import * as authorizationUtil from './../utils/authorization/authorization';

const githubApiUrl = 'https://api.github.com';
const githubApiAccept = 'application/vnd.github.v3+json';

/**
 * Make a request to https://api.github.com/user, and authenticate with basic authentication
 * @param username the username
 * @param password the password
 * @returns {Promise<any>} returns the user information
 */
export async function getCurrentUser(username, password) {
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
