/* eslint-disable no-await-in-loop */
import chalk from 'chalk';
import figlet from 'figlet';
import fs from 'fs';
import winston from 'winston';

import * as configFileReader from './utils/config-file-reader';
import utils from './utils';
import * as prompt from './prompt';
import constants from './constants/constants';

/**
 * Generates all of the local files for th user
 * @param config the project configurations
 * @returns
 */
export async function generateProjectFiles(config) {
  // if the project doesn't already exist, initialize the files and accounts
  if (!fs.existsSync(config.projectConfigurations.projectName)) {
    fs.mkdirSync(config.projectConfigurations.projectName);
    fs.mkdirSync(`${config.projectConfigurations.projectName}/src`);

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
    if (config.tooling.container === constants.docker.name) {
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
  winston.log('verbose', 'initializing project');

  const areFilesGenerated = await generateProjectFiles(config);
  if (!areFilesGenerated) {
    return;
  }

  // create github repository and push files
  if (config.tooling.sourceControl === constants.github.name) {
    await utils.git.setupGitHub(
      config.projectConfigurations.projectName,
      config.projectConfigurations.description,
      config.credentials.github
    );
  }

  const environmentVariables = [];
  // create Dockerfile and .dockerignore
  if (config.tooling.container === constants.docker.name) {
    environmentVariables.push({
      name: 'DOCKER_USERNAME',
      value: config.credentials.docker.username
    });
    environmentVariables.push({
      name: 'DOCKER_PASSWORD',
      value: config.credentials.docker.password
    });
  }

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
      value: config.credentials.heroku.password
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
      winston.log('error', `failed to enable TravisCI on ${config.credentials.github.username}/${config.projectConfigurations.projectName}`, err);
    }
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
  console.log(chalk.green('>> Please login to GitHub: '));
  let githubCredentials = await prompt.promptForGithubCredentials();
  let finalCredentials =
    await utils.git.signIntoGithub(
      githubCredentials.username,
      githubCredentials.password
    );

  // if the user could not be authenticated, loop again
  while (!finalCredentials) {
    console.log(chalk.red('>> Incorrect username/password!'));
    console.log(chalk.green('>> Please login to GitHub: '));
    githubCredentials = await prompt.promptForGithubCredentials();
    finalCredentials =
      await utils.git.signIntoGithub(
        githubCredentials.username,
        githubCredentials.password
      );
  }

  console.log(chalk.green('!! Successfully logged in to GitHub!'));
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
async function signInToHeroku() {
  console.log(chalk.green('>> Please login to Heroku: '));
  let herokuCredentials = await prompt.promptForHerokuCredentials();
  let credentials =
    await utils.heroku.signInToHeroku(
      herokuCredentials.email,
      herokuCredentials.password
    );

  // if the user could not be authenticated, loop again
  while (!credentials) {
    console.log(chalk.red('>> Incorrect email/password!'));
    console.log(chalk.green('>> Please login to Heroku: '));
    herokuCredentials = await prompt.promptForHerokuCredentials();
    credentials =
      await utils.heroku.signInToHeroku(
        herokuCredentials.email,
        herokuCredentials.password
      );
  }

  console.log(chalk.green('!! Successfully logged in to Heroku!'));
  return herokuCredentials;
}

/**
 * Signs into all of the third party tools
 * @param configs the project configurations
 * @returns the credentials
 */
async function signInToThirdPartyTools(configs) {
  const credentials = {};
  if (configs.tooling.sourceControl === constants.github.name) {
    const githubCredentials = await signInToGithub();
    credentials.github = githubCredentials;
  }

  if (configs.tooling.deployment === constants.heroku.name) {
    const herokuCredentials = await signInToHeroku();
    credentials.heroku = herokuCredentials;
  }

  return credentials;
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
  try {
    let configs = {};
    winston.log('verbose', 'run');
    console.log(chalk.yellow(figlet.textSync(constants.tyr.name, { horizontalLayout: 'full' })));

    if (tyr.config) {
      if (fs.existsSync(tyr.config)) {
        configs = configFileReader.parseConfigsFromFile(tyr.config);
      } else {
        console.log(chalk.red('!! Configuration File does not exist'));
      }
    } else {
      // get the project configurations
      configs = await prompt.prompt();
    }

    // sign in to third party tools
    const credentials = await signInToThirdPartyTools(configs);
    configs.credentials = credentials;

    // initialize the basic project files
    await initProject(configs);
    console.log(chalk.green('!! Successfully generated your project!'));
  } catch (err) {
    console.log(chalk.red('!! Failed to generate your project!'));
  }
}
