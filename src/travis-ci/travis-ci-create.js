import fs from 'fs';
import constants from '../constants/constants';

const travisCIFileContents = '' +
    'language: node_js\n' +
    'node_js:\n' +
    '  - \'5\'\n' +
    '\n' +
    'notifications:\n' +
    '  email:\n' +
    '    on_success: never';

export default function initTravisCI(config) {
  console.log('Creating .travis.yml...');

  fs.writeFile(`${config.projectName}/${constants.travisCI.fileName}`, travisCIFileContents, (err) => {
    if (err) {
      console.log(`${constants.travisCI.error.fileWrite}\n${err.toString()}`);
    }
  });
}