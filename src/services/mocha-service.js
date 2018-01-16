/* eslint-disable import/prefer-default-export */
import fs from 'fs';

import * as file from '../utils/file';
import { getActiveLogger } from '../utils/winston';

const log = getActiveLogger();
/**
 * Generates the files needed for mocha test
 * @param projectName the project name
 * @returns {Promise<void>}
 */
export async function generateMochaFiles(projectName) {
  log.verbose('Mocha Service - generateMochaFiles()');
  fs.mkdirSync(`${projectName}/test`);
  const path = `${projectName}/test/test.js`;
  const content = file.loadTemplate('./../../templates/mocha/test.js');

  // add mocha as a dev dependency to the package.json
  let projectPackageJson = file.readFile(`${projectName}/package.json`);
  projectPackageJson = JSON.parse(projectPackageJson);
  projectPackageJson.devDependencies.mocha = '3.5.3';

  // add mocha as the test script
  projectPackageJson.scripts.test = 'mocha';

  projectPackageJson = JSON.stringify(projectPackageJson, null, ' ');
  fs.unlinkSync(`${projectName}/package.json`);
  file.writeFile(`${projectName}/package.json`, projectPackageJson);
  file.writeFile(path, content);
  log.info(`Successfully generated file: ${path}`);
}
