/* eslint-disable import/prefer-default-export */
import * as file from './../utils/files/file';

/**
 * Generates the files needed for docker support, including dockerignore and Dockerfile
 * @param projectName the project name for the project directory
 * @returns {Promise<void>}
 */
export async function generateDockerFiles(projectName) {
  const dockerFilePath = `${projectName}/Dockerfile`;
  const dockerIgnorePath = `${projectName}/.dockerignore`;

  const dockerFileContents = file.loadTemplate('./../../../templates/docker/Dockerfile');
  const dockerIgnoreContents = file.loadTemplate('./../../../templates/docker/dockerignore');

  file.writeFile(dockerFilePath, dockerFileContents);
  file.writeFile(dockerIgnorePath, dockerIgnoreContents);
}
