import isValidPath from 'is-valid-path';
import fs from 'fs-extra';

import choices from '../constants/choices';

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
 * Validates the project configuration files
 * @param input the configuraiton file in as a json object
 * @returns {Array} the array of errors
 */
export function validateProjectConfigurations(input) {
  const errors = [];
  if ((typeof input.projectConfigurations === 'undefined') || (typeof input.toolingConfigurations === 'undefined')) {
    errors.push('Invalid configuration file format!');
    return errors; // can't go any farther with a bad format like this
  }

  // validate project name
  if (typeof input.projectConfigurations.projectName === 'undefined') {
    errors.push('Project Name does not exist!');
  } else {
    const validateResult = validateProjectName(input.projectConfigurations.projectName);
    if (validateResult !== true) {
      errors.push(validateResult);
    }
  }

  // validate description
  if (typeof input.projectConfigurations.description === 'undefined') {
    errors.push('Project Description does not exist!');
  }

  // validate version
  if (typeof input.projectConfigurations.version !== 'undefined') {
    const validateResult = validateVersionNumber(input.projectConfigurations.version);
    if (validateResult !== true) {
      errors.push(validateResult);
    }
  }

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

  // if there is invalid CI choice
  if (input.toolingConfigurations.ci &&
    !choices.ciChoices.includes(input.toolingConfigurations.ci)) {
    errors.push(`Invalid CI choice. Valid choices are ${choices.ciChoices}.`);
    // otherwise, if no CI choice was selected, make sure a containerization choice or
    // deployment choice is not selected.
  } else if ((typeof input.toolingConfigurations.ci === 'undefined') || (input.toolingConfigurations.ci === choices.none)) {
    // check to make sure containerization is not used without a CI tool
    if ((typeof input.toolingConfigurations.containerization !== 'undefined') && (input.toolingConfigurations.containerization !== choices.none)) {
      errors.push('If no continuous integration tool was selected, there cannot be a' +
        ' containerization tool selected');
    }

    // check to make sure deployment choice is not used without a CI tool
    if ((typeof input.toolingConfigurations.deployment !== 'undefined') && (input.toolingConfigurations.deployment !== choices.none)) {
      errors.push('If no continuous integration tool was selected, there cannot be a deployment' +
        ' tool selected');
    }
  }

  // if there is an invalid containerization choice
  if (input.toolingConfigurations.containerization &&
    !choices.containerizationChoices.includes(input.toolingConfigurations.containerization)) {
    errors.push(`Invalid container choice. Valid choices are ${choices.containerizationChoices}`);
    // otherwise, if no containerization choice was chosen, make sure there is no deployment choice
  } else if ((typeof input.toolingConfigurations.containerization === 'undefined')
    || (input.toolingConfigurations.containerization === choices.none)) {
    // check to make sure no deployment choice was chosen
    if ((typeof input.toolingConfigurations.deployment !== 'undefined') && (input.toolingConfigurations.deployment !== choices.none)) {
      errors.push('If no containerization tool was selected, there cannot be a deployment tool' +
        ' selected');
    }
  }

  // check to make sure of valid deployment choices
  if (input.toolingConfigurations.deployment &&
    (!choices.deploymentChoices.includes(input.toolingConfigurations.deployment))) {
    errors.push(`Invalid deployment choice. Valid choices are ${choices.deploymentChoices}`);
  }

  // check to make sure there are valid web choices
  if (input.toolingConfigurations.web &&
    !choices.webChoices.includes(input.toolingConfigurations.web)) {
    errors.push(`Invalid web framework choice. Valid choices are ${choices.webChoices}`);
  }

  return errors;
}
