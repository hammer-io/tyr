const superagent = require('superagent');
const winston = require('winston');

const githubApiUrl = 'https://api.github.com';

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
          'repo:status',
          'public_repo', 'write:repo_hook'
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
