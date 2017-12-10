import inquirer from 'inquirer';
import chalk from 'chalk';

import * as projectConfigurationValidator from '../utils/validators/project-configuration-validator';
import choices from './../constants/choices/choices';


async function promptForProjectConfigurations() {
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

function cleanToolingData(toolingConfig) {
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

async function promptForToolingConfigurations() {
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
  return tooling;
}


export async function prompt() {
  const configs = {};
  configs.projectConfigs = await promptForProjectConfigurations();
  const toolingConfigs = await promptForToolingConfigurations();
  configs.toolingConfigs = cleanToolingData(toolingConfigs);
  return configs;
}
