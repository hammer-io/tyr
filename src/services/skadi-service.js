/* eslint-disable import/prefer-default-export */
import * as jsonUtil from '../utils/json-util';
import * as packageJsonUtil from '../utils/package-json-util';
import * as file from '../utils/file';
import { getActiveLogger } from '../utils/winston';

const log = getActiveLogger();

function generateSkadiConfigFile(configs, projectPath) {
  log.verbose('Skadi Service - generateSkadiConfigFile()');

  if (configs.skadi) {
    file.writeFile(`${projectPath}/.skadiconfig.json`, jsonUtil.stringify(configs.skadi));
    log.info(`Successfully generated file: ${projectPath}/.skadiconfig.json`);
  } else {
    throw new Error('Configurations for Skadi not found.');
  }
}

/**
 * Removes existing index js file for express and replaces it with the express with skadi index.js
 * file
 * @param configs the project configurations
 * @param projectPath the path to the project
 */
function generateIndexJsFile(configs, projectPath) {
  let indexJsContents = file.readFile(`${projectPath}/src/index.js`);

  // insert skadi import at top
  const skadiImport = 'const skadi = require(\'skadi-hammerio\');\n';
  indexJsContents = skadiImport + indexJsContents;

  // insert heartbeat and os data config and request capture
  const insert1 =
    '\nskadi.heartbeat();\n' +
    'skadi.osdata();\n' +
    '\n' +
    'app.use((req, res, next) => {\n' +
    '  skadi.captureRequestData(req);\n' +
    '  next();\n' +
    '});\n';


  const toSplitOn1 = 'const app = express();\n';
  const split1 = indexJsContents.split('const app = express();\n');
  indexJsContents = split1[0] + toSplitOn1 + insert1 + split1[1];

  // insert the response capture
  const toSplitOn2 = '// routes\napp.use(\'/\', routes);\n';
  const split2 = indexJsContents.split(toSplitOn2);
  const insert2 = '\napp.use((req, res, next) => {\n' +
    '  skadi.captureResponseData(req, res);\n' +
    '});\n';

  indexJsContents = split2[0] + toSplitOn2 + insert2 + split2[1];
  file.deleteFile(`${projectPath}/src/index.js`);
  file.writeFile(`${projectPath}/src/index.js`, indexJsContents);
}

/**
 * Creates the static files needed for the skadi library
 * @param configs the configurations
 * @param projectPath the project path
 * @returns {Promise<void>}
 */
export async function generateSkadiFiles(configs, projectPath) {
  // create .skadiconfig.json file
  generateSkadiConfigFile(configs, projectPath);

  // add skadi to the package.json file
  packageJsonUtil.addDependencyToPackageJsonFile(projectPath, 'skadi-hammerio', '^0.0.1');

  // create express index.js file with calls to skadi inside of it
  generateIndexJsFile(configs, projectPath);
}

