/**
 * The Cli class.
 */

import chalk from 'chalk';
import figlet from 'figlet';
import inquirer from 'inquirer';
import isValid from 'is-valid-path';
import fs from 'fs';
import createPackageJson from './package-json/create-package-json';
import createIndexFile from './index-js/create-index-file';
import initTravisCI from './travis-ci/travis-ci-create';
import initDocker from './docker/docker-create';

import ciChoices from './constants/ci-choices';
import containerizationChoices from './constants/containerization-choices';
import constants from './constants/constants';

/**
 * Initializes the files and accounts needed to use or application
 * @param config the config object form the main inquirer prompt
 */
export function initProject(config) {
  // if the project doesn't already exist, intialize the files and accounts
  if (!fs.existsSync(config.projectName)) {
    fs.mkdirSync(config.projectName);
    fs.mkdirSync(`${config.projectName}/src`);
    createPackageJson(config);
    createIndexFile(config.projectName);

    if (config.container === constants.docker.name) {
      initDocker(config);
    }
    if (config.ci === constants.travisCI.name) {
      initTravisCI(config);
    }
  } else {
    return constants.config.projectName.error.duplicateMessage;
  }
}

/**
 * Gets the basic configuration settings for the user
 */
function promptConfigs() {
  const questions = [{
    name: constants.config.projectName.name,
    type: 'input',
    message: constants.config.projectName.message,
    validate: (value) => {
      const isItValid = isValid(value);

      if (typeof value === 'undefined' || value === '') {
        return constants.config.projectName.error.invalidMessage;
      }

      if (!isItValid) {
        return constants.config.projectName.error.invalidMessage;
      }

      if (fs.existsSync(value)) {
        return constants.config.projectName.error.duplicateMessage;
      }

      return true;
    }
  }, {
    name: constants.config.description.name,
    type: 'input',
    message: constants.config.description.message,
  }, {
    name: constants.config.version.name,
    type: 'input',
    message: constants.config.version.message,
    default: '0.0.0',
    validate: (value) => {
      // tests for valid version number.
      // any combination of (number) (.number)* will work
      if (/^(\d+\.)?(\d+\.)?(\*|\d+)/.test(value)) {
        return true;
      }

      return constants.config.version.error.invalidMessage;
    }
  }, {
    name: constants.config.author.name,
    type: 'input',
    message: constants.config.author.message
  }, {
    name: constants.config.license.name,
    type: 'input',
    message: constants.config.license.message
  }, {
    name: constants.config.ci.name,
    type: 'list',
    message: constants.config.ci.message,
    choices: ciChoices.choices
  }, {
    name: constants.config.container.name,
    type: 'list',
    message: constants.config.container.message,
    choices: containerizationChoices.choices
  }];

  return inquirer.prompt(questions);
}

/**
 * Gets the user's github credentials, logs them in, then safely stores their credentials somewhere.
 */
function promptGithubCredentials() {
  const questions = [{
    name: constants.github.username.name,
    type: 'input',
    message: constants.github.username.message,
  }, {
    name: constants.github.password.name,
    type: 'password',
    message: constants.github.password.message
  }];

  return inquirer.prompt(questions);
}


/**
 * The main execution function for hammer-cli.
 */
export default async function run() {
  console.log(chalk.yellow(figlet.textSync(constants.hammer.name, { horizontalLayout: 'full' })));

  const configs = await promptConfigs();
  console.log(configs);
  initProject(configs);

  const githubCredentials = await promptGithubCredentials();
  console.log(githubCredentials);
}
