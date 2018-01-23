import superagent from 'superagent';
import * as authorizationUtil from '../utils/authorization';
import { getActiveLogger } from '../utils/winston';

const log = getActiveLogger();
const tyrAgent = 'Travis/1.0';
const travisApiAccept = 'application/vnd.travis-ci.2+json';

/**
 * Gets the proper travis api url depending on if the project should be private or not
 * @param isPrivate is the project private or not
 * @returns {string} the private or public url
 */
function getTravisApiUrl(isPrivate) {
  if (isPrivate) {
    return 'https://api.travis-ci.com'; // private repositories
  }

  return 'https://api.travis-ci.org'; // public repositories
}

/**
 * Filters out sensitive header information (such as authentication headers or post data)
 *
 * @param err
 * @returns {Error}
 */
function filterErrorResponse(err) {
  if (err && err.response) {
    const filteredError = {
      status: err.response.status,
      text: err.response.text,
      req: {}
    };
    if (err.response.req) {
      filteredError.req = {
        method: err.response.req.method,
        url: err.response.req.url
      };
    }
    return new Error(JSON.stringify(filteredError));
  }

  return err;
}

/**
 * Gets the user's account based on the access token provided
 *
 * See https://docs.travis-ci.com/api/#accounts for information about returns.
 *
 * @param travisAccessToken the access token to use to get account information
 * @param isPrivate is the project private or not

 * @returns {Promise}
 */
export function getUserAccount(travisAccessToken, isPrivate) {
  log.verbose('Travis Client - getUserAccount()');

  log.http(`GET ${getTravisApiUrl(isPrivate)}/accounts/ - getting user account`);
  return new Promise((resolve, reject) => {
    superagent
      .get(`${getTravisApiUrl(isPrivate)}/accounts/`)
      .set({
        'User-Agent': tyrAgent,
        Accept: travisApiAccept,
        Authorization: authorizationUtil.tokenAuthorization(travisAccessToken)
      })
      .end((err, res) => {
        if (err) {
          log.debug(`ERROR: GET ${getTravisApiUrl(isPrivate)}/accounts/ - error getting user account - 
            ${JSON.stringify({ status: err.status, message: err.message })}`);

          reject(filterErrorResponse(err));
        } else {
          log.debug(`RESPONSE: GET ${getTravisApiUrl(isPrivate)}/accounts/ - successfully got user account`);
          resolve(res.body);
        }
      });
  });
}

/**
 * Gets the repositories for a user
 * @param username the username to get the repostories for
 * @param travisAccessToken the user's access token
 * @param isPrivate is the project private or not
 * @returns {Promise<any>}
 */
export function getRepos(username, travisAccessToken, isPrivate) {
  log.http(`GET ${getTravisApiUrl(isPrivate)}/${username}/repos/ - getting user repositories`);
  return new Promise((resolve, reject) => {
    superagent
      .get(`${getTravisApiUrl(isPrivate)}/owner/${username}/repos`)
      .set({
        'User-Agent': tyrAgent,
        Accept: travisApiAccept,
        'Travis-Api-Version': 3,
        Authorization: `token ${travisAccessToken}`
      })
      .end((err, res) => {
        if (err) {
          log.debug(`ERROR: GET ${getTravisApiUrl(isPrivate)}/repos/ - error getting user repos - 
            ${JSON.stringify({ status: err.status, message: err.message })}`);
          reject(filterErrorResponse(err));
        } else {
          log.debug(`RESPONSE: GET ${getTravisApiUrl(isPrivate)}/accounts/ - successfully got user account`);
          resolve(res.body);
        }
      });
  });
}

/**
 * Get user information based on the account provided.
 *
 * See https://docs.travis-ci.com/api/#users for information about returns.
 *
 * @param travisAccessToken the access token to get user information
 * @param account the account to get user information about
 * @param isPrivate is the project private or not
 * @returns {Promise}
 */
export async function getUserInformation(travisAccessToken, account, isPrivate) {
  log.verbose('Travis Client - getUserInformation');

  log.http(`GET ${getTravisApiUrl(isPrivate)}/users/${account.id} - getting user information`);
  return new Promise((resolve, reject) => {
    superagent
      .get(`${getTravisApiUrl(isPrivate)}/users/${account.id}`)
      .set({
        'User-Agent': tyrAgent,
        Accept: travisApiAccept,
        Authorization: `token ${travisAccessToken}`
      })
      .end((err, res) => {
        if (err) {
          log.debug(`ERROR: GET ${getTravisApiUrl(isPrivate)}/users/${account.id} - error getting user information - 
            ${JSON.stringify({ status: err.status, message: err.message })}`);

          reject(filterErrorResponse(err));
        } else {
          log.debug(`RESPONSE: GET ${getTravisApiUrl(isPrivate)}/users/${account.id} - getting user information`);
          resolve(res.body);
        }
      });
  });
}

/**
 * Get github repo id from Travis-CI
 *
 * @param travisAccessToken the user's travis access token
 * @param username the username
 * @param projectName the project name
 * @param isPrivate is the project private or not
 * @returns {Promise}
 */
