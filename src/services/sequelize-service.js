/* eslint-disable import/prefer-default-export,prefer-destructuring */
import * as file from '../utils/file';
import * as packageJsonUtil from '../utils/package-json-util';

/**
 * Creates the sequelize file from the template and writes it to the user's project
 * @param path the path to the db directory in the project
 */
async function createSequelizeFile(path) {
  const sequelizeTemplate = file.loadTemplate('./../../templates/sequelize/sequelize.js');
  await file.writeFile(`${path}/sequelize.js`, sequelizeTemplate);
}

/**
 * Updates the package.json file for the project with the sequelize dependency
 * @param path the path to the new project directory
 * @returns {Promise<void>}
 */
async function updatePackageJsonWithSequelizeDependencies(path) {
  packageJsonUtil.addDependencyToPackageJsonFile(path, 'sequelize', '^4.33.2');
  packageJsonUtil.addDependencyToPackageJsonFile(path, 'mysql2', '^1.5.2');
}

/**
 * Updates the index.js file to add the sequelize require statement
 * @param path the path to the new project src folder
 */
async function updateIndexJs(path) {
  const indexJSFileName = `${path}/index.js`;
  let contents = file.readFile(indexJSFileName);
  const firstLine = 'const sequelize = require(\'./db/sequelize\');\n';
  contents = firstLine + contents;
  file.deleteFile(indexJSFileName);
  file.writeFile(indexJSFileName, contents);
}
/**
 * Generates the files necessary for sequelize and updates the package.json with the proper
 * dependencies
 * @param configs
 * @param projectPath
 * @returns {Promise<void>}
 */
export async function generateSequelizeFiles(configs, projectPath) {
  const path = `${projectPath}/`;
  const dbFolderPath = `${path}/src/db`;
  file.createDirectory(dbFolderPath);

  // create sequelize file
  await createSequelizeFile(dbFolderPath);

  // update package.json
  await updatePackageJsonWithSequelizeDependencies(path);

  // update the index.js file
  await updateIndexJs(`${path}/src/`);

  return configs;
}
