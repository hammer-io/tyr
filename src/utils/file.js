import fs from 'fs';
import path from 'path';

import packageTemplate from './../../templates/json/package.json';

/**
 * Load template file
 */
function loadTemplate(filepath) {
  return fs.readFileSync(path.join(__dirname, '/', filepath), 'utf-8');
}

/**
 * Generate a package.json file based on the user options selected
 */
export function createPackageJson(config, dependencies) {
  const author = config.author.split(',');

  const packageJson = packageTemplate;
  console.log(packageJson);

  packageJson.name = config.projectName;
  packageJson.version = config.version;
  packageJson.description = config.description;
  packageJson.authors = author;
  packageJson.license = config.license;
  packageJson.dependencies = dependencies;

  const json = JSON.stringify(packageJson, null, '  ');

  fs.writeFileSync(`${config.projectName}/package.json`, json);
}

/**
 * Generate a simple index.js file
 */
export function createIndexFile(folderName, usingExpress) {
  if (usingExpress) {
    fs.writeFileSync(`${folderName}/src/index.js`, loadTemplate('./../../templates/js/express/index.js'));
    fs.writeFileSync(`${folderName}/src/routes.js`, loadTemplate('./../../templates/js/express/routes.js'));
  } else {
    fs.writeFileSync(`${folderName}/src/index.js`, loadTemplate('./../../templates/js/index.js'));
  }
}
