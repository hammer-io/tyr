import superagent from 'superagent';
import * as authorizationUtil from '../utils/authorization';
import { getActiveLogger } from '../utils/winston';

const log = getActiveLogger();
const tyrAgent = 'Travis/1.0';
const travisApiUrl = 'https://api.travis-ci.org';
const travisApiAccept = 'application/vnd.travis-ci.2+json';

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
 * @returns {Promise}
 */
export function getUserAccount(travisAccessToken) {
  log.verbose('Travis Client - getUserAccount()');

  log.http(`GET ${travisApiUrl}/accounts/ - getting user account`);
  return new Promise((resolve, reject) => {
    superagent
      .get(`${travisApiUrl}/accounts/`)
      .set({
        'User-Agent': tyrAgent,
        Accept: travisApiAccept,
        Authorization: authorizationUtil.tokenAuthorization(travisAccessToken)
      })
      .end((err, res) => {
        if (err) {
          log.debug(`ERROR: GET ${travisApiUrl}/accounts/ - error getting user account - 
            ${JSON.stringify({ status: err.status, message: err.message })}`);

          reject(filterErrorResponse(err));
        } else {
          log.debug(`RESPONSE: GET ${travisApiUrl}/accounts/ - successfully got user account`);
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
 *  @param travisAccessToken the access token to get user information
 * @param account the account to get user information about
 * @returns {Promise}
 */
export async function getUserInformation(travisAccessToken, account) {
  log.verbose('Travis Client - getUserInformation');

  log.http(`GET ${travisApiUrl}/users/${account.id} - getting user information`);
  return new Promise((resolve, reject) => {
    superagent
      .get(`${travisApiUrl}/users/${account.id}`)
      .set({
        'User-Agent': tyrAgent,
        Accept: travisApiAccept,
        Authorization: `token ${travisAccessToken}`
      })
      .end((err, res) => {
        if (err) {
          log.debug(`ERROR: GET ${travisApiUrl}/users/${account.id} - error getting user information - 
            ${JSON.stringify({ status: err.status, message: err.message })}`);

          reject(filterErrorResponse(err));
        } else {
          log.debug(`RESPONSE: GET ${travisApiUrl}/users/${account.id} - getting user information`);
          resolve(res.body);
        }
      });
  });
}

/**
 * Get github repo id from Travis-CI
 *
 * @param travisAccessToken
 * @param username
 * @param projectName
 * @returns {Promise}
 */
export function getRepositoryId(travisAccessToken, username, projectName) {
  log.verbose('Travis Client - getRepositoryId()');

  log.http(`GET ${travisApiUrl}/repos/${username}/${projectName} - getting repository id for repository`);
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
          log.debug(`ERROR: GET ${travisApiUrl}/repos/${username}/${projectName} - failed to get repository id for repository - 
            ${JSON.stringify({ status: err.status, message: err.message })}`);
          reject(filterErrorResponse(err));
        } else {
          log.debug(`RESPONSE: GET ${travisApiUrl}/repos/${username}/${projectName} - successfully got repository id for repository`);
          resolve(res.body.repo.id);
        }
      });
  });
}

/**
 * Activate Travis hook on a Github repository
 *
 * @param repositoryId
 * @param travisAccessToken
 * @returns {Promise}
 */
export function activateTravisHook(repositoryId, travisAccessToken) {
  log.verbose('Travis Client - activateTravisHook()');

  log.http(`PUT ${travisApiUrl}/hooks - activating travis hook on repository with id ${repositoryId}`);
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
          log.debug(`PUT ${travisApiUrl}/hooks - failed to activate travis hook on repository with id ${repositoryId} - 
            ${JSON.stringify({ status: err.status, message: err.message })}`);
          reject(filterErrorResponse(err));
        } else {
          log.debug(`PUT ${travisApiUrl}/hooks - successfully activated travis hook on repository with id ${repositoryId}`);
          resolve();
        }
      });
  });
}

/**
 * Triggers a new sync with GitHub. Needed to see the newly-created repository
 *
 * @param travisAccessToken
 * @returns {Promise}
 */
