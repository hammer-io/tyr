import inquirer from 'inquirer';

import constants from '../constants/constants';

const superagent = require('superagent');
const winston = require('winston');

const hammerAgent = 'Travis/1.0';

function activateTravisHook(repositoryId, travisAccessToken) {
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

function getRepositoryId(travisAccessToken, config) {
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

function deleteGitHubToken(githubUrl, config) {
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

function requestTravisToken(githubToken) {
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

function requestGitHubToken(config) {
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
        Authorization: `Basic ${Buffer.from(`${config.username}:${config.passw}`).toString('base64')}`
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

function promptPassword() {
  const questions = [{
    name: 'passw',
    type: 'password',
    message: 'GitHub Password:'
  }];

  return inquirer.prompt(questions);
}

export default async function enableTravisOnProject(username, projectName) {
  const answers = await promptPassword();
  const config = {
    username,
    projectName,
    passw: answers.passw
  };

  try {
    // Create a temporary GitHub oauth token
    const githubResponse = await requestGitHubToken(config);
    const githubToken = githubResponse.token;
    const githubUrl = githubResponse.url;

    // Use the GitHub token to get a Travis token
    const travisAccessToken = await requestTravisToken(githubToken);

    // Delete the temporary GitHub token
    await deleteGitHubToken(githubUrl, config);

    // Get the prjoect repository ID, and then use that ID to activate Travis for the project
    const repoId = await getRepositoryId(travisAccessToken, config);
    await activateTravisHook(repoId, travisAccessToken);

    winston.log('info', `TravisCI successfully enabled on ${config.username}/${config.projectName}`);
  } catch (err) {
    winston.log('error', constants.travisCI.error.enableTravisOnProject, err);
  }
}
