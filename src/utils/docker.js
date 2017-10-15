import fs from 'fs';
import path from 'path'

import constants from '../constants/constants'

/**
 * Load template file
 */
function loadTemplate(filepath) {
  return fs.readFileSync(path.join(__dirname, '/', filepath), 'utf-8');
}

/**
 * Generate the required Docker files
 */
// eslint-disable-next-line
export function initDocker(config) {
  fs.writeFileSync(
    `${config.projectName}/${constants.docker.dockerFile.fileName}`,
    loadTemplate('./../../templates/docker/Dockerfile')
  );

  fs.writeFileSync(
    `${config.projectName}/${constants.docker.dockerIgnore.fileName}`,
    loadTemplate('./../../templates/docker/.dockerignore')
  );
}
