const files = require('../util/files');
const Preferences = require('preferences');
const GitHubApi = require('github');
const _ = require('lodash');
const git = require('simple-git')();
// const touch       = require('touch');
const fs = require('fs');

const github = new GitHubApi({
  version: '3.0.0'
});

function authenticateCredentials(credentials, callback) {
  const prefs = new Preferences('ginit');

  console.log(prefs.github);

  if (prefs.github && prefs.github.token) {
    return callback(null, prefs.github.token);
  }

  github.authenticate(_.extend(
    {
      type: 'basic',
    },
    {
      username: credentials.githubUsername,
      password: credentials.githubPassword
    }
  ));

  github.authorization.create({
    scopes: ['user', 'public_repo', 'repo', 'repo:status'],
    note: 'ginit, the command-line tool for initalizing Git repos'
  }, (err, res) => {
    if (err) {
      return callback(err);
    }
    if (res.token) {
      prefs.github = {
        token: res.token
      };
      console.log(res.token);
      return callback(null, res.token);
    }
    return callback();
  });
}

function createGitIgnore(config, callback) {
  fs.readFile('./templates/template-gitignore', (readErr, contents) => {
    if (readErr) {
      console.log('An error occurred while reading template-gitignore');
    } else {
      fs.writeFile(`${config.projectName}/.gitignore`, contents, (writeErr) => {
        if (writeErr) {
          console.log(`An error occurred while writing ${config.projectName}/.gitignore`);
        } else {
          return authenticateCredentials(config, callback);
        }
      })
    }
  });
}

module.exports = function initGit(config) {
  if (files.directoryExists(`${config.projectName}.git`)) {
    console.log('A git repository already exists');
  } else {
  // Create remote Repo
    createGitIgnore(config, (err, token) =>{
      if (err) {
        console.log(err);
      } else if (token) {
        console.log(token);
      } else {
        console.log('Token does not exist');
      }
    });
  }
};

