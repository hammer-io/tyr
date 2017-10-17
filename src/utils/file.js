import fs from 'fs';
import path from 'path';
import winston from 'winston';

import packageTemplate from './../../templates/json/package.json';
import constants from './../constants/constants';

/**
 * Load template file.  IF an error is thrown, it will be caught, logged, then thrown again.
 * The given errMsg should be a constant.
 *
 * @param filePath
 * @param errMsg
 * @returns {*}
 */
export function loadTemplate(filePath, errMsg) {
  winston.log('verbose', 'loadTemplate', { filePath });

  try {
    return fs.readFileSync(path.join(__dirname, '/', filePath), 'utf-8');
  } catch (e) {
    winston.log('error', errMsg, e);
    throw e;
  }
}

/**
 * Write to the given filePath with the contents of a file.  The given errMsg should be a constant.
 *
 * @param filePath
 * @param fileContents
 * @param errMsg
 * @returns {*}
 */
export function writeFile(filePath, fileContents, errMsg) {
  winston.log('verbose', 'writeFile', { filePath });

  try {
    return fs.writeFileSync(filePath, fileContents);
  } catch (e) {
    winston.log('error', errMsg, e);
    throw e;
  }
}

/**
 * Generate a package.json file based on the user options selected
 *
 * @param config
 * @param dependencies
 */
export function createPackageJson(config, dependencies) {
  winston.log('verbose', 'createPackageJson');

  const author = config.author.split(',');

  const packageJson = packageTemplate;

  packageJson.name = config.projectName;
  packageJson.version = config.version;
  packageJson.description = config.description;
  packageJson.authors = author;
  packageJson.license = config.license;
  packageJson.dependencies = dependencies;

  const json = JSON.stringify(packageJson, null, '  ');

  writeFile(`${config.projectName}/package.json`, json, constants.packageJson.error.fileWrite);
}

/**
 * Generate a simple index.js file
 *
 * @param folderName
 */
export function createIndexFile(folderName) {
  winston.log('verbose', 'createIndexFile', { folderName });

  writeFile(
    `${folderName}/src/${constants.indexJS.fileName}`,
    loadTemplate('./../../templates/js/index.js', constants.indexJS.error.fileRead),
    constants.indexJS.error.fileWrite
  );
}
