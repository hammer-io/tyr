import validator from 'email-validator';

/**
 * Determines if a string is blank or not
 * @param value the value to check
 * @returns {boolean} true if blank, false otherwise
 */
function isBlank(value) {
  return (typeof value === 'undefined') || value === '' || value.trim().length < 1;
}

/**
 * Validates a username. A username is valid if it is not blank.
 *
 * @param username The username to validate
 * @returns {*} if not valid, returns the error message; otherwise, returns true
 */
export function validateUsername(username) {
  if (isBlank(username)) {
    return 'Username cannot be blank!';
  }

  return true;
}

/**
 * Validates an email. An email is valid if it is not blank and is a valid email determined by the
 * email validator.
 *
 * @param email the email to validate
 * @returns {*} if not valid, returns the error message; otherwise, returns true
 */
export function validateEmail(email) {
  if (isBlank(email)) {
    return 'Email cannot be blank!';
  } else if (!validator.validate(email)) {
    return 'Email must be a valid email!';
  }

  return true;
}

/**
 * Validates a password. A password is valid if it is not blank.
 * @param password the password to validate
 * @returns {*} if not valid, returns the error message; otherwise, returns true
 */
export function validatePassword(password) {
  if (isBlank(password)) {
    return 'Password cannot be blank!';
  }

  return true;
}

/**
 * Validates an api key. API Key is invalid if it is blank.
 * @param key the api key to validate
 * @returns {*} the error message if invalid; otherwise, true
 */
export function validateApiKey(key) {
  if (isBlank(key)) {
    return 'API Key cannot be blank!';
  }

  return true;
}
