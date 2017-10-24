import * as herokuClient from './../clients/heroku';
import { getActiveLogger } from '../utils/winston';

const log = getActiveLogger();

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
export async function signInToHeroku(email, password) {
  log.verbose('signing into to heroku', email);
  try {
    await herokuClient.requestHerokuToken(email, password);
    return { email, password };
  } catch (err) {
    if (err.status === 401) {
      return false;
    }

    log.error('failed to sign in to heroku', err);
  }
}
