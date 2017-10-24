import fs from 'fs';
import path from 'path';
import chalk from 'chalk';

import packageTemplate from './../../templates/json/package.json';
import constants from './../constants/constants';
import { getActiveLogger } from '../utils/winston';

const log = getActiveLogger();

/**
 * Load template file.  IF an error is thrown, it will be caught, logged, then thrown again.
 * The given errMsg should be a constant.
 *
 * @param filePath
 * @returns {*}
 */
export function loadTemplate(filePath) {
  log.verbose('loading template file', { filePath });

  try {
    return fs.readFileSync(path.join(__dirname, '/', filePath), 'utf-8');
  } catch (e) {
    log.error(`Failed to read template ${filePath}!`);
    log.verbose(`Failed to read template ${filePath}!`, e);
    return undefined;
  }
}

/**
 * Write to the given filePath with the contents of a file.  The given errMsg should be a constant.
 *
 * @param filePath
 * @param fileContents
 * @returns {*}
 */
export function writeFile(filePath, fileContents) {
  log.verbose('writing file', { filePath });

  try {
    console.log(chalk.green(`Successfully created ${filePath}`));
    return fs.writeFileSync(filePath, fileContents);
  } catch (e) {
    log.error(`Failed to write ${filePath}!`);
    log.verbose(`Failed to write ${filePath}!`, e);
    return undefined;
  }
}

/**
 * Generate a package.json file based on the user options selected
 *
 * @param config
 * @param dependencies
 */
export function createPackageJson(config, dependencies) {
  log.verbose('creating package.json file');

  const author = config.author.split(',');

  const packageJson = packageTemplate;

  packageJson.name = config.projectName;
  packageJson.version = config.version;
  packageJson.description = config.description;
  packageJson.authors = author;
  packageJson.license = config.license;
  packageJson.dependencies = dependencies;

  const json = JSON.stringify(packageJson, null, '  ');

  writeFile(`${config.projectName}/package.json`, json);
}

/**
 * Generate a simple index.js file
 *
 * @param folderName
 */
export function createIndexFile(folderName) {
  log.verbose('creating index.js file', { folderName });

  writeFile(
    `${folderName}/src/${constants.indexJS.fileName}`,
    loadTemplate('./../../templates/js/index.js')
  );
}
