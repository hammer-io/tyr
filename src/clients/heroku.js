import superagent from 'superagent';

const herokuApiUrl = 'https://api.heroku.com';
const herokuApiAccept = ' application/vnd.heroku+json; version=3';

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
 * Exchanges a username/password pair for a token
 * @param herokuCredentials
 *
 * {
 *  'username': 'something',
 *  'password': 'somethingsomething'
 * }
 *
 * @returns {Promise}
 */
export function requestHerokuToken(herokuCredentials) {
  return new Promise((resolve, reject) => {
    superagent
      .post(`${herokuApiUrl}/oauth/authorizations`)
      .set({
        Accept: herokuApiAccept,
        Authorization: basicAuthorization(herokuCredentials.email, herokuCredentials.password),
        'Content-Type': 'application/json',
        scopes: ['identity', 'read']
      })
      .end((err, res) => {
        if (err) {
          reject(err);
        } else {
          resolve(res.body);
        }
      });
  });
}
