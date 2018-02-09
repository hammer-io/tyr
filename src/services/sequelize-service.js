/* eslint-disable import/prefer-default-export,prefer-destructuring */
import fs from 'fs-extra';
import * as file from '../utils/file';

/**
 * Creates the db configuration object and writes it to a file
 * @param username the username of the mysql database user
 * @param password the password of the mysql database user
 * @param url the url
 * @param projectName the project name, which will be used as a the schema name
 */
async function createDbConfig(username, password, url, projectName, path) {
  // create the configuration
  const dbConfig = {
    username,
    password,
    url: 'localhost',
    schema: projectName
  };

  await file.writeFile(`${path}/dbConfig.json`, JSON.stringify(dbConfig, null, ' '));
}

/**
 * Creats the sequelize file from the template and writes it to the user's project
 * @param path the path to the db directory in the project
 */
async function createSequelizeFile(path) {
  const sequelizeTemplate = file.loadTemplate('./../../templates/sequelize/sequelize.js');
  await file.writeFile(`${path}/sequelize.js`, sequelizeTemplate);
}

/**
 * Updates the package.json file for the project with the sequelize dependency
 * @param projectName the name of the project
 * @returns {Promise<void>}
 */
async function updatePackageJsonWithSequelizeDependency(projectName) {
  let projectPackageJson = file.readFile(`${projectName}/package.json`);
  projectPackageJson = JSON.parse(projectPackageJson);
  projectPackageJson.dependencies.sequelize = '^4.33.2';
  projectPackageJson.dependencies.mysql2 = '^1.5.2';

  projectPackageJson = JSON.stringify(projectPackageJson, null, ' ');
  fs.unlinkSync(`${projectName}/package.json`);
  file.writeFile(`${projectName}/package.json`, projectPackageJson);
}

/**
 * Updates the index.js file to add the sequelize require statement
 * @param projectName the project name
 */
async function updateIndexJs(projectName) {
  let contents = file.readFile(`${projectName}/src/index.js`);
  const firstLine = 'const sequelize = require(\'./db/sequelize\');\n';
  contents = firstLine + contents;
  fs.unlinkSync(`${projectName}/src/index.js`);
  file.writeFile(`${projectName}/src/index.js`, contents);
}
/**
 * Generates the files necessary for sequelize and updates the package.json with the proper
 * dependencies
 * @param configs
 * @returns {Promise<void>}
 */
export async function generateSequelizeFiles(configs) {
  const projectName = configs.projectConfigurations.projectName;
  const path = `${projectName}/src/db`;
  fs.mkdirSync(path);

  // create db config
  await createDbConfig(
    configs.credentials.sequelize.username,
    configs.credentials.sequelize.password,
    'localhost',
    projectName,
    path
  );

  // create sequelize file
  await createSequelizeFile(path);

  // update package.json
  await updatePackageJsonWithSequelizeDependency(projectName);

  // update the index.js file
  await updateIndexJs(projectName);

  return configs;
}
