const superagent = require('superagent');
const winston = require('winston');

const hammerAgent = 'Travis/1.0';

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
        'Content-Type': 'application/json',
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

export function requestTravisToken(githubToken) {
  winston.log('verbose', 'requestTravisToken');

  return new Promise((resolve, reject) => {
    superagent
      .post('https://api.travis-ci.org/auth/github')
      .send({ github_token: githubToken })
      .set({
        'Content-Type': 'application/json',
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