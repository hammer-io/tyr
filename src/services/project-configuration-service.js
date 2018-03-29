/* eslint-disable import/prefer-default-export */
import * as file from '../utils/file';
import * as jsonUtil from '../utils/json-util';

import * as validator from '../utils/project-configuration-validator';
import { getActiveLogger } from '../utils/winston';
import { cleanToolingData } from '../prompt/prompt';

const log = getActiveLogger();
/**
 * Reads configurations from a file
 * @param path the path to read from
 */
export function parseConfigsFromFile(path) {
  log.verbose('Project Configuration Service - parseConfigsFromFile()');
  const contents = JSON.parse(file.readFile(path));
  const errors = validator.validateProjectConfigurations(contents);

  if (errors.length > 0) {
    let message = '';
    errors.forEach((value) => {
      message += `${value}\n`;
    });

    throw new Error(message.trim());
  }

  // clean contents
  contents.toolingConfigurations = cleanToolingData(contents.toolingConfigurations);
  return contents;
}

/**
 * Writes the user's configurations to a config file. It should not and does not write their
 * credentials to a config file which is stored in configs.credentials.
 *
 * @param configs the config object
 * @param projectPath the newly created project's path
 */
export function writeToConfigFile(configs, projectPath) {
  const outputConfig = {};
  outputConfig.projectConfigurations = configs.projectConfigurations;
  outputConfig.toolingConfigurations = configs.toolingConfigurations;

  try {
    file.writeFile(`${projectPath}/.tyrfile`, jsonUtil.stringify(outputConfig));
  } catch (err) {
    throw new Error('Failed to generate .tyrfile!');
  }
}
