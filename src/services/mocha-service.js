/* eslint-disable import/prefer-default-export */
import * as file from './../utils/files/file';
import { getActiveLogger } from '../utils/log/winston';

const log = getActiveLogger();
/**
 * Generates the files needed for mocha test
 * @param configs the configurations object
 * @returns {Promise<void>}
 */
export async function generateMochaFiles(projectName) {
  log.verbose('Mocha Service - generateMochaFiles()');
  const path = `${projectName}/test.js`;
  const content = file.loadTemplate('./../../../templates/mocha/test.js');

  file.writeFile(path, content);
  log.info(`Successfully generated file: ${path}`);
}
