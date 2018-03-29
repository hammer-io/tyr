/* eslint-disable import/prefer-default-export */
/**
 * Converts a json object to a string in a human readable format (indents and newlines)
 * @param contents the json object
 * @returns {string} the json in a string
 */
export function stringify(json) {
  return JSON.stringify(json, null, ' ');
}
