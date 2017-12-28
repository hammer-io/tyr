/* eslint-disable import/prefer-default-export */
import * as file from './../utils/files/file';

/**
 * Generates the files needed for mocha test
 * @param configs the configurations object
 * @returns {Promise<void>}
 */
export async function generateMochaFiles(configs) {
  const path = `${configs.projectConfigurations.projectName}/test.js`;
  const content = file.loadTemplate('./../../../templates/mocha/test.js');

  file.writeFile(path, content);
}
