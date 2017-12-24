/* eslint-disable import/prefer-default-export */
import * as herokuClient from './../clients/heroku';

/**
 * Checks if the user's heroku credentials are valid by requesting account information.
 * @param email the email
 * @param password the password
 * @returns {Boolean} true if valid, false if invalid, throws error if something went wrong
 * connecting to the api
 */
export async function isValidCredentials(email, password) {
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
