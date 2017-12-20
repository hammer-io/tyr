import superagent from 'superagent';
import * as authorizationUtil from './../utils/authorization/authorization';

const githubApiUrl = 'https://api.github.com';
const githubApiAccept = 'application/vnd.github.v3+json';

export async function getCurrentUser(username, password) {
  return new Promise((resolve, reject) => {
    superagent
      .get(`${githubApiUrl}/user`)
      .set({
        Accept: githubApiAccept,
        Authorization:
          authorizationUtil.basicAuthorization(username, password),
        'Content-Type': 'application/json',
        scopes: ['identity', 'read', 'write']
      })
      .end((error, res) => {
        if (error) {
          console.log(error);
          reject(error);
        } else {
          resolve(res.body);
        }
      });
  });
}
