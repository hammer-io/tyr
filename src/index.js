#! /usr/bin/env node

import program from 'commander';
import run from './cli';

import packagejson from '../package.json';

function main(tyrProgram) {
  run(tyrProgram);
}

program.usage('[options]')
  .version(packagejson.version)
  .option('--config <file>', 'configure project from configuration file')
  .option('--logfile <file>', 'the filepath that logs will be written to')
  .parse(process.argv);

main(program);