export function getRepositoryId(travisAccessToken, username, projectName, isPrivate) {
  log.verbose('Travis Client - getRepositoryId()');

  log.http(`GET ${getTravisApiUrl(isPrivate)}/repos/${username}/${projectName} - getting repository id for repository`);
  return new Promise((resolve, reject) => {
    superagent
      .get(`${getTravisApiUrl(isPrivate)}/repos/${username}/${projectName}`)
      .set({
        'User-Agent': tyrAgent,
        Accept: travisApiAccept,
        Authorization: `token ${travisAccessToken}`
      })
      .end((err, res) => {
        if (err) {
          log.debug(`ERROR: GET ${getTravisApiUrl(isPrivate)}/repos/${username}/${projectName} - failed to get repository id for repository - 
            ${JSON.stringify({ status: err.status, message: err.message })}`);
          reject(filterErrorResponse(err));
        } else {
          log.debug(`RESPONSE: GET ${getTravisApiUrl(isPrivate)}/repos/${username}/${projectName} - successfully got repository id for repository`);
          resolve(res.body.repo.id);
        }
      });
  });
}

/**
 * Activate Travis hook on a Github repository
 *
 * @param repositoryId the repository id of the project
 * @param travisAccessToken the user's travis access token
 * @param isPrivate is the project private or not
 * @returns {Promise}
 */
export function activateTravisHook(repositoryId, travisAccessToken, isPrivate) {
  log.verbose('Travis Client - activateTravisHook()');

  log.http(`PUT ${getTravisApiUrl(isPrivate)}/hooks - activating travis hook on repository with id ${repositoryId}`);
  return new Promise((resolve, reject) => {
    superagent
      .put(`${getTravisApiUrl(isPrivate)}/hooks`)
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
          log.debug(`PUT ${getTravisApiUrl(isPrivate)}/hooks - failed to activate travis hook on repository with id ${repositoryId} - 
            ${JSON.stringify({ status: err.status, message: err.message })}`);
          reject(filterErrorResponse(err));
        } else {
          log.debug(`PUT ${getTravisApiUrl(isPrivate)}/hooks - successfully activated travis hook on repository with id ${repositoryId}`);
          resolve();
        }
      });
  });
}

/**
 * Triggers a new sync with GitHub. Needed to see the newly-created repository
 *
 * @param travisAccessToken
 * @param isPrivate is the project private or not
 * @returns {Promise}
 */
export function syncTravisWithGithub(travisAccessToken, isPrivate) {
  log.verbose('Travis Client - syncTravisWithGithub()');

  log.http(`POST ${getTravisApiUrl(isPrivate)}/users/sync - syncing travis with github`);
  return new Promise((resolve, reject) => {
    superagent
      .post(`${getTravisApiUrl(isPrivate)}/users/sync`)
      .set({
        'User-Agent': tyrAgent,
        Accept: travisApiAccept,
        Authorization: `token ${travisAccessToken}`
      })
      .end((err) => {
        if (err) {
          log.debug(`ERROR: POST ${getTravisApiUrl(isPrivate)}/users/sync - error syncing travis with github - 
            ${JSON.stringify({ status: err.status, message: err.message })}`);
          reject(filterErrorResponse(err));
        } else {
          setTimeout(() => {
            log.debug(`RESPONSE: POST ${getTravisApiUrl(isPrivate)}/users/sync - successfully synced travis with github`);
            resolve();
          }, 10000); // TODO: Find a better way to do this than a timeout.
        }
      });
  });
}

/**
 * Request Travis-CI auth token
 *
 * @param githubToken tye user's github token
 * @param isPrivate is the project private or not

 * @returns {Promise}
 */
export function requestTravisToken(githubToken, isPrivate) {
  log.verbose('Travis Client - requestTravisToken()');

  log.http(`POST ${getTravisApiUrl(isPrivate)}/auth/github - getting travis token`);
  return new Promise((resolve, reject) => {
    superagent
      .post(`${getTravisApiUrl(isPrivate)}/auth/github`)
      .send({ github_token: githubToken })
      .set({
        'User-Agent': tyrAgent,
        Accept: travisApiAccept
      })
      .end((err, res) => {
        if (err) {
          log.debug(`ERROR: POST ${getTravisApiUrl(isPrivate)}/auth/github - getting travis token - 
            ${JSON.stringify({ status: err.status, message: err.message })}`);
          reject(err);
        } else {
          log.debug(`RESPONSE: POST ${getTravisApiUrl(isPrivate)}/auth/github - successfully got travis token`);
          resolve(res.body.access_token);
        }
      });
  });
}

/**
 * Set environment variables on a Travis-CI project
 *
 * @param travisAccessToken the user's travis access token
 * @param repoId the repository id
 * @param environmentVariable the environment variable to set
 * @param isPrivate is the project private or not
 * @returns {Promise}
 */
