/* eslint-disable no-param-reassign,no-await-in-loop,no-restricted-syntax,prefer-destructuring */
import shortid from 'shortid';

import * as projectService from './services/project-service';
import * as githubService from './services/github-service';
import * as herokuService from './services/heroku-service';
import * as travisService from './services/travis-service';
import * as dockerService from './services/docker-service';
import * as expressService from './services/express-service';
import * as mochaService from './services/mocha-service';
import * as sequelizeService from './services/sequelize-service';

import { getActiveLogger } from './utils/winston';
import { makeHerokuAppNameCompliant } from './utils/heroku-util';

const log = getActiveLogger();

/**
 * Facilitates enabling github for the user. Enables/Creates GitHub repository
 * @configs the configuration object
 * @returns {Promise<void>}
 */
async function github(configs) {
  const repositoryName = configs.projectConfigurations.projectName;
  const repositoryDescription = configs.projectConfigurations.description;
  const credentials = configs.credentials.github;
  const isPrivate = configs.projectConfigurations.isPrivateProject;

  await githubService.createGitHubRepository(
    repositoryName,
    repositoryDescription,
    credentials,
    isPrivate
  );

  return configs;
}

/**
 * Facilitates generating the necessary files for a basic nodejs project
 * @param configs the configurations object
 * @param filePath the new project's file path
 * @returns {Promise<void>}
 */
export async function generateBasicNodeProject(configs, filePath) {
  await projectService.generateBasicNodeFiles(configs, filePath);
  return configs;
}

/**
 * Facilitates generating the necessary files for GitHub/Git Support
 * @param configs the configurations object
 * @param filePath the new project's file path
 * @returns {Promise<void>}
 */
async function generateGithubFiles(configs, filePath) {
  await githubService.generateGithubFiles(configs.projectConfigurations.projectName, filePath);
  return configs;
}

/**
 * Facilitates generating the necessary files for TravisCI support
 * @param configs the configurations object
 * @param filePath the new project's file path
 * @returns {Promise<void>}
 */
async function generateTravisFiles(configs, filePath) {
  await travisService.generateTravisCIFile(configs, filePath);
  return configs;
}

/**
 * Facilitates generating the necessary files for Docker support
 * @param configs the configurations object
 * @param filePath the new project's file path
 * @returns {Promise<void>}
 */
async function generateDockerFiles(configs, filePath) {
  await dockerService.generateDockerFiles(configs.projectConfigurations.projectName, filePath);
  return configs;
}

/**
 * Facilitates generating the necessary files for ExpressJS
 * @param configs the configuration object
 * @param filePath the new project's file path
 * @returns {Promise<void>}
 */
async function generateExpressFiles(configs, filePath) {
  await expressService.generateExpressFiles(configs.projectConfigurations.projectName, filePath);
  return configs;
}

/**
 * Facilitates generating the necessary files for mocha
 * @param configs the configuration object
 * @param filePath the new project's file path
 * @returns {Promise<*>}
 */
export async function generateMochaFiles(configs, filePath) {
  await mochaService.generateMochaFiles(configs.projectConfigurations.projectName, filePath);
  return configs;
}

/**
 * Facilitates generating the necessary files for sequelize
 * @param configs the configuration object
 * @param filePath the new project's file path
 * @returns {Promise<*>}
 */
export async function generateSequelizeFiles(configs, filePath) {
  await sequelizeService.generateSequelizeFiles(configs, filePath);
  return configs;
}

/**
 * Facilitates enabling travis ci for the user.
 * @configs the configuration object
 * @returns {Promise<void>}
 */
async function travisci(configs) {
  await travisService.enableTravis(configs);
  return configs;
}

/**
 * Facilitates enabling heroku for the user. Creates Heroku App.
 * @param configs the configuration object
 * @returns {Boolean} returns true if the app was successfully created, returns false if there
 * was an error because the app name is unavailable.
 */
export async function heroku(configs) {
  const updatedConfig = configs;
  let appName = configs.projectConfigurations.projectName;
  const apiKey = configs.credentials.heroku.apiKey;

  appName = makeHerokuAppNameCompliant(appName);
  if (appName !== configs.projectConfigurations.projectName) {
    log.warn('The name you chose was not compatible with Heroku naming conventions. We\'ve made your app name all ' +
          'lowercase letters and removed any special characters and replaced them with a \'-\'.');
  }

  let isCreated = await herokuService.createApp(appName, apiKey);
  while (!isCreated) {
    log.warn('The name you chose was not available on Heroku. We\'ve appended a short id at the' +
      ' end of your application name in order to make in unique.');
    appName = `${appName}-${shortid.generate().substring(0, 7)}`;
    appName = makeHerokuAppNameCompliant(appName);
    isCreated = await herokuService.createApp(appName, apiKey);
  }

  updatedConfig.projectConfigurations.herokuAppName = appName;
  log.info(`Successfully created Heroku App ${appName}`);
  return updatedConfig;
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
  expressjs: generateExpressFiles,
  mocha: generateMochaFiles,
  sequelize: generateSequelizeFiles,
};

export async function generateStaticFiles(configs, filePath) {
  // generating static files
  try {
    for (const key of Object.keys(configs.toolingConfigurations)) {
      const tool = configs.toolingConfigurations[key];
      if (staticFileGenerators[tool.toLowerCase()]) {
        await staticFileGenerators[tool.toLowerCase()](configs, filePath);
      }
    }
  } catch (error) {
    return Promise.reject(error);
  }

  // write configs to a file
  await projectService.generateTyrfile(configs, filePath);
}

export async function setUpThirdPartyTools(configs) {
  // enabling third party tools
  try {
    for (const key of Object.keys(configs.toolingConfigurations)) {
      const tool = configs.toolingConfigurations[key];
      if (services[tool.toLowerCase()]) {
        // eslint-disable-next-line no-param-reassign
        configs = await services[tool.toLowerCase()](configs);
      }
    }
  } catch (error) {
    return Promise.reject(error);
  }
}

export async function commitToGithub(configs, filePath) {
  // init, add, commit, push to github
  if (configs.toolingConfigurations.sourceControl && configs.toolingConfigurations.sourceControl.toLowerCase() === 'github') {
    await githubService.initAddCommitAndPush(
      configs.credentials.github.username,
      configs.projectConfigurations.projectName,
      filePath
    );
    log.info('Successfully committed and pushed files to GitHub Repository');
  }
}

/**
 * Generates a project
 * @param configs the configurations object
 * @returns {Promise<void>}
 */
export async function generateProject(configs) {
  console.log();
  log.info('>>> Generating Project!', configs);

  const filePath = process.cwd();

  try {
    await generateBasicNodeProject(configs, filePath);
  } catch (error) {
    console.log(error.message);
  }

  try {
    await setUpThirdPartyTools(configs);
    await generateStaticFiles(configs, filePath);
    await commitToGithub(configs, filePath);
  } catch (error) {
    log.error(error.message);
  }
}
