/* eslint-disable import/prefer-default-export */
import * as file from '../utils/file';
import { getActiveLogger } from '../utils/winston';

const log = getActiveLogger();
/**
 * Generate the files needed for supporting the express framework. This includes the index.html
 * file, the index.js file, and the routes.js file. It also updates the package.json file by
 * adding express as a dependency.
 * @returns {Promise<void>}
 */
export async function generateExpressFiles(projectPath) {
  log.verbose('Express Service - generateExpressFiles()');
  const path = `${projectPath}/src`;

  // generate the index.html file
  const indexHTMLContents = file.loadTemplate('./../../templates/express/index.html');
  file.writeFile(`${path}/index.html`, indexHTMLContents);
  log.info(`Successfully generated file: ${path}/index.html`);

  // generate the index.js file
  const indexJSContents = file.loadTemplate('./../../templates/express/index.js');
  file.writeFile(`${path}/index.js`, indexJSContents);
  log.info(`Successfully generated file: ${path}/index.js`);

  // generate the routes.js file
  const routesJSContents = file.loadTemplate('./../../templates/express/routes.js');
  file.writeFile(`${path}/routes.js`, routesJSContents);
  log.info(`Successfully generated file: ${path}/routes.js`);

  // add express.js as a dependency to the package.json
  let projectPackageJson = file.readFile(`${projectPath}/package.json`);
  projectPackageJson = JSON.parse(projectPackageJson);
  projectPackageJson.dependencies.express = '^4.16.0';
  projectPackageJson = JSON.stringify(projectPackageJson, null, ' ');

  file.deleteFile(`${projectPath}/package.json`);
  file.writeFile(`${projectPath}/package.json`, projectPackageJson);
}
