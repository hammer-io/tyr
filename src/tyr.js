/* eslint-disable import/prefer-default-export,no-await-in-loop,
prefer-destructuring,no-restricted-syntax */
import * as githubService from './services/github-service';

/**
 * Facilitates enabling github for the user. Enables/Creates GitHub repository
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

export async function travisci() {
  console.log('travisci');
}

export async function heroku() {
  console.log('heroku');
}

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
