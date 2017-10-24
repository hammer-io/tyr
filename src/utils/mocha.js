import {
  loadTemplate,
  writeFile
} from './file';
import { getActiveLogger } from '../utils/winston';
import constants from '../constants/constants';

const log = getActiveLogger();

/**
 * Creates a mocha test suite from the template file with one sample test that always returns true
 * @param filePath - the name of the project folder
 */
// eslint-disable-next-line
export function createMochaTestSuite(filePath){
  log.verbose('creating mocha test suite', { filePath });

  writeFile(
    `${filePath}/${constants.mocha.fileName}`,
    loadTemplate('./../../templates/mocha/test.js')
  );
}
