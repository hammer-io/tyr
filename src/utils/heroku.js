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

export async function signInToHeroku(email, password) {
  log.verbose('signing into to heroku', email);
  try {
    await herokuClient.requestHerokuToken(email, password);
    return { email, password };
  } catch (err) {
    if (err.status === 401) {
      return false;
    }

    log.error('Failed to sign in to heroku', err);
  }
}

export async function createApp(appName, apiKey) {
  log.verbose('creating heroku app', appName);
  log.debug('creating heroku app', apiKey);
  try {
    const resp = await herokuClient.createApp(appName, apiKey);
    return resp.name;
  } catch (err) {
    if (err.status === 401) {
      return false;
    }
    if (err.status === 422) {
      console.log(err.response.body.message);
      return err.response.body.message;
    }
    log.error('Failed to create app on Heroku', err);
  }
}
