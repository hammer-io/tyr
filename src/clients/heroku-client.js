import superagent from 'superagent';
import { getActiveLogger } from '../utils/winston';

import * as authorizationUtil from '../utils/authorization';

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
  log.verbose('Heroku Client - getCurrentUser()');

  log.http(`GET ${herokuApiUrl}/apps - getting account information for email: ${email}`);
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
          log.debug(`ERROR: POST ${herokuApiUrl}/apps - error getting account information for email: ${email}
           - ${JSON.stringify({ status: err.status, message: err.message })}`);
          reject(err);
        } else {
          log.debug(`RESPONSE: POST ${herokuApiUrl}/apps - success getting account information for email: ${email}`);
          resolve(res.body);
        }
      });
  });
}

/**
 * Makes a request at https://api.heroku.com/apps, and authenticates with token auth
 * @param name the name of the application to create
 * @param token the token of the user
 * @returns {Promise<any>}
 */
export function createApp(name, token) {
  log.verbose('Heroku Client - createApp()');

  log.http(`POST ${herokuApiUrl}/apps - creating heroku application with name ${name}`);
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
          log.debug(`ERROR: POST ${herokuApiUrl}/apps - error creating heroku application with name ${name}
           - ${JSON.stringify({ status: err.status, message: err.message })}`);
          reject(err);
        } else {
          log.debug(`RESPONSE POST ${herokuApiUrl}/apps - successfully created heroku application with name ${name}`);
          resolve(res.body);
        }
      });
  });
}