export function syncTravisWithGithub(travisAccessToken) {
  log.verbose('Travis Client - syncTravisWithGithub()');

  log.http(`POST ${travisApiUrl}/users/sync - syncing travis with github`);
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
          log.debug(`ERROR: POST ${travisApiUrl}/users/sync - error syncing travis with github - 
            ${JSON.stringify({ status: err.status, message: err.message })}`);
          reject(filterErrorResponse(err));
        } else {
          setTimeout(() => {
            log.debug(`RESPONSE: POST ${travisApiUrl}/users/sync - successfully synced travis with github`);
            resolve();
          }, 10000); // TODO: Find a better way to do this than a timeout.
        }
      });
  });
}

/**
 * Request Travis-CI auth token
 *
 * @param githubToken
 * @returns {Promise}
 */
export function requestTravisToken(githubToken) {
  log.verbose('Travis Client - requestTravisToken()');

  log.http(`POST ${travisApiUrl}/auth/github - getting travis token`);
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
          log.debug(`ERROR: POST ${travisApiUrl}/auth/github - getting travis token - 
            ${JSON.stringify({ status: err.status, message: err.message })}`);
          reject(err);
        } else {
          log.debug(`RESPONSE: POST ${travisApiUrl}/auth/github - successfully got travis token`);
          resolve(res.body.access_token);
        }
      });
  });
}

/**
 * Set environment variables on a Travis-CI project
 *
 * @param travisAccessToken
 * @param repoId
 * @param environmentVariable
 * @returns {Promise}
 */
export function setEnvironmentVariable(travisAccessToken, repoId, environmentVariable) {
  log.verbose('Travis Client - setEnvironmentVariable()');

  log.http(`POST ${travisApiUrl}/settings/env_vars - setting environment variables for repo with id ${repoId}`);
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
          log.debug(`ERROR: POST ${travisApiUrl}/settings/env_vars - setting environment variables for repo with id ${repoId} -
            ${JSON.stringify({ status: err.status, message: err.message })}`);
          reject(filterErrorResponse(err));
        } else {
          log.debug(`RESPONSE: POST ${travisApiUrl}/settings/env_vars - successfully set environment variables for repo with id ${repoId}`);
          resolve(res.body.env_var);
        }
      });
  });
}

/**
 * Lists environment variables for a repository that's been enabled in TravisCI.
 *
 * @param travisAccessToken
 * @param repoId
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
export function listEnvironmentVariables(travisAccessToken, repoId) {
  log.verbose('Travis Client - listEnvironmentVariables()');

  log.http(`GET ${travisApiUrl}/settings/env_vars - getting environment variables for repo with id ${repoId}`);
  return new Promise((resolve, reject) => {
    superagent
      .get(`${travisApiUrl}/settings/env_vars`)
      .query({ repository_id: repoId })
      .set({
        'User-Agent': tyrAgent,
        Accept: travisApiAccept,
        Authorization: `token ${travisAccessToken}`
      })
      .end((err, res) => {
        if (err) {
          log.debug(`ERROR: GET ${travisApiUrl}/settings/env_vars - error getting environment variables for repo with id ${repoId} - 
            ${JSON.stringify({ status: err.status, message: err.message })}`);
          reject(filterErrorResponse(err));
        } else {
          log.debug(`RESPONSE: GET ${travisApiUrl}/settings/env_vars - error getting environment variables for repo with id ${repoId}`);
          resolve(res.body.env_vars);
        }
      });
  });
}

/**
 * Fetch information for a given repository
 *
 * @param travisAccessToken
 * @param username
 * @param repositoryName
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
export function fetchRepository(travisAccessToken, username, repositoryName) {
  const repoSlug = `${username}/${repositoryName}`;
  log.debug('fetchRepository', repoSlug);

  log.http(`GET ${travisApiUrl}/repos/${repoSlug} - getting repository information on TravisCI`);
  return new Promise((resolve, reject) => {
    superagent
      .get(`${travisApiUrl}/repos/${repoSlug}`)
      .set({
        'User-Agent': tyrAgent,
        Accept: travisApiAccept,
        Authorization: `token ${travisAccessToken}`
      })
      .end((err, res) => {
        if (err) {
          log.debug(`ERROR: GET ${travisApiUrl}/repos/${repoSlug} - error getting repository information on TravisCI - 
            ${JSON.stringify({ status: err.status, message: err.message })}`);
          reject(filterErrorResponse(err));
        } else if (!res.body.repo) {
          reject(new Error(`Unable to find the repository '${repoSlug}'!`));
        } else {
          log.debug(`RESPONSE: GET ${travisApiUrl}/repos/${repoSlug} - success getting repository information on TravisCI`);
          resolve(res.body.repo);
        }
      });
  });
}
