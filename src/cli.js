/* eslint-disable no-await-in-loop */
/**
 * The Cli class.
 */
import chalk from 'chalk';
import figlet from 'figlet';
import fs from 'fs';
import winston from 'winston';

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
      await utils.git.createGitIgnore();
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
      console.log(config.credentials.github);
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
  let finalCredentials = await utils.git.signIntoGithub(githubCredentials);

  // if the user could not be authenticated, loop again
  while (!finalCredentials) {
    console.log(chalk.red('>> Incorrect username/password!'));
    console.log(chalk.green('>> Please login to GitHub: '));
    githubCredentials = await prompt.promptForGithubCredentials();
    finalCredentials = await utils.git.signIntoGithub(githubCredentials);
  }

  console.log(chalk.green('!! Successfully logged in to GitHub!'));
  return finalCredentials;
}

/**
 * Wrapper to get docker credentials for the user
 * @returns the credentials structure
 *
 * {
 *  email: 'someemail@email.com',
 *  password: 'somethingsomething'
 * }
 */
async function signInToDocker() {
  console.log(chalk.green('>> Please login to Docker: '));
  let dockerCredentials = await prompt.promptForDockerCredentials();
  let isAuthenticated = await utils.docker.signInToDocker(dockerCredentials);

  // if the user could not be authenticated, loop again
  while (!isAuthenticated) {
    console.log(chalk.red('>> Incorrect username/password!'));
    console.log(chalk.green('>> Please login to Docker: '));
    dockerCredentials = await prompt.promptForDockerCredentials();
    isAuthenticated = await utils.docker.signInToDocker(dockerCredentials);
  }

  console.log(chalk.green('!! Successfully logged in to Docker!'));
  return dockerCredentials;
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
  let credentials = await utils.heroku.signInToHeroku(herokuCredentials);

  // if the user could not be authenticated, loop again
  while (!credentials) {
    console.log(chalk.red('>> Incorrect email/password!'));
    console.log(chalk.green('>> Please login to Heroku: '));
    herokuCredentials = await prompt.promptForHerokuCredentials();
    credentials = await utils.heroku.signInToHeroku(herokuCredentials);
  }

  console.log(chalk.green('!! Successfully logged in to Heroku!'));
  return herokuCredentials;
}

async function signInToThirdPartyTools(configs) {
  const credentials = {};
  if (configs.tooling.sourceControl === constants.github.name) {
    const githubCredentials = await signInToGithub();
    credentials.github = githubCredentials;
  }

  if (configs.tooling.containerization === constants.docker.name) {
    const dockerCredentials = await signInToDocker();
    credentials.docker = dockerCredentials;
  }

  if (configs.tooling.deployment === constants.heroku.name) {
    const herokuCredentials = await signInToHeroku();
    credentials.heroku = herokuCredentials;
  }

  return credentials;
}

/**
 * The main execution function for tyr.
 */
export default async function run() {
  try {
    winston.log('verbose', 'run');
    console.log(chalk.yellow(figlet.textSync(constants.tyr.name, { horizontalLayout: 'full' })));

    // get the project configurations
    const configs = await prompt.prompt();

    // sign in to third party tools
    const credentials = await signInToThirdPartyTools(configs);
    configs.credentials = credentials;

    // initialize the basic project files
    await initProject(configs);
    console.log(chalk.green('!! Successfully generated your project!'));
  } catch (err) {
    console.log(chalk.red('!! Failed to gerneate your project!'));
  }
}
