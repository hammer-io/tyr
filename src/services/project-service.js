/* eslint-disable import/prefer-default-export,prefer-destructuring */
import fs from 'fs';

import * as file from '../utils/file';
import { getActiveLogger } from '../utils/winston';
import * as projectConfigurationService from './project-configuration-service';

const log = getActiveLogger();

/**
 * Generates the basic folder structure for the project
 * @param projectPath the new project's file path
 * @returns {Promise<void>}
 */
async function generateProjectFolders(projectPath) {
  log.verbose('Project File Service - generateProjectFolders()');

  if (!fs.existsSync(`${projectPath}`)) {
    fs.mkdirSync(`${projectPath}`);
    fs.mkdirSync(`${projectPath}/src`);
    log.info('Successfully created project folder structure');
  } else {
    throw new Error('Project already exists!');
  }
}

/**
 * Generates the basic index.js file.
 * @param projectPath the new project's file path
 * @returns {Promise<void>}
 */
async function generateIndexFile(projectPath) {
  log.verbose('Project File Service - generateIndexFile()');

  const path = `${projectPath}/src/index.js`;
  const contents = file.loadTemplate('./../../templates/js/index.js');
  file.writeFile(path, contents);
  log.info(`Successfully generated file: ${path}`);
}

/**
 * Genrerates the basic project's package json. The output of this file will be used later if
 * other tools need to be in the package json.
 * @param configs the project configuration's object
 * @param projectPath the new project's file path
 * @returns {Promise<void>}
 */
async function generatePackageJson(configs, projectPath) {
  log.verbose('Project File Service - generatePackageJson()');

  const projectConfigs = configs.projectConfigurations;
  const path = `${projectPath}/package.json`;

  // load the contents from the template file
  let contents = file.loadTemplate('./../../templates/js/package.json');

  // turn the template contents into json
  contents = JSON.parse(contents);
  contents.name = projectConfigs.projectName;
  contents.description = projectConfigs.description;
  contents.license = projectConfigs.license;
  contents.version = projectConfigs.version;
  contents.authors = projectConfigs.author.split(',');

  // turn the contents back to JSOn
  contents = JSON.stringify(contents, null, ' ');
  file.writeFile(path, contents);
  log.info(`Successfully generated file: ${path}`);
}

/**
 * Generates the project README
 * @param configs the configuration object
 * @param projectPath the new project's file path
 * @returns {Promise<void>}
 */
async function generateReadMe(configs, projectPath) {
  log.verbose('Project Files Service - generateReadMe()');
  const projectName = configs.projectConfigurations.projectName;
  const description = configs.projectConfigurations.description;
  const path = `${projectPath}/README.md`;
  const contents = `# ${projectName}\n`
    + `${description}\n\n`
    + '## Installation'
    + '\n'
    + '`npm install`'
    + '\n\n'
    + '## Usage'
    + '\n'
    + '`npm start`'
    + '\n\n'
    + 'Generated by [@hammer-io](https://github.com/hammer-io/tyr)';

  file.writeFile(path, contents);
  log.info(`Successfully generated file: ${path}`);
}

/**
 * Generates a tyr file
 * @param configs the configurations object
 * @param projectPath the new project's file path
 * @returns {Promise<void>}
 */
export async function generateTyrfile(configs, projectPath) {
  log.verbose('Project Service - generateTyrfile()');

  await projectConfigurationService.writeToConfigFile(configs, projectPath);

  log.info(`Successfully generated file: ${configs.projectConfigurations.projectName}/.tyrfile`);
}

export async function generateNodeConfig(configs, projectPath) {
  log.verbose('Project Service - generateNodeConfig');

  const configPath = `${projectPath}/config`;
  const emptyJsonObject = {};

  fs.mkdirSync(`${configPath}`);
  await file.writeFile(`${configPath}/default.json`, JSON.stringify(emptyJsonObject, null, ' '));
  await file.writeFile(`${configPath}/default-example.json`, JSON.stringify(emptyJsonObject, null, ' '));
}

/**
 * Genereates the basic file structure and files needed for a node project
 * @param configs the configurations object
 * @param projectPath the new project's file path
 * @returns {Promise<void>}
 */
export async function generateBasicNodeFiles(configs, projectPath) {
  log.verbose('Project File Service - generateBasicNodeFiles()');

  await generateProjectFolders(projectPath);
  await generateIndexFile(projectPath);
  await generatePackageJson(configs, projectPath);
  await generateReadMe(configs, projectPath);
  await generateNodeConfig(configs, projectPath);
}

