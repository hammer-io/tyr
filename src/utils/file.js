import fs from 'fs';

import packageTemplate from '../templates/template-package';
import constants from '../constants/constants'

/**
 * Generate a package.json file based on the user options selected
 */
export function createPackageJson(config) {
  const author = config.author.split(',');

  const packageJson = packageTemplate;

  packageJson.name = config.projectName;
  packageJson.version = config.version;
  packageJson.description = config.description;
  packageJson.authors = author;
  packageJson.license = config.license;

  const json = JSON.stringify(packageJson, null, '\t');

  fs.writeFileSync(`${config.projectName}/package.json`, json);
}

/**
 * Generate a simple index.js file
 */
export function createIndexFile(folderName) {
  fs.writeFileSync(`${folderName}/src/index.js`, constants.indexJS.fileContents);
}
