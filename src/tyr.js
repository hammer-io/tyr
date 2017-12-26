/* eslint-disable import/prefer-default-export,no-await-in-loop,
prefer-destructuring,no-restricted-syntax */
import * as projectService from './services/project-service';
import * as githubService from './services/github-service';
import * as herokuService from './services/heroku-service';
import * as travisService from './services/travis-service';

import { getActiveLogger } from './utils/log/winston';

const log = getActiveLogger();

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
 * Faciliates generating the necessary files for a basic nodejs project
 * @param configs the configurations object
 * @returns {Promise<void>}
 */
export async function generateBasicNodeProject(configs) {
  await projectService.generateBasicNodeFiles(configs);
}

/**
 * Facilitates generating the necessary files for GitHub/Git Support
 * @param configs the configurations object
 * @returns {Promise<void>}
 */
export async function generateGithubFiles(configs) {
  console.log('generate github');
}

/**
 * Facilitates generating the necessary files for TravisCI support
 * @param configs the configurations object
 * @returns {Promise<void>}
 */
export async function generateTravisFiles(configs) {
  await travisService.generateTravisCIFile(configs);
}

/**
 * Facilitates generating the necessary files for Docker support
 * @param configs the configurations object
 * @returns {Promise<void>}
 */
export async function generateDockerFiles(configs) {
  console.log('generate docker');
}

/**
 * Facilitates generating the necessary files for ExpressJS
 * @param configs
 * @returns {Promise<void>}
 */
export async function generateExpressFiles(configs) {
  console.log('generate express');
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

// The file generator construct. This object acts as a selector. Add a key/value pair to this
// construct if the new service you are adding requires static files to be generated. The value
// should be a method that should call the file generator.
const staticFileGenerators = {
  github: generateGithubFiles,
  travisci: generateTravisFiles,
  docker: generateDockerFiles,
  expressjs: generateExpressFiles
};

export async function generateProject(configs) {
  try {
    await generateBasicNodeProject(configs);
  } catch (error) {
    log.error(error.message);
  }

  try {
    for (const key of Object.keys(configs.toolingConfigurations)) {
      const tool = configs.toolingConfigurations[key];
      if (staticFileGenerators[tool.toLowerCase()]) {
        await staticFileGenerators[tool.toLowerCase()](configs);
      }
    }
  } catch (error) {
    log.error(error.message);
  }

  for (const key of Object.keys(configs.toolingConfigurations)) {
    const tool = configs.toolingConfigurations[key];
    if (services[tool.toLowerCase()]) {
      await services[tool.toLowerCase()](configs);
    }
  }
}
