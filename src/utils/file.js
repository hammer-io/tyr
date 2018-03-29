import fs from 'fs-extra';
import path from 'path';

import { getActiveLogger } from './winston';

const log = getActiveLogger();

/**
 * Creates the given directory
 * @param directoryPath the path to the directory to create
 */
export function createDirectory(directoryPath) {
  log.verbose(`creating directory: ${directoryPath}`);
  try {
    fs.mkdirsSync(directoryPath);
  } catch (error) {
    log.debug(error.message);
    throw new Error(`Failed to create directory ${directoryPath}`);
  }
}

/**
 * Reads the file at the path given.
 * @param filePath
 * @returns {*}
 */
export function readFile(filePath) {
  log.verbose(`reading file: ${filePath}`);
  try {
    return fs.readFileSync(filePath, 'utf-8');
  } catch (error) {
    log.debug(error.message);
    throw new Error(`Failed to read file ${filePath}!`);
  }
}


/**
 * Load template file.  IF an error is thrown, it will be caught, logged, then thrown again.
 * The given errMsg should be a constant.
 *
 * @param filePath
 * @returns {*}
 */
export function loadTemplate(filePath) {
  log.verbose(`loading template: ${path.join(__dirname, '/', filePath)}`);
  try {
    return fs.readFileSync(path.join(__dirname, '/', filePath), 'utf-8');
  } catch (error) {
    log.debug(error.message);
    throw new Error(`Failed to read template ${filePath}!`);
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
  log.verbose(`writing file: ${filePath}`);
  try {
    return fs.writeFileSync(filePath, fileContents);
  } catch (error) {
    log.debug(error.message);
    throw new Error(`Failed to write ${filePath}!`);
  }
}

/**
 * Deletes a file at the given path
 * @param filePath the path to the file to be deleted
 */
export function deleteFile(filePath) {
  log.verbose(`deleting file: ${filePath}`);
  try {
    fs.unlinkSync(filePath);
  } catch (error) {
    log.debug(error.message);
    throw new Error(`Failed to delete ${filePath}!`);
  }
}

/**
 * Checks if teh given file exists
 * @param filePath path to the file
 */
export function exists(filePath) {
  log.verbose(`checking if ${filePath} exists`);
  try {
    return fs.existsSync(filePath);
  } catch (error) {
    log.debug(error.message);
    throw new Error(`Failed to check if ${filePath} exists!`);
  }
}
