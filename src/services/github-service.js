import * as githubClient from './../clients/github';

export async function isValidCredentials(username, password) {
  try {
    const user = await githubClient.getCurrentUser(username, password);
    return true;
  } catch (error) {
    if (error.status !== 401) {
      console.log(error.message);
      throw new Error(error.message);
    } else {
      return false;
    }
  }
}
