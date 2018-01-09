import inquirer from 'inquirer';
import chalk from 'chalk';

import * as projectConfigurationValidator from '../utils/project-configuration-validator';
import choices from '../constants/choices';

/**
 * Prompts the user for their project configurations
 * @returns {Object} an object representing the user's project configurations
 */
export async function promptForProjectConfigurations() {
  console.log(chalk.blue('Enter your Project Configurations: '));

  const projectConfigurationQuestions = [{
    name: 'projectName',
    type: 'input',
    message: 'Project Name:',
    validate: value => projectConfigurationValidator.validateProjectName(value)
  }, {
    name: 'description',
    type: 'input',
    message: 'Project Description:'
  }, {
    name: 'version',
    type: 'input',
    default: '0.0.0',
    message: 'Version:',
    validate: value => projectConfigurationValidator.validateVersionNumber(value)
  }, {
    name: 'author',
    type: 'input',
    message: 'Author:'
  }, {
    name: 'license',
    type: 'input',
    message: 'License:'
  }];

  const projectConfigurations = await inquirer.prompt(projectConfigurationQuestions);
  return projectConfigurations;
}

/**
 * Cleans the tooling data by removing any key/value pairs that have a value of <None>
 * @param toolingConfig the config object to clean
 * @returns {Object} the cleaned config object
 */
export function cleanToolingData(toolingConfig) {
  Object.keys(toolingConfig).forEach((key) => {
    if (toolingConfig[key]) {
      if (toolingConfig[key] === choices.none) {
        // eslint-disable-next-line no-param-reassign
        delete toolingConfig[key];
      }
    }
  });

  return toolingConfig;
}

/**
 * Prompts the user for their tooling configurations
 * @returns {Object} an object representing their choices in tooling
 */
export async function promptForToolingConfigurations() {
  console.log(chalk.blue('Choose your Tooling: '));

  const toolingQuestions = [{
    name: 'sourceControl',
    type: 'list',
    choices: choices.sourceControlChoices,
    message: 'Source Control:'
  }, {
    name: 'ci',
    type: 'list',
    choices: choices.ciChoices,
    message: 'Continuous Integration:',
    when: answers =>
      // the ci choices question should only be asked if the user selected a source control method
      typeof answers.ci !== 'undefined' || answers.sourceControl !== choices.none || !answers.sourceControl

  }, {
    name: 'containerization',
    type: 'list',
    choices: choices.containerizationChoices,
    message: 'Containerization Tool:',
    when: answers =>
      // the container choices questions should only be asked if the user selected a ci tool
      (typeof answers.ci !== 'undefined') && (answers.ci !== choices.none || !answers.ci)

  }, {
    name: 'deployment',
    type: 'list',
    choices: choices.deploymentChoices,
    message: 'Hosting Service:',
    when: answers =>
      // the deployment choices question should only be asked if the user selected a container
      (typeof answers.containerization !== 'undefined') && (answers.containerization !== choices.none || !answers.containerization)

  }, {
    name: 'web',
    type: 'list',
    choices: choices.webChoices,
    message: 'Web Application Framework:'
  }];

  const tooling = await inquirer.prompt(toolingQuestions);
  return cleanToolingData(tooling);
}

/**
 * Prompt for username and password combination
 * @returns {Object} object containing an username and password key/value pair
 */
export async function promptForUsernamePassword() {
  const usernamePasswordQuestions = [{
    name: 'username',
    type: 'input',
    message: 'Username:'
  }, {
    name: 'password',
    type: 'password',
    message: 'Password:'
  }];

  const credentials = await inquirer.prompt(usernamePasswordQuestions);
  return credentials;
}

/**
 * Prompts the user for an email and password combination
 * @returns {Object} object containing an email and password key/value pair
 */
export async function promptForEmailAndPasswordApiKey() {
  const usernamePasswordQuestions = [{
    name: 'email',
    type: 'input',
    message: 'Email:'
  }, {
    name: 'password',
    type: 'password',
    message: 'Password:'
  }, {
    name: 'apiKey',
    type: 'password',
    message: 'API Key:'
  }];

  const credentials = await inquirer.prompt(usernamePasswordQuestions);
  return credentials;
}

/**
 * Prompts the user for their username and password on github
 * @returns {Promise<*>}
 */
export async function promptForGithubCredentials() {
  console.log(chalk.blue('Enter your GitHub username and Password:'));
  const githubCredentials = await promptForUsernamePassword();

  return githubCredentials;
}

/**
 * Prompts the user for their email and password on Heroku
 * @returns {Promise<void>}
 */
export async function promptForHerokuCredentials() {
  console.log(chalk.blue('Enter your Heroku email and password:'));
  const herokuCredentials = await promptForEmailAndPasswordApiKey();

  return herokuCredentials;
}
