const superagent = require('superagent');
const winston = require('winston');

/**
 * Request github oauth token
 */
export function requestGitHubToken(config) {
  winston.log('verbose', 'requestGitHubToken', { username: config.username });

  return new Promise((resolve, reject) => {
    // Create a GitHub token via the GitHub API, store GitHub token and URL.
    superagent
      .post('https://api.github.com/authorizations')
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
        Authorization: `Basic ${Buffer.from(`${config.username}:${config.password}`).toString('base64')}`
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
      // .send({ config.githubToken })
      .set({ Authorization: `Basic ${Buffer.from(`${config.username}:${config.passw}`).toString('base64')}` })
      .end((err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
  });
}