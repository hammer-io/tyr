/* eslint-disable no-await-in-loop */
import figlet from 'figlet';
import fs from 'fs';

import * as configFile from './utils/config-file';
import utils from './utils';
import * as prompt from './prompt';
import constants from './constants/constants';
import { deleteGitHubToken } from './clients/github';
import { getActiveLogger, enableLogFile } from './utils/winston';
import deplomentChoices from './constants/deployment-choices';

const log = getActiveLogger();

/**
 * Generates all of the local files for the user
 * @param config the project configurations
 * @returns
 */
export async function generateProjectFiles(config) {
  // if the project doesn't already exist, initialize the files and accounts
  if (!fs.existsSync(config.projectConfigurations.projectName)) {
    fs.mkdirSync(config.projectConfigurations.projectName);
    fs.mkdirSync(`${config.projectConfigurations.projectName}/src`);

    // write to config file
    await configFile.writeToConfigFile(config);

    const dependencies = {};

    // enable an express project or a basic node project
    if (config.tooling.web === constants.express.name) {
      dependencies.express = constants.express.version;
      await utils.express.createJsFiles(config.projectConfigurations.projectName);
    } else {
      await utils.file.createIndexFile(config.projectConfigurations.projectName);
    }

    // create package.json
    await utils.file.createPackageJson(config.projectConfigurations, dependencies);

    // create README.md
    await utils.file.createReadMe(
      config.projectConfigurations.projectName,
      config.projectConfigurations.description
    );

    // create mocha test suite
    await utils.mocha.createMochaTestSuite(`${config.projectConfigurations.projectName}`);

    // create .gitignore
    if (config.tooling.sourceControl === constants.github.name) {
      await utils.git.createGitIgnore(config.projectConfigurations.projectName);
    }

    // create .travis.yml
    if (config.tooling.ci === constants.travisCI.name) {
      await utils.travis.initTravisCI(config);
    }

    // create Dockerfile and .dockerignore
    if (config.tooling.containerization === constants.docker.name) {
      await utils.docker.initDocker(config.projectConfigurations);
    }
  }

  return 'Project already exists!';
}

/**
 * Initializes the files and accounts needed to use or application
 *
 * @param config the config object form the main inquirer prompt
 */
export async function initProject(config) {
  log.verbose('initializing project');

  const areFilesGenerated = await generateProjectFiles(config);
  if (!areFilesGenerated) {
    return;
  }

  // create github repository
  if (config.tooling.sourceControl === constants.github.name) {
    await utils.git.createGithubRepo(
      config.projectConfigurations.projectName,
      config.projectConfigurations.description,
      config.credentials.github
    );
  }

  const environmentVariables = [];

  // Docker Hub credentials
  // May come in handy later

  // if (config.tooling.containerization === constants.docker.name) {
  //   environmentVariables.push({
  //     name: 'DOCKER_USERNAME',
  //     value: config.credentials.docker.username
  //   });
  //   environmentVariables.push({
  //     name: 'DOCKER_PASSWORD',
  //     value: config.credentials.docker.password
  //   });
  // }

  if (config.tooling.deployment === constants.heroku.name) {
    environmentVariables.push({
      name: 'HEROKU_EMAIL',
      value: config.credentials.heroku.email
    });
    environmentVariables.push({
      name: 'HEROKU_USERNAME',
      value: config.credentials.heroku.email
    });
    environmentVariables.push({
      name: 'HEROKU_PASSWORD',
      value: config.credentials.heroku.apiKey
    });
  }

  // create .travis.yml file and enable travis on project
  if (config.tooling.ci === constants.travisCI.name) {
    try {
      await utils.travis.enableTravisOnProject(
        config.credentials.github.token,
        config.credentials.github.username,
        config.projectConfigurations.projectName,
        environmentVariables
      );
    } catch (err) {
      log.error(`failed to enable TravisCI on ${config.credentials.github.username}/${config.projectConfigurations.projectName}`, err);
    }
  }

  // push files to github
  if (config.tooling.sourceControl === constants.github.name) {
    await utils.git.commitAndPush(
      config.projectConfigurations.projectName,
      config.credentials.github
    );
  }

  // run npm install on project
  utils.npm.npmInstall(`${config.projectConfigurations.projectName}`);
}

/**
 * Wrapper to get github credentials for the user
 * @returns the credentials structure
 *
 * {
 *  username: 'jack',
 *  password: 'somethingsomething',
 *  token: 'your private token',
 *  isTwoFactorAuth: 'false'
 * }
 */
