import winston from 'winston';
import fs from 'fs';
import chalk from 'chalk';

import * as validator from './validator';

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
        console.log(chalk.red('!! Invalid configuration file format'));
        errors.forEach((value) => {
          console.log(chalk.red(`\t${value}`));
        });

        return;
      }

      return contents;
    } catch (err) {
      console.log(chalk.red('Invalid JSON format'));
    }
  } catch (err) {
    winston.log('error', 'failed to read from config file', err);
  }
}
