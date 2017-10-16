import winston from 'winston';

const shell = require('shelljs');

// eslint-disable-next-line
export function npmInstall (path) {
  winston.log('verbose', 'npmInstall', { directoryPath: path });

  shell.cd(path);
  shell.exec('npm install');
}
