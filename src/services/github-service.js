/* eslint-disable import/prefer-default-export */
import * as githubClient from './../clients/github';

/**
 * Checks if the user's github credentials are valid by requesting account information.
 * @param username the username
 * @param password the password
 * @returns {Boolean} true if valid, false if invalid, throws error if something went wrong
 * connecting to the api
 */
export async function isValidCredentials(username, password) {
  try {
    await githubClient.getCurrentUser(username, password);
    return true;
  } catch (error) {
    if (error.status !== 401) {
      throw new Error('Something went wrong contacting the GitHub API!');
    } else {
      return false;
    }
  }
}
