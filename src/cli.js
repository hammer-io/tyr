/**
 * The Cli class.
 */
import chalk from 'chalk';
import figlet from 'figlet';
import inquirer from 'inquirer';
import isValid from 'is-valid-path';
import fs from 'fs';
import Preferences from 'preferences';
import winston from 'winston';

import utils from './utils';
import ciChoices from './constants/ci-choices';
import containerizationChoices from './constants/containerization-choices';
import constants from './constants/constants';

const preferences = new Preferences(constants.hammer.name);

/**
 * Initializes the files and accounts needed to use or application
 * @param config the config object form the main inquirer prompt
 */
export function initProject(config) {
  // if the project doesn't already exist, intialize the files and accounts
  if (!fs.existsSync(config.projectName)) {
    fs.mkdirSync(config.projectName);
    fs.mkdirSync(`${config.projectName}/src`);
    utils.file.createPackageJson(config);
    utils.file.createIndexFile(config.projectName);

    if (config.container === constants.docker.name) {
      utils.docker.initDocker(config);
    }
    if (config.ci === constants.travisCI.name) {
      utils.travis.initTravisCI(config);
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

      if (typeof value === 'undefined' || value === '' || value.indexOf(' ') !== -1) {
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
    message: constants.config.license.message,
    validate: (value) => {
      if (typeof value === 'undefined' || value === '') {
        return constants.config.license.error.invalidMessage;
      }

      return true;
    }
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
 * Gets the user's docker hub credentials, logs them in,
 * then safely stores their credentials somewhere.
 */
function promptDockerHubCredentials() {
  const questions = [{
    name: constants.dockerHub.username.name,
    type: 'input',
    message: constants.dockerHub.username.message,
  }, {
    name: constants.dockerHub.password.name,
    type: 'password',
    message: constants.dockerHub.password.message
  }];

  return inquirer.prompt(questions);
}


/**
 * Make sure the user has all requirements satisfied before allowing
 * them to continue creating a project.
 */
function promptGlobalPrerequisites() {
  const questions = [];

  // If this is the first time settings prereqs in the preferences, create the object
  if (!preferences.prereqs) {
    preferences.prereqs = {};
  }

  constants.hammer.globalPrereqs.forEach((prereq) => {
    // Only ask them if they haven't said YES in the past (i.e. if it's not complete)
    if (!preferences.prereqs[prereq.name]) {
      questions.push({
        name: prereq.name,
        type: 'confirm',
        message: prereq.message,
        default: false
      });
    }
  });

  return inquirer.prompt(questions);
}

function userIsFinishedWithPrereqs(answers) {
  let finishedPrereqs = true;

  constants.hammer.globalPrereqs.forEach((prereq) => {
    // If they answered 'No' for something, display the appropriate response
    if (answers[prereq.name] === false) {
      console.log(chalk.red(prereq.responseIfNo));
      finishedPrereqs = false;
      preferences.prereqs[prereq.name] = false;
    } else if (answers[prereq.name] === true) {
      preferences.prereqs[prereq.name] = true;
    }
  });

  return finishedPrereqs;
}


/**
 * The main execution function for hammer-cli.
 */
export default async function run() {
  console.log(chalk.yellow(figlet.textSync(constants.hammer.name, { horizontalLayout: 'full' })));
  winston.log('debug', preferences);

  const prereqAnswers = await promptGlobalPrerequisites();
  const canContinue = await userIsFinishedWithPrereqs(prereqAnswers);
  if (!canContinue) {
    return;
  }

  const configs = await promptConfigs();
  initProject(configs);

  // eslint-disable-next-line
  const githubCredentials = await promptGithubCredentials();
  // eslint-disable-next-line
  const dockerHubCredentials = await promptDockerHubCredentials();
}
