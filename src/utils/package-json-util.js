/* eslint-disable import/prefer-default-export */
import * as file from './file';
import * as jsonUtil from '../utils/json-util';

function addToPackageJsonFile(projectPath, dependencyName, dependencyVersion, location) {
  let projectPackageJson = file.readFile(`${projectPath}/package.json`);
  projectPackageJson = JSON.parse(projectPackageJson);
  projectPackageJson[location][dependencyName] = dependencyVersion;
  projectPackageJson = jsonUtil.stringify(projectPackageJson);

  file.deleteFile(`${projectPath}/package.json`);
  file.writeFile(`${projectPath}/package.json`, projectPackageJson);
}

export function addScriptToPackageJsonFile(projectPath, scriptName, scriptValue) {
  let projectPackageJson = file.readFile(`${projectPath}/package.json`);
  projectPackageJson = JSON.parse(projectPackageJson);
  projectPackageJson.scripts[scriptName] = scriptValue;
  projectPackageJson = jsonUtil.stringify(projectPackageJson);

  file.deleteFile(`${projectPath}/package.json`);
  file.writeFile(`${projectPath}/package.json`, projectPackageJson);
}

/**
 *
 * @param projectPath The path of the project
 * @param dependencyName the name of the dependency being added
 * @param dependencyVersion the version of the dependency being added
 */
export function addDependencyToPackageJsonFile(
  projectPath,
  dependencyName,
  dependencyVersion
) {
  addToPackageJsonFile(projectPath, dependencyName, dependencyVersion, 'dependencies');
}

export function addDevDependencyToPackageJsonFile(
  projectPath,
  dependencyName,
  dependencyVersion
) {
  addToPackageJsonFile(projectPath, dependencyName, dependencyVersion, 'devDependencies');
}
