import isValidPath from 'is-valid-path';
import fs from 'fs-extra';
import spdx from 'spdx';

import choices from '../constants/choices';

/**
 * Validates the format of the configurations
 * @param input the input configuration
 * @param errors the errors
 * @returns {*}
 */
function validateFormat(input, errors) {
  if ((typeof input.projectConfigurations === 'undefined') ||
    (typeof input.toolingConfigurations === 'undefined')) {
    errors.push('Invalid configuration file format!');
  }
}

/**
 * Validate project name
 * @param value the project name to test
 * @returns string if the project name is valid, the error message otherwise
 */
export function validateProjectName(value) {
  // a project name is a project name for which the folder does not exist,
  // for which the name is no blank/undefined or contains spaces

  if (typeof value === 'undefined' || value === ''
    || value.indexOf(' ') !== -1 || !isValidPath(value) || value.indexOf('/') > -1) {
    return 'Invalid project name!';
  }

  if (value.length > 20) {
    return 'Project Names must be less than 20 characters or less!';
  }

  if (fs.existsSync(value)) {
    return 'Project with this name already exists in this directory!';
  }

  return true;
}

/**
 * Validates the project name and adds it to the errors.
 * @param input the input configuration
 * @param errors the errors
 */
function validateName(input, errors) {
  // validate project name
  if (typeof input.projectConfigurations.projectName === 'undefined') {
    errors.push('Project Name does not exist!');
  } else {
    const validateResult = validateProjectName(input.projectConfigurations.projectName);
    if (validateResult !== true) {
      errors.push(validateResult);
    }
  }
}

/**
 * Validate description. Must exist
 * @param input the input configuration
 * @param errors the errors
 */
function validateDescription(input, errors) {
  if (typeof input.projectConfigurations.description === 'undefined') {
    errors.push('Project Description does not exist!');
  }
}

/**
 * Validate is project project. Must be a boolean. Must exist.
 * @param input the input configuration
 * @param errors the errors
 */
