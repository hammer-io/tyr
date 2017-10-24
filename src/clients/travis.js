import superagent from 'superagent';
import chalk from 'chalk';
import * as authorizationUtil from './../utils/authorization';
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
  log.debug('getUserAccount');
  log.verbose('getting user account from travis');
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
          reject(filterErrorResponse(err));
        } else {
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
  log.debug('getUserInformation', account);
  log.verbose('getting user information from travis', account.login);

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
          reject(filterErrorResponse(err));
        } else {
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
  log.debug('getRepositoryId', { username, projectName });
  log.verbose('getting repository id from travis', { username, projectName });

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
          reject(filterErrorResponse(err));
        } else {
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
  log.verbose('activateTravisHook', { repositoryId });
  log.verbose('activating travis', { repositoryId });

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
          reject(filterErrorResponse(err));
        } else {
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
  log.debug('syncTravisWithGithub');
  log.verbose('syncing travis with github');

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
          reject(filterErrorResponse(err));
        } else {
          log.info('Please wait while we sync TravisCI with GitHub...');
          setTimeout(() => {
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
  log.debug('requestTravisToken');
  log.verbose('requesting token from travis');

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
          reject(filterErrorResponse(err));
        } else {
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
  log.debug('setEnvironmentVariable', { repoId });
  log.verbose('setEnvironmentVariable');

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
          reject(filterErrorResponse(err));
        } else {
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
  log.debug('listEnvironmentVariables', { repoId });

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
          reject(filterErrorResponse(err));
        } else {
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
          reject(filterErrorResponse(err));
        } else if (!res.body.repo) {
          reject(new Error(`Unable to find the repository '${repoSlug}'!`));
        } else {
          resolve(res.body.repo);
        }
      });
  });
}
