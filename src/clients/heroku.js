import superagent from 'superagent';
import winston from 'winston';

import * as authorizationUtil from './../utils/authorization';

const herokuApiUrl = 'https://api.heroku.com';
const herokuApiAccept = ' application/vnd.heroku+json; version=3';

/**
 * Exchanges a username/password pair for a token
 * @param herokuCredentials
 *
 * {
 *  'username': 'something',
 *  'password': 'somethingsomething'
 * }
 *
 * @returns {Promise}
 */
// eslint-disable-next-line import/prefer-default-export
export function requestHerokuToken(herokuCredentials) {
  winston.log('debug', 'requestHerokuToken', herokuCredentials.email);
  winston.log('verbose', 'requesting heroku token', herokuCredentials.email);
  return new Promise((resolve, reject) => {
    superagent
      .post(`${herokuApiUrl}/oauth/authorizations`)
      .set({
        Accept: herokuApiAccept,
        Authorization:
          authorizationUtil.basicAuthorization(herokuCredentials.email, herokuCredentials.password),
        'Content-Type': 'application/json',
        scopes: ['identity', 'read']
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
