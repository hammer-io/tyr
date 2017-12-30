/* eslint-disable import/prefer-default-export */
import fs from 'fs';

import * as validator from './../utils/validators/project-configuration-validator';
import { getActiveLogger } from '../utils/log/winston';

const log = getActiveLogger();
/**
 * Reads configurations from a file
 * @param path the path to read from
 */
export function parseConfigsFromFile(path) {
  log.verbose('Project Configuration Service - parseConfigsFromFile()');
  const contents = JSON.parse(fs.readFileSync(path, 'utf-8'));
  const errors = validator.validateProjectConfigurations(contents);

  if (errors.length > 0) {
    let message = '';
    errors.forEach((value) => {
      message += `${value}\n`;
    });

    throw new Error(message.trim());
  }

  return contents;
}

/**
 * Writes the user's configurations to a config file. It should not and does not write their
 * credentials to a config file which is stored in configs.credentials.
 *
 * @param configs the config object
 */
// export function writeToConfigFile(configs) {
//   const outputConfig = {};
//   outputConfig.projectConfigurations = configs.projectConfigurations;
//   outputConfig.tooling = configs.tooling;
//
//   try {
//     file.writeFile(`${configs.projectConfigurations.projectName}/${constants.tyrFile.fileName}`,
// JSON.stringify(outputConfig, null, 4));
//   } catch (err) {
//     log.error('failed to write to config file', err);
//   }
// }
