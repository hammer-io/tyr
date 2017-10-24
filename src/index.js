#! /usr/bin/env node

import program from 'commander';
import run from './cli';

function main(tyrProgram) {
  run(tyrProgram);
}

program.usage('[options]')
  .option('--config <file>', 'Configure project from configuration file')
  .option('--logfile <file>', 'The filepath that logs will be written to')
  .parse(process.argv);

main(program);
