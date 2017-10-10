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
import initGit from './git/git-init';

import ciChoices from '../ci-choices.json';
import containerizationChoices from '../containerization-choices.json';


function writeFiles(config) {
  if (!fs.existsSync(config.projectName)) {
    fs.mkdirSync(config.projectName);
    fs.mkdirSync(`${config.projectName}/src`);
    createPackageJson(config);
    createIndexFile(config.projectName);
  }
  if (config.container === 'Docker') {
    initDocker(config);
  }
  if (config.ci === 'TravisCI') {
    initTravisCI(config);
  }
  if (config.githubUsername && config.githubPassword) {
    initGit(config);
  }
}

export default function run() {
  console.log(chalk.yellow(figlet.textSync('hammer-io', { horizontalLayout: 'full' })));

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
  },
  {
    name: 'githubUsername',
    type: 'input',
    message: 'Github Username:',
    validate: (value) => {
      // tests for the github username according to the username rules
      if ((/^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i).test(value)) {
        return true;
      }
      return 'Invalid Github Username'
    }
  },
  {
    name: 'githubPassword',
    type: 'password',
    message: 'Github Password: '
  }
  ];

  inquirer.prompt(questions).then((answers) => {
    writeFiles(answers);
  });
}
