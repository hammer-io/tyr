import winston from 'winston';
import {
  loadTemplate,
  writeFile
} from './file';

import constants from '../constants/constants';

/**
 * Creates a mocha test suite from the template file with one sample test that always returns true
 * @param filePath - the name of the project folder
 */
// eslint-disable-next-line
export function createMochaTestSuite(filePath){
  winston.log('verbose', 'createMochaTestSuite', { filePath });

  writeFile(
    `${filePath}/${constants.mocha.fileName}`,
    loadTemplate('./../../templates/mocha/test.js')
  );
}
