import winston from 'winston';

const shell = require('shelljs');

// eslint-disable-next-line
export function npmInstall (path) {
  winston.log('verbose', 'npmInstall', { directoryPath: path });

  const originalPath = process.cwd();
  shell.cd(path);
  shell.exec('npm install');
  shell.cd(originalPath);
}
