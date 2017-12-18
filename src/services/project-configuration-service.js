import fs from 'fs';

import * as validator from './../utils/validators/project-configuration-validator';
import { getActiveLogger } from '../utils/log/winston';
import * as file from './file';

const log = getActiveLogger();

/**
 * Reads configurations from a file
 * @param path the path to read from
 */
// eslint-disable-next-line import/prefer-default-export
export function parseConfigsFromFile(path) {
  const contents = JSON.parse(fs.readFileSync(path, 'utf-8'));
  const errors = validator.validateProjectConfigurations(contents);

  if (errors.length > 0) {
    log.error('Invalid configuration file format!');
    errors.forEach((value) => {
      log.error(`\t${value}`);
    });

    return;
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
//     file.writeFile(`${configs.projectConfigurations.projectName}/${constants.tyrFile.fileName}`, JSON.stringify(outputConfig, null, 4));
//   } catch (err) {
//     log.error('failed to write to config file', err);
//   }
// }