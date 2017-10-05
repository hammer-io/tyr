/**
 * The Cli class.
 */

import chalk from 'chalk';
import figlet from 'figlet';
import inquirer from 'inquirer';
import isValid from 'is-valid-path';
import fs from 'fs';
import createPackageJson from './create-package-json';
import createIndexFile from './create-index-file';
import initTravisCI from './travis-ci/travis-ci-create';
import initDocker from './docker/docker-create';

import ciChoices from '../ci-choices.json';
import containerizationChoices from '../containerization-choices.json';

/**
 * Initializes the files and accounts needed to use or application
 * @param config the config object form the main inquirer prompt
 */
function initProject(config) {
  // if the project doesn't already exist, intialize the files and accounts
  if (!fs.existsSync(config.projectName)) {
    fs.mkdirSync(config.projectName);
    fs.mkdirSync(`${config.projectName}/src`);
    createPackageJson(config);
    createIndexFile(config.projectName);

    if (config.container === 'Docker') {
      initDocker(config);
    }
    if (config.ci === 'TravisCI') {
      initTravisCI(config);
    }
  }
}

/**
 * Gets the basic configuration settings for the user
 */
function getConfigs() {
  const questions = [{
    name: 'projectName',
    type: 'input',
    message: 'Project Name:',
    validate: (value) => {
      const isItValid = isValid(value);

      if (typeof value === 'undefined' || value === '') {
        return 'Invalid Project Name';
      }

      if (!isItValid) {
        return 'Invalid Project Name';
      }

      if (fs.existsSync(value)) {
        return 'Project with this name already exists in this directory';
      }

      return true;
    }
  }, {
    name: 'description',
    type: 'input',
    message: 'Description:',
  }, {
    name: 'version',
    type: 'input',
    message: 'Version:',
    default: '0.0.0',
    validate: (value) => {
      // tests for valid version number.
      // any combination of (number) (.number)* will work
      if (/^(\d+\.)?(\d+\.)?(\*|\d+)/.test(value)) {
        return true;
      }

      return 'Invalid Version Number';
    }
  }, {
    name: 'author',
    type: 'input',
    message: 'Author:'
  }, {
    name: 'license',
    type: 'input',
    message: 'License:'
  }, {
    name: 'ci',
    type: 'list',
    message: 'Choose your CI tool:',
    choices: ciChoices.choices
  }, {
    name: 'container',
    type: 'list',
    message: 'Choose your Containerization Tool:',
    choices: containerizationChoices.choices
  }];

  return inquirer.prompt(questions);
}

/**
 * Gets the user's github credentials, logs them in, then safely stores their credentials somewhere.
 */
function getGithubCredentials() {
  const questions = [{
    name: 'githubUsername',
    type: 'input',
    message: 'GitHub Username:',
  }, {
    name: 'githubPassword',
    type: 'password',
    message: 'GitHub Password'
  }];

  inquirer.prompt(questions).then((answers) => {
    // TODO log the user into github and safely store their credentials/tokens somewhere
    console.log(answers);
  });
}


/**
 * The main execution function for hammer-cli.
 */
export default function run() {
  console.log(chalk.yellow(figlet.textSync('hammer-io', { horizontalLayout: 'full' })));


  getConfigs()
    .then((answers) => {
      initProject(answers)
    })
    .then(() => {
      getGithubCredentials();
    });
}
