import * as herokuClient from './../clients/heroku';

export async function isValidCredentials(email, password) {
  try {
    const user = await herokuClient.getCurrentUser(email, password);
    console.log(user);
    return true;
  } catch (error) {
    if (error.status !== 401) {
      throw new Error('Something went wrong contacting the Heroku API!');
    } else {
      return false;
    }
  }
}
