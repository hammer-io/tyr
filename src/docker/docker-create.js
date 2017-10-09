import fs from 'fs';

import constants from '../constants/constants'

export default function initDocker(config) {
  fs.writeFileSync(`${config.projectName}/${constants.docker.dockerFile.fileName}`,
    constants.docker.dockerFile.fileContents, (err) => {
    if (err) {
      console.log(`${constants.docker.dockerFile.error.fileWrite}\n${err.toString()}`);
    }
  });

  fs.writeFileSync(`${config.projectName}/${constants.docker.dockerIgnore.fileName}`,
    constants.docker.dockerIgnore.fileContents, (err) => {
    if (err) {
      console.log(`${constants.docker.dockerIgnore.error.fileWrite}\n${err.toString()}`);
    }
  });
}
