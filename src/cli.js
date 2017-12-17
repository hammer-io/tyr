import * as prompt from './prompt/prompt';
import {getActiveLogger} from './utils/log/winston';

const log = getActiveLogger();

/**
 * Gets the users project configurations by triggering the prompt
 * @returns {Object} the user's project configurations
 */
async function getProjectConfigurations() {
  try {
    const configs = await prompt.promptForProjectConfigurations();
    return configs;
  } catch (error) {
    log.error('Failed to get project configurations', error);
  }
}

/**
 * Gets the users tooling configurations by triggering the prompt
 * @returns {Object} the user's tooling configurations
 */
async function getToolingConfigurations() {
  try {
    const configs = await prompt.promptForToolingConfigurations();
    return configs;
  } catch (error) {
    log.error('Failed to get tooling configurations', error);
  }
}

async function signInToHeroku() {
  let credentials = {};
  try {
    credentials = await prompt.promptForHerokuCredentials();
  }  catch (error) {
    log.error('Failed to get Heroku credentials', error);
  }

  // TODO validate heroku credentials


}

async function signInToGithub() {

}

// If the user needs to sign in to third party tools, then a key/value pair should go in this
// constant. The key should be the tool's name (all lowercase) and the value should be a function
// which should handle the sign in process.
const signInToThirdPartyTools = {
  heroku: signInToHeroku,
  github: signInToGithub
}

async function signInToThirdPartyTools() {

}


export async function run(configFile, logFile) {
  // TODO enable logfile

  // TODO enable config file parsing
  if (configFile) {
    return;
  }

  const projectConfigurations = await getProjectConfigurations();
  const toolingConfigurations = await getToolingConfigurations();


}
