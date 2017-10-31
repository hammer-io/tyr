import inquirer from 'inquirer';

import * as validator from './utils/validator';
import sourceControlChoices from './constants/source-control-choices';
import ciChoices from './constants/ci-choices';
import containerizationChoices from './constants/containerization-choices';
import deploymentChoices from './constants/deployment-choices';
import webChoices from './constants/web-choices';
import { getActiveLogger } from './utils/winston';

const log = getActiveLogger();

/**
 * Prompts the user for basic project configurations
 * @returns a structure for basic project information
 *
 * {
 *  name: 'projectName',
 *  description: 'some description here',
 *  version: '0.0.0'
 *  author: 'author1, author2, ..., authorN',
 *  license: 'MIT'
 * }
 *
 */
async function promptForProjectConfigurations() {
  const projectConfigurationQuestions = [{
    name: 'projectName',
    type: 'input',
    message: 'Project Name:',
    validate: value => validator.validateProjectName(value)
  }, {
    name: 'description',
    type: 'input',
    message: 'Project Description:'
  }, {
    name: 'version',
    type: 'input',
    default: '0.0.0',
    message: 'Version:',
    validate: value => validator.validateVersionNumber(value)
  }, {
    name: 'author',
    type: 'input',
    message: 'Author:'
  }, {
    name: 'license',
    type: 'input',
    message: 'License:'
  }];

  try {
    const projectConfigurations = await inquirer.prompt(projectConfigurationQuestions);
    return projectConfigurations;
  } catch (err) {
    log.error('failed to prompt project configurations', err);
  }
}

/**
 * Prompts the user for the tools that they want to use
 *
 * @returns the tooling choices structure
 *
 *
 *  {
 *   sourceControl: 'GitHub',
 *   ci: 'TravisCI',
 *   containerization: 'Docker',
 *   deployment: 'Heroku',
 *   web: 'ExpressJS'
 *  }
 */
async function promptForTooling() {
  const toolingQuestions = [{
    name: 'sourceControl',
    type: 'list',
    choices: sourceControlChoices.choices,
    message: 'Choose your source control tool:'
  }, {
    name: 'ci',
    type: 'list',
    choices: ciChoices.choices,
    message: 'Choose your CI tool:',
    when: answers =>
      // the ci choices question should only be asked if the user selected a source control method
      typeof answers.ci !== 'undefined' || answers.sourceControl !== sourceControlChoices.none || !answers.sourceControl

  }, {
    name: 'containerization',
    type: 'list',
    choices: containerizationChoices.choices,
    message: 'Choose your containerization tool:',
    when: answers =>
      // the container choices questions should only be asked if the user selected a ci tool
      (typeof answers.ci !== 'undefined') && (answers.ci !== ciChoices.none || !answers.ci)

  }, {
    name: 'deployment',
    type: 'list',
    choices: deploymentChoices.choices,
    message: 'Choose your hosting service:',
    when: answers =>
      // the deployment choices question should only be asked if the user selected a container
      (typeof answers.containerization !== 'undefined') && (answers.containerization !== containerizationChoices.none || !answers.containerization)

  }, {
    name: 'web',
    type: 'list',
    choices: webChoices.choices,
    message: 'Choose your web application framework:'
  }];

  try {
    const tooling = await inquirer.prompt(toolingQuestions);
    // clean prompt data
    if (typeof tooling.ci === 'undefined') {
      tooling.ci = ciChoices.none;
    }

    if (typeof tooling.containerization === 'undefined') {
      tooling.containerization = containerizationChoices.none;
    }

    if (typeof tooling.deployment === 'undefined') {
      tooling.deployment = deploymentChoices.none;
    }

    return tooling;
  } catch (err) {
    log.error('failed to prompt tooling choices', err);
  }
}

/**
 * Prompts the user for their docker email and password.
 *
 * @returns their credentials
 *
 * {
 *  email: 'someemail@email.com',
 *  password: 'somethingsomething'
 * }
 */
export async function promptForDockerCredentials() {
  log.verbose('prompting for Docker credentials');
  const questions = [{
    name: 'username',
    type: 'input',
    message: 'Docker Username:',
    validate: (value) => {
      if (typeof value === 'undefined' || value === '' || value.indexOf(' ') !== -1) {
        return 'Docker username cannot be blank!';
      }

      return true;
    }
  }, {
    name: 'password',
    type: 'password',
    message: 'Docker Password:',
    validate: (value) => {
      if (typeof value === 'undefined' || value === '' || value.indexOf(' ') !== -1) {
        return 'Docker password cannot be blank!';
      }

      return true;
    }
  }];

  try {
    const dockerCredentials = await inquirer.prompt(questions);
    return dockerCredentials;
  } catch (err) {
    log.error('failed to prompt for Docker credentials', err);
  }
}

/**
 * Prompts the user for their heroku username and password.
 *
 * @returns their credentials
 *
 * {
 *  username: 'something',
 *  password: 'somethingsomething'
 * }
 */
export async function promptForHerokuCredentials() {
  const questions = [{
    name: 'email',
    type: 'input',
    message: 'Heroku Email:',
    validate: (value) => {
      if (typeof value === 'undefined' || value === '' || value.indexOf(' ') !== -1) {
        return 'Heroku email cannot be blank!';
      }

      return true;
    }
  }, {
    name: 'password',
    type: 'password',
    message: 'Heroku Password:',
    validate: (value) => {
      if (typeof value === 'undefined' || value === '' || value.indexOf(' ') !== -1) {
        return 'Heroku password cannot be blank!';
      }

      return true;
    }
  }, {
    name: 'apiKey',
    type: 'password',
    message: 'Heroku API Key:',
    validate: (value) => {
      if (typeof value === 'undefined' || value === '' || value.indexOf(' ') !== -1) {
        return 'Heroku API key cannot be blank!';
      }

      return true;
    }
  }];

  try {
    const herokuCredentials = await inquirer.prompt(questions);
    return herokuCredentials;
  } catch (err) {
    log.error('failed to prompt for Heroku credentials', err);
  }
}

/**
 * Prompts the user for their github username and password.
 *
 * @returns their credentials
 *
 * {
 *  username: 'something',
 *  password: 'somethingsomething'
 * }
 */
export async function promptForGithubCredentials() {
  log.verbose('prompting for GitHub credentials');
  const questions = [{
    name: 'username',
    type: 'input',
    message: 'GitHub Username:',
    validate: (value) => {
      if (typeof value === 'undefined' || value === '' || value.indexOf(' ') !== -1) {
        return 'GitHub username cannot be blank!';
      }

      return true;
    }
  }, {
    name: 'password',
    type: 'password',
    message: 'GitHub Password:',
    validate: (value) => {
      if (typeof value === 'undefined' || value === '' || value.indexOf(' ') !== -1) {
        return 'GitHub password cannot be blank!';
      }

      return true;
    }
  }];

  try {
    const githubCredentials = await inquirer.prompt(questions);
    return githubCredentials;
  } catch (err) {
    log.error('failed to prompt for GitHub credentials', err);
  }
}

/**
 * Prompts the user for their configurations.
 *
 * @returns the project configurations and tooling configurations
 */
export async function prompt() {
  log.verbose('prompting for configurations');
  try {
    const configurations = {};

    // get basic project configurations
    const projectConfigurations = await promptForProjectConfigurations();
    configurations.projectConfigurations = projectConfigurations;

    // get tooling options
    const tooling = await promptForTooling();
    configurations.tooling = tooling;

    return configurations;
  } catch (err) {
    log.error('failed to prompt user for their configurations', err);
  }
}
