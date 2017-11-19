import superagent from 'superagent';
import { getActiveLogger } from '../utils/winston';

import * as authorizationUtil from './../utils/authorization';

const log = getActiveLogger();
const herokuApiUrl = 'https://api.heroku.com';
const herokuApiAccept = ' application/vnd.heroku+json; version=3';

/**
 * Exchanges a username/password pair for a token
 *
 * @param email heroku email
 * @param password heroku password
 *
 * @returns token information if successful, otherwise the error
 */
export function requestHerokuToken(email, password) {
  log.debug('requestHerokuToken', email);
  return new Promise((resolve, reject) => {
    superagent
      .post(`${herokuApiUrl}/oauth/authorizations`)
      .set({
        Accept: herokuApiAccept,
        Authorization:
          authorizationUtil.basicAuthorization(email, password),
        'Content-Type': 'application/json',
        scopes: ['identity', 'read', 'write']
      })
      .end((err, res) => {
        if (err) {
          reject(err);
        } else {
          resolve(res.body);
        }
      });
  });
}

export function createApp(name, apiKey) {
  log.debug('createApp', name);
  return new Promise((resolve, reject) => {
    superagent
      .post(`${herokuApiUrl}/apps`)
      .set({
        Accept: herokuApiAccept,
        Authorization:
          authorizationUtil.bearerAuthorization(apiKey),
        'Content-Type': 'application/json',
        scopes: ['write']
      })
      .send({ name })
      .end((err, res) => {
        if (err) {
          reject(err);
        } else {
          resolve(res.body);
        }
      });
  });
}
