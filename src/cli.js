/**
 * The Cli class.
 */

import chalk from 'chalk';
import figlet from 'figlet';
import inquirer from 'inquirer';
import isValid from 'is-valid-path';
import fs from 'fs';

import ciChoices from '../ci-choices.json';
import containerizationChoices from '../containerization-choices.json';

function writeFiles(config) {
  if (!fs.existsSync(config.projectName)) {
    fs.mkdirSync(config.projectName);
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
  }
  ];

  inquirer.prompt(questions).then((answers) => {
    writeFiles(answers);
  });
}
