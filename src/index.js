#! /usr/bin/env node

import program from 'commander';

import packagejson from '../package.json';
import * as cli from './cli';

program.usage('[options]')
  .version(packagejson.version)
  .option('--config <file>', 'Configure project from configuration file.')
  .option('--logfile <file>', 'The filepath that logs will be written to.')
  .parse(process.argv);

cli.run(program.config, program.logfile);