async function signInToGithub() {
  log.info('Please login to GitHub: ');
  let githubCredentials = await prompt.promptForGithubCredentials();
  let finalCredentials =
    await utils.git.signIntoGithub(
      githubCredentials.username,
      githubCredentials.password
    );

  // if the user could not be authenticated, loop again
  while (!finalCredentials) {
    log.error('Incorrect username/password!');
    log.info('Please login to GitHub: ');
    githubCredentials = await prompt.promptForGithubCredentials();
    finalCredentials =
      await utils.git.signIntoGithub(
        githubCredentials.username,
        githubCredentials.password
      );
  }

  return finalCredentials;
}

/**
 * Wrapper to get heroku credentials for the user
 * @returns
 *
 * {
 *  email: 'someemail@email.com',
 *  password: 'somethingsomething'
 * }
 */
async function setupHeroku(configs) {
  log.info('Please login to Heroku: ');
  let disableHeroku = false;
  let herokuCredentials = await prompt.promptForHerokuCredentials();
  let credentials =
    await utils.heroku.signInToHeroku(
      herokuCredentials.email,
      herokuCredentials.password
    );

  // if the user could not be authenticated, loop again
  while (!credentials) {
    log.error('Incorrect email/password!');
    log.info('Please login to Heroku: ');
    herokuCredentials = await prompt.promptForHerokuCredentials();
    credentials =
      await utils.heroku.signInToHeroku(
        herokuCredentials.email,
        herokuCredentials.password
      );
  }

  log.info('Successfully logged into Heroku!');
  // Create the app on Heroku
  let appName = await utils.heroku.createApp(
    configs.projectConfigurations.projectName,
    herokuCredentials.apiKey
  );

  if (appName && appName.includes('Delete some apps or add a credit card to verify your account.')) {
    log.info('You\\\'ve reached the limit of 5 apps for unverified accounts. Delete some apps or add a credit card to verify your account.');
    disableHeroku = true;
    return {
      herokuCredentials,
      appName: configs.projectConfigurations.projectName,
      disableHeroku
    };
  }

  while (appName && appName.includes('Name is already taken')) {
    log.error('Project name not available on Heroku!! Pick a different project name');
    const response = await prompt.promptForNewProjectName();
    appName = await utils.heroku.createApp(response.projectName, herokuCredentials.apiKey);
  }
  log.info('Successfully created app on Heroku!');

  return { herokuCredentials, appName, disableHeroku };
}

/**
 * Signs into all of the third party tools
 * @param configs the project configurations
 * @returns the credentials
 */
async function signInToThirdPartyTools(configs) {
  const credentials = {};
  let herokuConfigs = {};
  const toolOptions = {};
  if (configs.tooling.sourceControl === constants.github.name) {
    const githubCredentials = await signInToGithub();
    credentials.github = githubCredentials;
  }

  if (configs.tooling.deployment === constants.heroku.name) {
    herokuConfigs = await setupHeroku(configs);
    credentials.heroku = herokuConfigs.herokuCredentials;
    toolOptions.appName = herokuConfigs.appName;
    toolOptions.disableHeroku = herokuConfigs.disableHeroku;
  }

  toolOptions.credentials = credentials;
  return toolOptions;
}

/**
 * The main execution function for tyr.
 *
 * @param tyr tyr holds values about command line parameters
 *                to access information about the config file, look at tyr.config
 *
 *                For more information about commander: https://github.com/tj/commander.js
 */
export default async function run(tyr) {
  // Enable logging to file upon user request
  if (tyr.logfile) {
    enableLogFile(tyr.logfile);
  }
  let configs = {};
  try {
    log.verbose('run');
    log.info(figlet.textSync(constants.tyr.name, { horizontalLayout: 'full' }));

    if (tyr.config) {
      if (fs.existsSync(tyr.config)) {
        configs = configFile.parseConfigsFromFile(tyr.config);
      } else {
        log.error('Configuration File does not exist!');
      }
    } else {
      // get the project configurations
      configs = await prompt.prompt();
    }

    // sign in to third party tools
    const toolConfigs = await signInToThirdPartyTools(configs);
    configs.credentials = toolConfigs.credentials;
    if (configs.tooling.deployment === constants.heroku.name) {
      configs.projectConfigurations.projectName = toolConfigs.appName;
      if (toolConfigs.disableHeroku) {
        configs.tooling.deployment = deplomentChoices.none;
      }
    }

    // initialize the basic project files
    await initProject(configs);
    log.info('Successfully generated your project!');
  } catch (err) {
    log.error('Failed to generate your project!', err);
  } finally {
    await deleteGitHubToken(
      configs.credentials.github.url,
      configs.credentials.github.username,
      configs.credentials.github.password
    );
  }
}
