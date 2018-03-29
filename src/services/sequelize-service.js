/* eslint-disable import/prefer-default-export,prefer-destructuring */
import * as file from '../utils/file';

/**
 * Creates the db configuration object and writes it to a file
 * @param username the username of the mysql database user
 * @param password the password of the mysql database user
 * @param url the url
 * @param projectName the project name, which will be used as a the schema name
 * @param path to the newly created project
 */
async function createDbConfig(username, password, url, projectName, path) {
  const configPath = `${path}/config/`;
  const dbConfigTemplate = file.loadTemplate('../../templates/node-config/dbConfig.json');
  const dbConfig = JSON.parse(dbConfigTemplate);
  const dbConfigExample = JSON.parse(dbConfigTemplate);

  dbConfig.username = username;
  dbConfig.password = password;
  dbConfig.url = 'localhost';
  dbConfig.schema = projectName;

  const defaultJsonPath = `${configPath}/default.json`;
  const defaultExampleJsonPath = `${configPath}/default-example.json`;
  const defaultJson = JSON.parse(await file.readFile(defaultJsonPath));
  const defaultExampleJson = JSON.parse(await file.readFile(defaultExampleJsonPath));

  defaultJson.dbConfig = dbConfig;
  defaultExampleJson.dbConfig = dbConfigExample;

  await file.deleteFile(`${configPath}/default.json`);
  await file.deleteFile(`${configPath}/default-example.json`);
  await file.writeFile(defaultJsonPath, JSON.stringify(defaultJson, null, ' '));
  await file.writeFile(defaultExampleJsonPath, JSON.stringify(defaultExampleJson, null, ' '));
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
 * @param path the path to the new project directory
 * @returns {Promise<void>}
 */
async function updatePackageJsonWithSequelizeDependencies(path) {
  const packageJsonFileName = `${path}/package.json`;
  let projectPackageJson = file.readFile(packageJsonFileName);
  projectPackageJson = JSON.parse(projectPackageJson);
  projectPackageJson.dependencies.sequelize = '^4.33.2';
  projectPackageJson.dependencies.mysql2 = '^1.5.2';

  projectPackageJson = JSON.stringify(projectPackageJson, null, ' ');
  file.deleteFile(packageJsonFileName);
  file.writeFile(packageJsonFileName, projectPackageJson);
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
  const projectName = configs.projectConfigurations.projectName;
  const path = `${projectPath}/`;
  const dbFolderPath = `${path}/src/db`;
  file.createDirectory(dbFolderPath);

  // create db config
  await createDbConfig(
    configs.credentials.sequelize.username,
    configs.credentials.sequelize.password,
    'localhost',
    projectName,
    path
  );

  // create sequelize file
  await createSequelizeFile(dbFolderPath);

  // update package.json
  await updatePackageJsonWithSequelizeDependencies(path);

  // update the index.js file
  await updateIndexJs(`${path}/src/`);

  return configs;
}
