import winston from 'winston';

import * as herokuClient from './../clients/heroku';

/**
 * Wrapper for the heroku login
 *
 * @param herokuCredentials user's heroku credentials
 * {
 *  email: 'someemail@email.com',
 *  password: 'somethingsomething'
 * }
 *
 * @returns user's heroku credentials if login was successful, false otherwise
 *
 * {
 *  email: 'someemail@email.com',
 *  password: 'somethingsomething'
 * }
 */
// eslint-disable-next-line import/prefer-default-export
export async function signInToHeroku(herokuCredentials) {
  winston.log('verbose', 'signing into to heroku', herokuCredentials.email);
  try {
    await herokuClient.requestHerokuToken(herokuCredentials);
    return herokuCredentials;
  } catch (err) {
    if (err.status === 401) {
      return false;
    }

    winston.log('error', 'failed to sign in to heroku', err);
  }
}
