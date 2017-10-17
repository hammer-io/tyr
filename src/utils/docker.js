import winston from 'winston';

import constants from '../constants/constants';
import {
  loadTemplate,
  writeFile
} from './file';


/**
 * Generate the required Docker files
 *
 * @param config
 */
// eslint-disable-next-line
export function initDocker(config) {
  winston.log('verbose', 'initDocker');

  writeFile(
    `${config.projectName}/${constants.docker.dockerFile.fileName}`,
    loadTemplate('./../../templates/docker/Dockerfile')
  );

  writeFile(
    `${config.projectName}/${constants.docker.dockerIgnore.fileName}`,
    loadTemplate('./../../templates/docker/.dockerignore')
  );
}
