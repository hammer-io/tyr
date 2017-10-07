import fs from 'fs';
import constants from '../constants/constants';

export default function initTravisCI(config) {
  console.log('Creating .travis.yml...');

  fs.writeFile(`${config.projectName}/${constants.travisCI.fileName}`, constants.travisCI.fileConents, (err) => {
    if (err) {
      console.log(`${constants.travisCI.error.fileWrite}\n${err.toString()}`);
    }
  });
}