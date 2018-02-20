/* eslint-disable import/prefer-default-export */
import fs from 'fs';

import * as file from '../utils/file';
import { getActiveLogger } from '../utils/winston';

const log = getActiveLogger();
/**
 * Generates the files needed for mocha test
 * @param projectName the project name
 * @param filePath the newly created project's filePath
 * @returns {Promise<void>}
 */
export async function generateMochaFiles(projectName, filePath) {
  log.verbose('Mocha Service - generateMochaFiles()');
  fs.mkdirSync(`${filePath}/${projectName}/test`);
  const path = `${filePath}/${projectName}/test/test.js`;
  const content = file.loadTemplate('./../../templates/mocha/test.js');

  // add mocha as a dev dependency to the package.json
  let projectPackageJson = file.readFile(`${filePath}/${projectName}/package.json`);
  projectPackageJson = JSON.parse(projectPackageJson);
  projectPackageJson.devDependencies.mocha = '^5.0.0';

  // add mocha as the test script
  projectPackageJson.scripts.test = 'mocha';

  projectPackageJson = JSON.stringify(projectPackageJson, null, ' ');
  fs.unlinkSync(`${filePath}/${projectName}/package.json`);
  file.writeFile(`${filePath}/${projectName}/package.json`, projectPackageJson);
  file.writeFile(path, content);
  log.info(`Successfully generated file: ${path}`);
}
