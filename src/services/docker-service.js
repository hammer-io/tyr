/* eslint-disable import/prefer-default-export */
import * as file from '../utils/file';
import { getActiveLogger } from '../utils/winston';

const log = getActiveLogger();
/**
 * Generates the files needed for docker support, including dockerignore and Dockerfile
 * @param projectName the project name for the project directory
 * @param filePath the newly created project's file path
 * @returns {Promise<void>}
 */
export async function generateDockerFiles(projectName, filePath) {
  log.verbose('Docker Service - generateDockerFiles()');
  const dockerFilePath = `${filePath}/${projectName}/Dockerfile`;
  const dockerIgnorePath = `${filePath}/${projectName}/.dockerignore`;

  const dockerFileContents = file.loadTemplate('./../../templates/docker/Dockerfile');
  const dockerIgnoreContents = file.loadTemplate('./../../templates/docker/dockerignore');

  file.writeFile(dockerFilePath, dockerFileContents);
  log.info(`Successfully generated file: ${dockerFilePath}`);

  file.writeFile(dockerIgnorePath, dockerIgnoreContents);
  log.info(`Successfully generated file: ${dockerIgnorePath}`);
}
