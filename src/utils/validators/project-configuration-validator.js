import isValidPath from 'is-valid-path'
import fs from 'fs-extra';


/**
* Validate project name
* @param value the project name to test
* @returns string if the project name is valid, the error message otherwise
*/
export function validateProjectName(value) {
  // a project name is a project name for which the folder does not exist,
  // for which the name is no blank/undefined or contains spaces

  if (typeof value === 'undefined' || value === ''
    || value.indexOf(' ') !== -1 || !isValidPath(value)) {
    return 'Invalid project name!';
  }

  if (fs.existsSync(value)) {
    return 'Project with this name already exists in this directory!';
  }

  return true;
}

/**
 * Validates version numbers. Version numbers must follow the format (number) (.number)*.
 * @param value the version number to test
 * @returns true, if the version is valid, the error message otherwise
 */
export function validateVersionNumber(value) {
  if (/^(\d+\.)?(\d+\.)?(\*|\d+)/.test(value)) {
    return true;
  }

  return 'Invalid version number!';
}
