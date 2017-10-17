const superagent = require('superagent');
const winston = require('winston');

const tyrAgent = 'Travis/1.0';
const travisApiUrl = 'https://api.travis-ci.org';
const travisApiAccept = 'application/vnd.travis-ci.2+json';

/**
 * Get github repo id from Travis-CI
 */
export function getRepositoryId(travisAccessToken, username, projectName) {
  winston.log('verbose', 'getRepositoryId', { username, projectName });

  return new Promise((resolve, reject) => {
    superagent
      .get(`${travisApiUrl}/repos/${username}/${projectName}`)
      .set({
        'User-Agent': tyrAgent,
        Accept: travisApiAccept,
        Authorization: `token ${travisAccessToken}`
      })
      .end((err, res) => {
        if (err) {
          reject(err);
        } else {
          resolve(res.body.repo.id);
        }
      });
  });
}

/**
 * Activate Travis hook on a Github repository
 */
export function activateTravisHook(repositoryId, travisAccessToken) {
  winston.log('verbose', 'activateTravisHook', { repositoryId });

  return new Promise((resolve, reject) => {
    superagent
      .put(`${travisApiUrl}/hooks`)
      .send({
        hook: {
          id: repositoryId,
          active: true
        }
      })
      .set({
        'User-Agent': tyrAgent,
        Accept: travisApiAccept,
        Authorization: `token ${travisAccessToken}`
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
 * Triggers a new sync with GitHub. Needed to see the newly-created repository
 */
export function syncTravisWithGithub(travisAccessToken) {
  winston.log('verbose', 'syncTravisWithGithub');

  return new Promise((resolve, reject) => {
    superagent
      .post(`${travisApiUrl}/users/sync`)
      .set({
        'User-Agent': tyrAgent,
        Accept: travisApiAccept,
        Authorization: `token ${travisAccessToken}`
      })
      .end((err) => {
        if (err) {
          reject(err);
        } else {
          console.log('Please wait while we sync TravisCI with GitHub...');
          setTimeout(() => {
            resolve();
          }, 10000); // TODO: Find a better way to do this than a timeout.
        }
      });
  });
}

/**
 * Request Travis-CI auth token
 */
export function requestTravisToken(githubToken) {
  winston.log('verbose', 'requestTravisToken');

  return new Promise((resolve, reject) => {
    superagent
      .post(`${travisApiUrl}/auth/github`)
      .send({ github_token: githubToken })
      .set({
        'User-Agent': tyrAgent,
        Accept: travisApiAccept
      })
      .end((err, res) => {
        if (err) {
          reject(err);
        } else {
          resolve(res.body.access_token);
        }
      });
  });
}

/**
 * Set environment variables on a Travis-CI project
 */
export function setEnvironmentVariable(travisAccessToken, repoId, environmentVariable) {
  winston.log('verbose', 'setEnvironmentVariable', { repoId });

  return new Promise((resolve, reject) => {
    superagent
      .post(`${travisApiUrl}/settings/env_vars`)
      .query({ repository_id: repoId })
      .send({ env_var: environmentVariable })
      .set({
        'User-Agent': tyrAgent,
        Accept: travisApiAccept,
        Authorization: `token ${travisAccessToken}`
      })
      .end((err, res) => {
        if (err) {
          reject(err);
        } else {
          resolve(res.body.env_var);
        }
      });
  });
}
