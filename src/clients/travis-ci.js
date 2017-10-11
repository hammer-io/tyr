const superagent = require('superagent');
const winston = require('winston');

const hammerAgent = 'Travis/1.0';
const travisApiUrl = 'https://api.travis-ci.org';
const travisApiAccept = 'application/vnd.travis-ci.2+json';

/**
 * Get github repo id from Travis-CI
 */
export function getRepositoryId(travisAccessToken, config) {
  winston.log('verbose', 'getRepositoryId', {
    username: config.username,
    projectName: config.projectName
  });

  return new Promise((resolve, reject) => {
    superagent
      .get(`${travisApiUrl}/repos/${config.username}/${config.projectName}`)
      .set({
        'User-Agent': hammerAgent,
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
        'User-Agent': hammerAgent,
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
 * Request Travis-CI auth token
 */
export function requestTravisToken(githubToken) {
  winston.log('verbose', 'requestTravisToken');

  return new Promise((resolve, reject) => {
    superagent
      .post(`${travisApiUrl}/auth/github`)
      .send({ github_token: githubToken })
      .set({
        'User-Agent': hammerAgent,
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
export function setEnvironmentVariables(travisAccessToken, repoId, environmentVariables) {
  winston.log('verbose', 'setEnvironmentVariables', { repoId });

  return new Promise((resolve, reject) => {
    superagent
      .post(`${travisApiUrl}/settings/env_vars`)
      .query({ repository_id: repoId })
      .send({ env_vars: environmentVariables })
      .set({
        'User-Agent': hammerAgent,
        Accept: travisApiAccept,
        Authorization: `token ${travisAccessToken}`
      })
      .end((err, res) => {
        if (err) {
          reject(err);
        } else {
          resolve(res.body.env_vars);
        }
      });
  });
}
