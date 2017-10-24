import superagent from 'superagent';
import { getActiveLogger } from '../utils/winston';

import * as authorizationUtil from './../utils/authorization';

const log = getActiveLogger();
const dockerAuthApiUrl = 'index.docker.io/v1/users';

/**
 * Logs the user into docker: https://docs.docker.com/v1.4/reference/api/docker-io_api/
 *
 * @param username docker username
 * @param password docker password
 *
 * @returns 'ok' if successful, otherwise returns the error
 */
// eslint-disable-next-line import/prefer-default-export
export function login(username, password) {
  log.debug('login', username);
  log.verbose('Logging in to docker');

  const request = superagent
    .get(dockerAuthApiUrl)
    .set({
      'Content-Type': 'application/json',
      Authorization:
        authorizationUtil.basicAuthorization(username, password)
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
