/* eslint-disable import/prefer-default-export */
import * as file from '../utils/file';
import * as packageJsonUtil from '../utils/package-json-util';
import { getActiveLogger } from '../utils/winston';

const log = getActiveLogger();
/**
 * Generates the files needed for mocha test
 * @param projectPath the newly created project's filePath
 * @returns {Promise<void>}
 */
export async function generateMochaFiles(projectPath) {
  log.verbose('Mocha Service - generateMochaFiles()');
  file.createDirectory(`${projectPath}/test`);
  const path = `${projectPath}/test/test.js`;

  // create test.js file
  const content = file.loadTemplate('./../../templates/mocha/test.js');
  file.writeFile(path, content);

  // add mocha as a dev dependency to the package.json
  packageJsonUtil.addDevDependencyToPackageJsonFile(projectPath, 'mocha', '^5.0.0');
  packageJsonUtil.addScriptToPackageJsonFile(projectPath, 'test', 'mocha');

  log.info(`Successfully generated file: ${path}`);
}
