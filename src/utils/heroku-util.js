/* eslint-disable import/prefer-default-export */

export function makeHerokuAppNameCompliant(originalHerokuAppName) {
  let newHerokuAppName = originalHerokuAppName;
  newHerokuAppName = newHerokuAppName.toLowerCase(); // heroku apps need to be all lowercase
  newHerokuAppName = newHerokuAppName.replace(/[^a-z0-9-]/g, '-'); // replace all 'special characters' with '-'
  return newHerokuAppName;
}
