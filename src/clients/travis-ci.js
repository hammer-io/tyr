const superagent = require('superagent');
const winston = require('winston');

const hammerAgent = 'Travis/1.0';

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
      .get(`https://api.travis-ci.org/repos/${config.username}/${config.projectName}`)
      .set({
        'User-Agent': hammerAgent,
        Accept: 'application/vnd.travis-ci.2+json',
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
      .put('https://api.travis-ci.org/hooks')
      .send({
        hook: {
          id: repositoryId,
          active: true
        }
      })
      .set({
        'User-Agent': hammerAgent,
        Accept: 'application/vnd.travis-ci.2+json',
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
      .post('https://api.travis-ci.org/auth/github')
      .send({ github_token: githubToken })
      .set({
        'User-Agent': hammerAgent,
        Accept: 'application/vnd.travis-ci.2+json'
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
  winston.log('verbose', 'setEnvironmentVariables');

  return new Promise((resolve, reject) => {
    superagent
      .post('https://api.travis-ci.org/settings/env_vars')
      .query({repository_id: repoId})
      .send({ env_vars: environmentVariables })
      .set({
        'User-Agent': hammerAgent,
        Accept: 'application/vnd.travis-ci.2+json',
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