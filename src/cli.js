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
import deploymentChoices from './constants/deployment-choices';
import webChoices from './constants/web-choices';
import constants from './constants/constants';
import { setupGitHub } from './clients/github';

const preferences = new Preferences(constants.tyr.name);

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
  }, {
    name: constants.config.deployment.name,
    type: 'list',
    message: constants.config.deployment.message,
    choices: deploymentChoices.choices
  }, {
    name: constants.config.web.name,
    type: 'list',
    message: constants.config.web.message,
    choices: webChoices.choices
  }

  ];

  return inquirer.prompt(questions);
}

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
 * Gets the user's github credentials
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
 * Gets the user's docker hub credentials
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
 * Gets the user's heroku credentials
 */
function promptHerokuCredentials() {
  const questions = [{
    name: constants.heroku.email.name,
    type: 'input',
    message: constants.heroku.email.message,
  }, {
    name: constants.heroku.username.name,
    type: 'input',
    message: constants.heroku.username.message,
  }, {
    name: constants.heroku.password.name,
    type: 'password',
    message: constants.heroku.password.message
  }];

  return inquirer.prompt(questions);
}

/**
 * When the user first uses the application, the user preferences file
 * has not been created or initialized. Any initialization code that needs
 * to happen should be placed here.
 */
function initPreferencesIfUninitialized() {
  if (!preferences.prereqs) {
    preferences.prereqs = {};
  }
}

/**
 * Make sure the user has all requirements satisfied before allowing
 * them to continue creating a project.
 */
function promptGlobalPrerequisites() {
  const questions = [];

  initPreferencesIfUninitialized();

  constants.tyr.globalPrereqs.forEach((prereq) => {
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

/**
 * Returns true if all answers are 'true' (i.e. if the user said YES to
 * having completed all prerequisites).
 */
export function isUserFinishedWithPrereqs(answers) {
  let finishedPrereqs = true;

  initPreferencesIfUninitialized();

  constants.tyr.globalPrereqs.forEach((prereq) => {
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
 * The main execution function for tyr.
 */
export default async function run() {
  console.log(chalk.yellow(figlet.textSync(constants.tyr.name, { horizontalLayout: 'full' })));
  winston.log('debug', preferences);

  const prereqAnswers = await promptGlobalPrerequisites();
  const canContinue = await isUserFinishedWithPrereqs(prereqAnswers);
  if (!canContinue) {
    return;
  }

  const configs = await promptConfigs();
  initProject(configs);

  const githubCredentials = await promptGithubCredentials();

  await setupGitHub(
    configs.projectName,
    configs.projectDescription,
    githubCredentials.githubUsername,
    githubCredentials.githubPassword
  );

  const environmentVariables = [];
  if (configs.containerization === 'Docker') {
    const dockerHubCredentials = await promptDockerHubCredentials();
    environmentVariables.push({
      name: 'DOCKER_USERNAME',
      value: dockerHubCredentials.dockerHubUsername
    });
    environmentVariables.push({
      name: 'DOCKER_PASSWORD',
      value: dockerHubCredentials.dockerHubPassword
    })
  }

  if (configs.deployment === constants.heroku.name) {
    const herokuCredentials = await promptHerokuCredentials();
    environmentVariables.push({
      name: 'HEROKU_EMAIL',
      value: herokuCredentials.herokuEmail
    });
    environmentVariables.push({
      name: 'HEROKU_USERNAME',
      value: herokuCredentials.herokuUsername
    });
    environmentVariables.push({
      name: 'HEROKU_PASSWORD',
      value: herokuCredentials.herokuPassword
    })
  }

  if (configs.ci === constants.travisCI.name) {
    await utils.travis.enableTravisOnProject(
      githubCredentials.githubUsername,
      githubCredentials.githubPassword,
      configs.projectName,
      environmentVariables
    );
  }
}
