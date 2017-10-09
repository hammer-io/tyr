import inquirer from 'inquirer';

const superagent = require('superagent');
const winston = require('winston');

const hammerAgent = 'Travis/1.0';
let travisAccessToken = '';

function activateTravisHook(repositoryId) {
  winston.log('info', 'activateTravisHook', {
    repositoryId
  });
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
      if (err) { return console.log(err); }
      winston.log('info', 'activateTravisHook', 'SUCCESS!');
    });
}

function getRepositoryId(config) {
  winston.log('info', 'getRepositoryId', {
    username: config.username,
    projectName: config.projectName
  });
  superagent
    .get(`https://api.travis-ci.org/repos/${config.username}/${config.projectName}`)
    .set({
      'User-Agent': hammerAgent,
      Accept: 'application/vnd.travis-ci.2+json',
      Authorization: `token ${travisAccessToken}`
    })
    .end((err, res) => {
      if (err) { return console.log(err); }
      activateTravisHook(res.body.repo.id);
    });
}

function deleteGitHubToken(githubToken, url, config) {
  winston.log('info', 'deleteGitHubToken', {
    username: config.username,
    projectName: config.projectName
  });
  superagent
    .delete(url)
    .send({ githubToken })
    .set({ Authorization: `Basic ${Buffer.from(`${config.username}:${config.passw}`).toString('base64')}` })
    .end((err) => {
      if (err) { return console.log(err); }
      getRepositoryId(config);
    });
}

function requestTravisToken(githubToken, url, config) {
  winston.log('info', 'requestTravisToken', {
    username: config.username,
    projectName: config.projectName
  });
  superagent
    .post('https://api.travis-ci.org/auth/github')
    .send({ github_token: githubToken })
    .set({
      'Content-Type': 'application/json',
      'User-Agent': hammerAgent,
      Accept: 'application/vnd.travis-ci.2+json'
    })
    .end((err, res) => {
      if (err) { return console.log(err); }

      // Store the TravisCI access token
      travisAccessToken = res.body.access_token;

      // Delete the GitHub token via the GitHub API.
      deleteGitHubToken(githubToken, url, config)
    });
}

function requestGitHubToken(config) {
  winston.log('info', 'requestGitHubToken', {
    username: config.username,
    projectName: config.projectName
  });
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
      if (err) { return console.log(err); }

      // Use the /auth/github endpoint to exchange it for an access token. Store the access token.
      requestTravisToken(res.body.token, res.body.url, config);
    });
}

export default function enableTravisOnProject(username, projectName) {
  const questions = [{
    name: 'passw',
    type: 'password',
    message: 'GitHub Password:'
  }];

  inquirer.prompt(questions).then((answers) => {
    const config = {
      username,
      projectName,
      passw: answers.passw
    };
    requestGitHubToken(config);
  });
}
