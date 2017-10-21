const superagent = require('superagent');
const winston = require('winston');

const dockerAuthApiUrl = 'index.docker.io/v1/users';

/**
 * Returns the string used for the basic authorization header in a GET request.
 *
 * @param username
 * @param password
 * @returns {string}
 */
function basicAuthorization(username, password) {
  return `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`;
}

export function login(dockerCredentials) {
  console.log(dockerCredentials);
  const request = superagent
    .get(`${dockerAuthApiUrl}`)
    .set({
      'Content-Type': 'application/json',
      Authorization: basicAuthorization(dockerCredentials.username, dockerCredentials.password)
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
