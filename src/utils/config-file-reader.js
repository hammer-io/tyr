import fs from 'fs';

import * as validator from './validator';
import { getActiveLogger } from '../utils/winston';

const log = getActiveLogger();

/**
 * Reads configurations from a file
 * @param path the path to read from
 */
// eslint-disable-next-line import/prefer-default-export
export function parseConfigsFromFile(path) {
  try {
    let contents = {};
    try {
      contents = JSON.parse(fs.readFileSync(path, 'utf-8'));
      const errors = validator.validateProjectConfigurations(contents);
      if (errors.length > 0) {
        log.error('Invalid configuration file format!');
        errors.forEach((value) => {
          log.error(`\t${value}`);
        });

        return;
      }

      return contents;
    } catch (err) {
      log.error('Invalid JSON format!');
    }
  } catch (err) {
    log.error('failed to read from config file', err);
  }
}
