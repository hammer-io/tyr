/* eslint-disable no-await-in-loop,no-restricted-syntax */
import * as prompt from './prompt/prompt';
import { getActiveLogger, enableLogFile } from './utils/log/winston';
import { Tyr } from './tyr';
import { parseConfigsFromFile } from './services/project-configuration-service';
import * as githubService from './services/github-service';
import * as herokuService from './services/heroku-service';

const log = getActiveLogger();

/**
 * Gets the users project configurations by triggering the prompt
 * @returns {Object} the user's project configurations
 */
async function getProjectConfigurations() {
  const configs = await prompt.promptForProjectConfigurations();
  return configs;
}

/**
 * Gets the users tooling configurations by triggering the prompt
 * @returns {Object} the user's tooling configurations
 */
async function getToolingConfigurations() {
  const configs = await prompt.promptForToolingConfigurations();
  return configs;
}

/**
 * Function which facilitates signing in to heroku. Gets the credentials, validates the
 * credentials, and if they are invalid, prompts for new credentials.
 * @returns {Object} the heroku credentials as a email and password key/value pair
 */
export async function signInToHeroku() {
  const credentials = await prompt.promptForHerokuCredentials();
  const isValid = await herokuService.isValidCredentials(credentials.email, credentials.password);
  if (!isValid) {
    await signInToHeroku();
  }

  return credentials;
}

/**
 * Function which facilitates signing in to github. Gets the credentials, validates the
 * credentials, and if they are invalid, prompts for new credentials.
 * @returns {Object} the github credentials as a username and password key/value pair
 */
export async function signInToGithub() {
  const credentials = await prompt.promptForGithubCredentials();
  const isValid = await githubService.isValidCredentials(
    credentials.username,
    credentials.password
  );

  if (!isValid) {
    await signInToGithub();
  }

  return credentials;
}

// If the user needs to sign in to third party tools, then a key/value pair should go in this
// constant. The key should be the tool's name (all lowercase) and the value should be a function
// which should handle the sign in process.
const thirdPartyTools = {
  heroku: signInToHeroku,
  github: signInToGithub
};

/**
 * Function which facilitates signing in to third party tools
 * @param toolingConfigs the tooling configurations
 * @returns {Object} the credentials for the third party tools
 */
async function signInToThirdPartyTools(toolingConfigs) {
  const credentials = {};
  for (const key of Object.keys(toolingConfigs)) {
    const tool = toolingConfigs[key];
    if (thirdPartyTools[tool.toLowerCase()]) {
      credentials[tool] = await thirdPartyTools[tool.toLowerCase()]();
    }
  }

  return credentials;
}

/**
 * Get the configurations from a file
 * @param configFile the path to the configuration file
 * @returns {Object} the configurations
 */
function getConfigurationsFromFile(configFile) {
  let configurations = {};
  try {
    configurations = parseConfigsFromFile(configFile);
    return configurations;
  } catch (error) {
    log.error('Failed to parse from configuration file', error);
  }
}

/**
 * Get the configuration from a prompt
 * @returns {Object} the project configurations
 */
async function getConfigurationsFromPrompt() {
  const configurations = {};
  const projectConfigurations = await getProjectConfigurations();
  const toolingConfigurations = await getToolingConfigurations();
  configurations.projectConfigurations = projectConfigurations;
  configurations.toolingConfigurations = toolingConfigurations;
  return configurations;
}

/**
 * The main run function
 * @param configFile path to the configuration file
 * @param logFile path to the logfile
 */
export async function run(configFile, logFile) {
  if (logFile) {
    enableLogFile(logFile);
  }

  let configurations = {};

  // parse from the config file that was passed in
  try {
    if (configFile) {
      configurations = getConfigurationsFromFile(configFile);

      // if something goes wrong, get configs from the prompt
      if (!configurations) {
        configurations = await getConfigurationsFromPrompt();
      }

      // no config file, that means we should get configs from the prompt
    } else {
      configurations = await getConfigurationsFromPrompt();
    }
  } catch (error) {
    log.error('Unable to get configurations. Exiting tyr.');
  }
  // sign in to third party tools
  try {
    const credentials = await signInToThirdPartyTools(configurations.toolingConfigurations);
    configurations.credentials = credentials;
  } catch (error) {
    log.error(`${error.message}. Exiting tyr.`);
    return;
  }

  // TODO enable third party tools
  const tyr = new Tyr(configurations);
  tyr.generateProject();
}
