/* eslint-disable import/prefer-default-export */
import * as file from '../utils/file';
import { getActiveLogger } from '../utils/winston';

const log = getActiveLogger();
/**
 * Generates the files needed for docker support, including dockerignore and Dockerfile
 * @param projectPath the newly created project's file path
 * @returns {Promise<void>}
 */
export async function generateDockerFiles(projectPath) {
  log.verbose('Docker Service - generateDockerFiles()');
  const dockerFilePath = `${projectPath}/Dockerfile`;
  const dockerIgnorePath = `${projectPath}/.dockerignore`;

  const dockerFileContents = file.loadTemplate('./../../templates/docker/Dockerfile');
  const dockerIgnoreContents = file.loadTemplate('./../../templates/docker/dockerignore');

  file.writeFile(dockerFilePath, dockerFileContents);
  log.info(`Successfully generated file: ${dockerFilePath}`);

  file.writeFile(dockerIgnorePath, dockerIgnoreContents);
  log.info(`Successfully generated file: ${dockerIgnorePath}`);
}
