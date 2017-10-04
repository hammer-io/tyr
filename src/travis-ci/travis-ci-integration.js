import inquirer from 'inquirer';

const superagent = require('superagent');

const hammerAgent = 'HammerCLI/1.0.0';
let travisAccessToken = '';

function deleteGitHubToken(githubToken, url, config) {
  superagent
    .delete(url)
    .send({ githubToken })
    .set({ Authorization: `Basic ${Buffer.from(`${config.username}:${config.passw}`).toString('base64')}` })
    .end((err) => {
      if (err) { return console.log(err); }
      console.log('Finished! Ready to do more travis stuff with my new shiny token.');
    });
}

function requestTravisToken(githubToken, url, config) {
  superagent
    .post('https://api.travis-ci.org/auth/github')
    .send({ github_token: githubToken })
    .set({
      'Content-Type': 'application/json',
      'User-Agent': hammerAgent,
      Accept: 'application/vnd.travis-ci.2+json',
      'Content-Length': 37
    })
    .end((err, res) => {
      if (err) { return console.log(err); }

      // Store the TravisCI access token
      travisAccessToken = res.access_token;

      // Delete the GitHub token via the GitHub API.
      deleteGitHubToken(githubToken, url, config)
    });
}

function requestGitHubToken(config) {
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
      Authorzation: `Basic ${Buffer.from(`${config.username}:${config.passw}`).toString('base64')}`
    })
    .end((err, res) => {
      if (err) { return console.log(err); }

      // Store token and url
      const { github_token } = res.token;
      const { url } = res.url;

      // Use the /auth/github endpoint to exchange it for an access token. Store the access token.
      requestTravisToken(github_token, url, config);
    });
}

function activateTravisHook(repositoryId) {
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
      'Content-Length': 37,
      Authorization: `token ${travisAccessToken}`
    })
    .end((err) => {
      if (err) { return console.log(err); }

      console.log('SUCCESS');
    });
}

function getRepositoryId(config) {
  superagent
    .get(`https://api.travis-ci.org/repos/${config.username}/${config.projectName}`)
    .set({
      'User-Agent': hammerAgent,
      Accept: 'application/vnd.travis-ci.2+json',
      Authorization: `token ${travisAccessToken}`
    })
    .end((err, res) => {
      if (err) { return console.log(err); }
      activateTravisHook(res.repo.id);
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
    getRepositoryId(config);
  });
}
