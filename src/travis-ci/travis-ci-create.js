import fs from 'fs';

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

  fs.writeFile(`${config.projectName}/.travis.yml`, travisCIFileContents, (err) => {
    if (err) {
      console.log(`ERROR: Failed to write .travis.yml file\n${err.toString()}`);
    }
  });
}