function validateIsPrivateProject(input, errors) {
  // validate isPrivateProject
  if (typeof input.projectConfigurations.isPrivateProject === 'undefined') {
    errors.push('Private Project Flag does not exist!');
  } else if (typeof input.projectConfigurations.isPrivateProject !== 'boolean') {
    errors.push('Private Project Flag must be a boolean value!');
  }
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

/**
 * Validate verison number
 * @param input the input configuration
 * @param errors the errors
 */
function validateVersion(input, errors) {
  if (typeof input.projectConfigurations.version !== 'undefined') {
    const validateResult = validateVersionNumber(input.projectConfigurations.version);
    if (validateResult !== true) {
      errors.push(validateResult);
    }
  }
}

/**
 * Validates a license. A license is valid if it is blank or conforms to SPDX validations.
 * @param value the license to validate
 * @returns {*} true if valid, the error message otherwise
 */
export function validateLicense(value) {
  // we'll allow for blank license
  if ((typeof value === 'undefined') || value === '' || value.trim().length < 1) {
    return true;
  }

  if (spdx.valid(value)) {
    return true;
  }

  return 'License must be a valid SPDX License!';
}

/**
 * Valiates the project license
 * @param input the input configuration
 * @param errors the errors
 */
function validateProjectLicense(input, errors) {
  // validate license
  const validateLicenseResult = validateLicense(input.projectConfigurations.license);
  if (validateLicenseResult !== true) {
    errors.push(validateLicenseResult);
  }
}

/**
 * Validate source control tool. Must be valid choice. Make sure no CI Tool, Containerization Tool,
 * or deployment tool was selected.
 * @param input the input configuration
 * @param errors the errors
 */
function validateSourceControlTool(input, errors) {
  // if there is an invalid source control choice
  if (input.toolingConfigurations.sourceControl &&
    (!choices.sourceControlChoices.includes(input.toolingConfigurations.sourceControl))) {
    errors.push(`Invalid source control choice. Valid choices are ${choices.sourceControlChoices}.`);

    // otherwise, if the a source control was not chosen (either because of <None> or it's
    // undefined, check if other CI, container, or deployment choices are being used. If they
    // are, throw an error because we cannot use these tools with out a source control
  } else if ((typeof input.toolingConfigurations.sourceControl === 'undefined')
    || (input.toolingConfigurations.sourceControl === choices.none)) {
    // check to make sure no CI is being used without source control
    if ((typeof input.toolingConfigurations.ci !== 'undefined') && (input.toolingConfigurations.ci !== choices.none)) {
      errors.push('If no source control tool was selected, there cannot be a CI tool selected.');
    }

    // check to make sure no containerization tool is being used without source control
    if ((typeof input.toolingConfigurations.containerization !== 'undefined') && (input.toolingConfigurations.containerization !== choices.none)) {
      errors.push('If no source control tool was selected, there cannot be a containerization' +
        ' tool selected. ');
    }

    // check to make sure deployment tool is not being used without source control
    if ((typeof input.toolingConfigurations.deployment !== 'undefined') && (input.toolingConfigurations.deployment !== choices.none)) {
      errors.push('If no source control tool was selected, there cannot be a deployment tool' +
        ' selected');
    }
  }
}

/**
 * Validate CI tool. Must be a valid choice. Make sure no deployment tool was selected. Make sure
 * no containerization tool was selected.
 * @param input the input configuration
 * @param errors the errors
 */
function validateCITool(input, errors) {
  // if there is invalid CI choice
  if (input.toolingConfigurations.ci &&
    !choices.ciChoices.includes(input.toolingConfigurations.ci)) {
    errors.push(`Invalid CI choice. Valid choices are ${choices.ciChoices}.`);
    // otherwise, if no CI choice was selected, make sure a containerization choice or
    // deployment choice is not selected.
  } else if ((typeof input.toolingConfigurations.ci === 'undefined') ||
      (input.toolingConfigurations.ci === choices.none)) {
    // check to make sure containerization is not used without a CI tool
    if ((typeof input.toolingConfigurations.containerization !== 'undefined') &&
        (input.toolingConfigurations.containerization !== choices.none)) {
      errors.push('If no continuous integration tool was selected, there cannot be a' +
        ' containerization tool selected');
    }

    // check to make sure deployment choice is not used without a CI tool
    if ((typeof input.toolingConfigurations.deployment !== 'undefined') &&
        (input.toolingConfigurations.deployment !== choices.none)) {
      errors.push('If no continuous integration tool was selected, there cannot be a deployment' +
        ' tool selected');
    }
  }
}

/**
 * Validate containerization tool. Must be a valid choice. Make sure no deployment tool was selected
 * @param input the input configuration
 * @param errors the errors
 */
function validateContainerizationTool(input, errors) {
  // if there is an invalid containerization choice
  if (input.toolingConfigurations.containerization &&
    !choices.containerizationChoices.includes(input.toolingConfigurations.containerization)) {
    errors.push(`Invalid container choice. Valid choices are ${choices.containerizationChoices}`);
    // otherwise, if no containerization choice was chosen, make sure there is no deployment choice
  } else if ((typeof input.toolingConfigurations.containerization === 'undefined')
    || (input.toolingConfigurations.containerization === choices.none)) {
    // check to make sure no deployment choice was chosen
    if ((typeof input.toolingConfigurations.deployment !== 'undefined') &&
        (input.toolingConfigurations.deployment !== choices.none)) {
      errors.push('If no containerization tool was selected, there cannot be a deployment tool' +
        ' selected');
    }
  }
}

/**
 * Validate deployment tool. Must be a valid choice.
 * @param input the input configuration
 * @param errors the errors
 */
function validateDeploymentTool(input, errors) {
  // check to make sure of valid deployment choices
  if (input.toolingConfigurations.deployment &&
    (!choices.deploymentChoices.includes(input.toolingConfigurations.deployment))) {
    errors.push(`Invalid deployment choice. Valid choices are ${choices.deploymentChoices}`);
  }
}

/**
 * Validate web frameworks. Must be a valid choice.
 * @param input the input configuration
 * @param errors the errors
 */
function validateWebFrameworks(input, errors) {
  // check to make sure there are valid web choices
  if (input.toolingConfigurations.web &&
    !choices.webChoices.includes(input.toolingConfigurations.web)) {
    errors.push(`Invalid web framework choice. Valid choices are ${choices.webChoices}`);
  }
}

/**
 * Validates test frameworks. Must be a valid choice.
 * @param input the input configuration
 * @param errors the errors
 */
function validateTestFrameworks(input, errors) {
  // check to make sure there are valid test choices
  if (input.toolingConfigurations.test &&
    (!choices.testChoices.includes(input.toolingConfigurations.test))) {
    errors.push(`Invalid test framework choice. Valid choices are ${choices.testChoices}`);
  }
}

/**
 * Validates orm frameworks. Must be a valid choice.
 * @param input the input configuration
 * @param errors the errors
 */
function validateORMFrameworks(input, errors) {
  // check to make sure there are valid orm framework choices
  if (input.toolingConfigurations.orm &&
    (!choices.ormChoices.includes(input.toolingConfigurations.orm))) {
    errors.push(`Invalid orm choice. Valid choices are ${choices.ormChoices}`);
  }
}

/**
 * Validates the project configuration files
 * @param input the configuraiton file in as a json object
 * @returns {Array} the array of errors
 */
export function validateProjectConfigurations(input) {
  const errors = [];
  validateFormat(input, errors);
  if (errors.length > 0) {
    return errors; // stop right here. Can't go further with bad format.
  }

  validateName(input, errors);
  validateDescription(input, errors);
  validateIsPrivateProject(input, errors);
  validateVersion(input, errors);
  validateProjectLicense(input, errors);
  validateSourceControlTool(input, errors);
  validateCITool(input, errors);
  validateContainerizationTool(input, errors);
  validateDeploymentTool(input, errors);
  validateWebFrameworks(input, errors);
  validateTestFrameworks(input, errors);
  validateORMFrameworks(input, errors);

  return errors;
}
