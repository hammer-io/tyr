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

function initDocker(config) {
  console.log('Creating Dockerfile and .dockerignore...');

  const dockerFileContents = `# Use the official Node runtime as a parent image
# More info at https://hub.docker.com/_/node/
FROM node:alpine
    
# Set the working directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json package-lock.json ./
RUN npm install

# Bundle app source
COPY . .

# Make port 8080 available to the world outside this container
EXPOSE 8080

# Run "npm start" when the container launches
CMD ["npm", "start"]
`;

  fs.writeFile(`${config.projectName}/Dockerfile`, dockerFileContents, (err) => {
    if (err) {
      console.log(`ERROR: Failed to write Dockerfile\n${err.toString()}`);
    }
  });

  const dockerIgnoreContents = 'node_modules\nnpm-debug.log\n';

  fs.writeFile(`${config.projectName}/.dockerignore`, dockerIgnoreContents, (err) => {
    if (err) {
      console.log(`ERROR: Failed to write .dockerignore\n${err.toString()}`);
    }
  });
}

function writeFiles(config) {
  if (!fs.existsSync(config.projectName)) {
    fs.mkdirSync(config.projectName);
  }
  if (config.container === 'Docker') {
    initDocker(config);
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
