/* eslint-disable import/prefer-default-export */
import * as herokuClient from '../clients/heroku-client';
import { getActiveLogger } from '../utils/winston';

const log = getActiveLogger();
/**
 * Checks if the user's heroku credentials are valid by requesting account information.
 * @param email the email
 * @param password the password
 * @returns {Boolean} true if valid, false if invalid, throws error if something went wrong
 * connecting to the api
 */
export async function isValidCredentials(email, password) {
  log.verbose('Heroku Service - isValidCredentials()');
  try {
    await herokuClient.getCurrentUser(email, password);
    return true;
  } catch (error) {
    if (error.status !== 401) {
      throw new Error('Something went wrong contacting the Heroku API!');
    } else {
      return false;
    }
  }
}

/**
 * Creates a new Heroku application for a user
 * @param appName the application name
 * @param token the token for authentication
 * @returns {Boolean} returns true if the app was created successfully, returns false if there
 * was a 422 error (meaning the app name was not available), throws an error for any other type
 * of error.
 */
export async function createApp(appName, token) {
  log.verbose('Heroku Service - createApp()');
  try {
    await herokuClient.createApp(appName, token);
    return true;
  } catch (error) {
    if (error.status === 422 && error.response.body.message === 'Name is already taken') {
      log.debug('ERROR: Application Name is already in use on Heroku');
      return false;
    }

    throw new Error('Unable to create Heroku Application');
  }
}
