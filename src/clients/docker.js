const superagent = require('superagent');

const dockerAuthApiUrl = 'index.docker.io/v1/users';

/**
 * Returns the string used for the basic authorization header in a GET request.
 *
 * @param username the username
 * @param password the password
 * @returns {string} the basic authentication string
 */
export function basicAuthorization(username, password) {
  return `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`;
}

/**
 * Logs the user into docker: https://docs.docker.com/v1.4/reference/api/docker-io_api/
 *
 * @param dockerCredentials
 * {
 *  email: 'someemail@email.com',
 *  password: 'somethingsomething'
 * }
 *
 * @returns 'ok' if successful, otherwise returns the error
 */
export function login(dockerCredentials) {
  const request = superagent
    .get(`${dockerAuthApiUrl}`)
    .set({
      'Content-Type': 'application/json',
      Authorization: basicAuthorization(dockerCredentials.email, dockerCredentials.password)
    });

  return new Promise((resolve, reject) => {
    request.end((err, res) => {
      if (err) {
        reject(err);
      } else {
        resolve(res.body);
      }
    });
  });
}
