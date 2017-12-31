import shell from 'shelljs';

import { getActiveLogger } from './../utils/log/winston';

const log = getActiveLogger();

/**
 * Uses the shell to create call npm install to install the dependencies of the project.
 * This method creates a sub-process and can cause concurrency issues. After the npm install
 * is executed, the working directory returns to it's original state so as to not confuse
 * other parts of the program.
 *
 * @param path - String of the path to the new project directory where we need to call npm install
 */
// eslint-disable-next-line
export function npmInstall(path) {
  log.verbose('Node Service - npmInstall()');
  log.warn('Please wait while we install your NPM packages...');

  const originalPath = process.cwd();
  shell.cd(path);
  shell.exec('npm install');
  shell.cd(originalPath);

  log.info('Successfully installed your NPM packages');
}
