const superagent = require('superagent');
const winston = require('winston');

const githubApiUrl = 'https://api.github.com';
const git = require('simple-git');

/**
 * Returns the string used for the basic authorization header in a POST request.
 *
 * @param username
 * @param password
 * @returns {string}
 */
function basicAuthorization(username, password) {
  return `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`;
}

/**
 * Returns the string used for the token authorization header in a POST request
 *
 * @param token
 * @returns {string}
 */
function tokenAuthorization(token) {
  return `token ${token}`;
}

/**
 * Request GitHub OAuth token.
 *
 * @param credentials a users github credentials
 *    {
 *      username: 'username',
 *      password: 'password'
 *    }
 *
 *  @param otpCode the user's two factor authentication code.
 *                  If user does not use two factor authentication, otpCode
 *                 will be null or their two factor authentication has not been
 *                 provided.
 * @returns {Promise}
 */
export function requestGitHubToken(credentials, otpCode) {
  winston.log('verbose', 'requestGitHubToken', credentials.username);
  let request = superagent
    .post(`${githubApiUrl}/authorizations`)
    .send({
      scopes: [
        'read:org', 'user:email', 'repo_deployment',
        'repo:status', 'public_repo', 'write:repo_hook',
        'user', 'repo'
      ],
      note: 'hammer-io token'
    });

  // if the user is using
  if (otpCode) {
    request = request.set({
      'X-GitHub-OTP': otpCode
    });
  }

  request = request.set({
    'Content-Type': 'application/json',
    Authorization: basicAuthorization(credentials.username, credentials.password)
  });

  return new Promise((resolve, reject) => {
    // Create a GitHub token via the GitHub API, store GitHub token and URL.
    request.end((err, res) => {
      if (err) {
        reject(err);
      } else {
        resolve({ token: res.body.token, url: res.body.url });
      }
    });
  });
}

/**
 * Delete GitHub OAuth token.
 *
 * @param githubUrl
 * @param username
 * @param password
 * @returns {Promise}
 */
export function deleteGitHubToken(githubUrl, token) {
  winston.log('verbose', 'deleteGitHubToken');

  return new Promise((resolve, reject) => {
    superagent
      .delete(githubUrl)
      .set({ Authorization: tokenAuthorization(token) })
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
 * Initialize an empty repository within a git repo, add the gitignore, and the rest of the files.
 * Commit them, create the remote repository and push the commit to the remote repository.
 *
 * @param projectName
 * @param projectDescription
 * @param username
 * @param password
 */
export function createGitHubRepository(projectName, projectDescription, token) {
  winston.log('verbose', 'createGitHubRepository', { projectName });

  return new Promise((resolve, reject) => {
    superagent
      .post(`${githubApiUrl}/user/repos`)
      .set({
        Authorization: tokenAuthorization(token)
      })
      .send({
        name: projectName,
        description: projectDescription,
        private: false
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
 * Init the git repository, add all the files, make the first commit,
 * add the remote origin, and push origin to master.
 *
 * @param username
 * @param projectName
 */
export function initAddCommitAndPush(username, projectName, isTwoFactorAuth) {
  winston.log('verbose', 'initAddCommitAndPush', { username, projectName });
  winston.log('info', 'Pushing all files to the new git repository...');

  return new Promise((resolve) => {
    if (!isTwoFactorAuth) {
      git(`${process.cwd()}/${projectName}`)
        .init()
        .add('.gitignore')
        .add('./*')
        .commit('Initial commit')
        .addRemote('origin', `https://github.com/${username}/${projectName}.git`)
        .push('origin', 'master')
        .exec(() => {
          console.log('Please wait while the files are uploaded...');
          setTimeout(() => {
            resolve();
          }, 10000); // TODO: Find a better way to do this than a timeout
        });
    } else {
      git(`${process.cwd()}/${projectName}`)
        .init()
        .add('.gitignore')
        .add('./*')
        .commit('Initial commit');
      console.log('We cannot push hammer-io generated code to your repository because you have 2fa enabled. ' +
        'Please follow this link (https://help.github.com/articles/providing-your-2fa-authentication-code/) for support. ');
    }
  });
}
