#! /usr/bin/env node

import program from 'commander';
import run from './cli';

function main(tyrProgram) {
  run(tyrProgram);
}

program.usage('[options]')
  .option('--config <file>', 'configure project from configuration file')
  .parse(process.argv);

main(program);
