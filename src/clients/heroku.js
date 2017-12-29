import superagent from 'superagent';
import { getActiveLogger } from '../utils/log/winston';

import * as authorizationUtil from './../utils/authorization/authorization';

const log = getActiveLogger();
const herokuApiUrl = 'https://api.heroku.com';
const herokuApiAccept = ' application/vnd.heroku+json; version=3';

/**
 * Makes request at https://api.heroku.com/account, and authenticates with basic auth
 * @param email the email
 * @param password the password
 * @returns {Promise<any>} user account information
 */
export function getCurrentUser(email, password) {
  return new Promise((resolve, reject) => {
    superagent
      .get(`${herokuApiUrl}/account`)
      .set({
        Accept: herokuApiAccept,
        Authorization:
          authorizationUtil.basicAuthorization(email, password),
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

/**
 * Makes a request at https://api.heroku.com/apps, and authenticates with basic auth
 * @param name the name of the application to create
 * @param email the email of the user
 * @param password the password of the user
 * @returns {Promise<any>}
 */
export function createApp(name, token) {
  log.debug('createApp', name);
  return new Promise((resolve, reject) => {
    superagent
      .post(`${herokuApiUrl}/apps`)
      .set({
        Accept: herokuApiAccept,
        Authorization:
          authorizationUtil.bearerAuthorization(token),
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
