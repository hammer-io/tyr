import fs from 'fs';
import path from 'path';

/**
 * Load template file.  IF an error is thrown, it will be caught, logged, then thrown again.
 * The given errMsg should be a constant.
 *
 * @param filePath
 * @returns {*}
 */
export function loadTemplate(filePath) {
  try {
    return fs.readFileSync(path.join(__dirname, '/', filePath), 'utf-8');
  } catch (e) {
    throw new Error(`Failed to read template ${filePath}!`);
  }
}

/**
 * Write to the given filePath with the contents of a file.  The given errMsg should be a constant.
 *
 * @param filePath
 * @param fileContents
 * @returns {*}
 */
export function writeFile(filePath, fileContents) {
  try {
    return fs.writeFileSync(filePath, fileContents);
  } catch (e) {
    throw new Error(`Failed to write ${filePath}!`);
  }
}