export function setEnvironmentVariable(travisAccessToken, repoId, environmentVariable, isPrivate) {
  log.verbose('Travis Client - setEnvironmentVariable()');

  log.http(`POST ${getTravisApiUrl(isPrivate)}/settings/env_vars - setting environment variables for repo with id ${repoId}`);
  return new Promise((resolve, reject) => {
    superagent
      .post(`${getTravisApiUrl(isPrivate)}/settings/env_vars`)
      .query({ repository_id: repoId })
      .send({ env_var: environmentVariable })
      .set({
        'User-Agent': tyrAgent,
        Accept: travisApiAccept,
        Authorization: `token ${travisAccessToken}`
      })
      .end((err, res) => {
        if (err) {
          log.debug(`ERROR: POST ${getTravisApiUrl(isPrivate)}/settings/env_vars - setting environment variables for repo with id ${repoId} -
            ${JSON.stringify({ status: err.status, message: err.message })}`);
          reject(filterErrorResponse(err));
        } else {
          log.debug(`RESPONSE: POST ${getTravisApiUrl(isPrivate)}/settings/env_vars - successfully set environment variables for repo with id ${repoId}`);
          resolve(res.body.env_var);
        }
      });
  });
}

/**
 * Lists environment variables for a repository that's been enabled in TravisCI.
 *
 * @param travisAccessToken the user's travis access token
 * @param repoId the repository id
 * @param isPrivate is the project private or not

 * @returns Promise (example shown below)
 * [
 *   {
 *     "id": "018e66f2-cd3a-4295-aa1d-018fe9aa0fb4",
 *     "name": "example",
 *     "value": "foobar",
 *     "public": true,
 *     "repository_id": 124920
 *   },
 *   {
 *     "id": "ec9423da-9658-4cd6-b282-fd0e5f6ed2df",
 *     "name": "secret_example",
 *     "public": false,
 *     "repository_id": 124920
 *   }
 * ]
 */
export function listEnvironmentVariables(travisAccessToken, repoId, isPrivate) {
  log.verbose('Travis Client - listEnvironmentVariables()');

  log.http(`GET ${getTravisApiUrl(isPrivate)}/settings/env_vars - getting environment variables for repo with id ${repoId}`);
  return new Promise((resolve, reject) => {
    superagent
      .get(`${getTravisApiUrl(isPrivate)}/settings/env_vars`)
      .query({ repository_id: repoId })
      .set({
        'User-Agent': tyrAgent,
        Accept: travisApiAccept,
        Authorization: `token ${travisAccessToken}`
      })
      .end((err, res) => {
        if (err) {
          log.debug(`ERROR: GET ${getTravisApiUrl(isPrivate)}/settings/env_vars - error getting environment variables for repo with id ${repoId} - 
            ${JSON.stringify({ status: err.status, message: err.message })}`);
          reject(filterErrorResponse(err));
        } else {
          log.debug(`RESPONSE: GET ${getTravisApiUrl(isPrivate)}/settings/env_vars - error getting environment variables for repo with id ${repoId}`);
          resolve(res.body.env_vars);
        }
      });
  });
}

/**
 * Fetch information for a given repository
 *
 * @param travisAccessToken the user's travis access token
 * @param username the username
 * @param repositoryName the name of the repository
 * @param isPrivate is the project private or not

 * @returns Promise (example shown below)
 * {
 *   "id": 82,
 *   "slug": "sinatra/sinatra",
 *   "description": "Classy web-development dressed in a DSL",
 *   "last_build_id": 23436881,
 *   "last_build_number": "792",
 *   "last_build_state": "passed",
 *   "last_build_duration": 2542,
 *   "last_build_started_at": "2014-04-21T15:27:14Z",
 *   "last_build_finished_at": "2014-04-21T15:40:04Z",
 *   "active": "true"
 * }
 */
export function fetchRepository(travisAccessToken, username, repositoryName, isPrivate) {
  const repoSlug = `${username}/${repositoryName}`;
  log.debug('fetchRepository', repoSlug);

  log.http(`GET ${getTravisApiUrl(isPrivate)}/repos/${repoSlug} - getting repository information on TravisCI`);
  return new Promise((resolve, reject) => {
    superagent
      .get(`${getTravisApiUrl(isPrivate)}/repos/${repoSlug}`)
      .set({
        'User-Agent': tyrAgent,
        Accept: travisApiAccept,
        Authorization: `token ${travisAccessToken}`
      })
      .end((err, res) => {
        if (err) {
          log.debug(`ERROR: GET ${getTravisApiUrl(isPrivate)}/repos/${repoSlug} - error getting repository information on TravisCI - 
            ${JSON.stringify({ status: err.status, message: err.message })}`);
          reject(filterErrorResponse(err));
        } else if (!res.body.repo) {
          reject(new Error(`Unable to find the repository '${repoSlug}'!`));
        } else {
          log.debug(`RESPONSE: GET ${getTravisApiUrl(isPrivate)}/repos/${repoSlug} - success getting repository information on TravisCI`);
          resolve(res.body.repo);
        }
      });
  });
}
