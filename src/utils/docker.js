import fs from 'fs';

import constants from '../constants/constants'

/**
 * Generate the required Docker files
 */
// eslint-disable-next-line
export function initDocker(config) {
  fs.writeFileSync(
    `${config.projectName}/${constants.docker.dockerFile.fileName}`,
    constants.docker.dockerFile.fileContents
  );

  fs.writeFileSync(
    `${config.projectName}/${constants.docker.dockerIgnore.fileName}`,
    constants.docker.dockerIgnore.fileContents
  );
}
