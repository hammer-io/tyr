import superagent from 'superagent';
import winston from 'winston';

import * as authorizationUtil from './../utils/authorization';

const dockerAuthApiUrl = 'index.docker.io/v1/users';

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
// eslint-disable-next-line import/prefer-default-export
export function login(dockerCredentials) {
  winston.log('debug', 'login', dockerCredentials.username);
  winston.log('verbose', 'logging in to docker', dockerCredentials.username);

  const request = superagent
    .get(`${dockerAuthApiUrl}`)
    .set({
      'Content-Type': 'application/json',
      Authorization:
        authorizationUtil.basicAuthorization(dockerCredentials.username, dockerCredentials.password)
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
