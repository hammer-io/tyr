import winston from 'winston';
import fs from 'fs';
import path from 'path';

import constants from '../constants/constants';

function loadTemplate(filepath) {
  return fs.readFileSync(path.join(__dirname, '/', filepath), 'utf-8');
}


/**
 * Creates a mocha test suite from the template file with one sample test that always returns true
 * @param filePath - the name of the project folder
 */
// eslint-disable-next-line
export function createMochaTestSuite(filePath){
  winston.log('verbose', 'createMochaTestSuite', { filePath });

  try {
    fs.writeFileSync(
      `${filePath}/${constants.mocha.fileName}`,
      loadTemplate('./../../templates/mocha/test.js')
    );
  } catch (e) {
    winston.log('error', constants.mocha.error.fileWrite, e);
  }
}
