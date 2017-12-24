/* eslint-disable import/prefer-default-export,no-await-in-loop,
prefer-destructuring,no-restricted-syntax */
import * as githubService from './services/github-service';
import * as herokuService from './services/heroku-service';

/**
 * Facilitates enabling github for the user. Enables/Creates GitHub repository
 * @configs the configuration object
 * @returns {Promise<void>}
 */
export async function github(configs) {
  const repositoryName = configs.projectConfigurations.projectName;
  const repositoryDescription = configs.projectConfigurations.description;
  const username = configs.credentials.github.username;
  const password = configs.credentials.github.password;

  await githubService.createGitHubRepository(
    repositoryName, repositoryDescription, username,
    password
  );
}

/**
 * Facilitates enabling travis ci for the user.
 * @configs the configuration object
 * @returns {Promise<void>}
 */
export async function travisci(configs) {
  console.log('travisci');
}

/**
 * Facilitates enabling heroku for the user. Creates Heroku App.
 * @param configs the configuration object
 * @returns {Promise<void>}
 */
export async function heroku(configs) {
  const appName = configs.projectConfigurations.projectName;
  const email = configs.credentials.heroku.email;
  const password = configs.credentials.heroku.password;

  await herokuService.createApp(appName, email, password);
}

// The services construct. This object acts as a selector. Add a method to this construct if there
// is a new service to the application. From that method, you can add the functionality to start
// supporting a new third party service.
const services = {
  github,
  travisci,
  heroku
};

export async function generateProject(configs) {
  // TODO Generate Static Files

  // TODO enable third party things
  for (const key of Object.keys(configs.toolingConfigurations)) {
    const tool = configs.toolingConfigurations[key];
    if (services[tool.toLowerCase()]) {
      await services[tool.toLowerCase()](configs);
    }
  }
}
