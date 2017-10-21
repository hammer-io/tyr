import assert from 'assert';
import fs from 'fs-extra';
import path from 'path';

const credentialsFilename = 'github-test-credentials.txt';

const configs = {
  username: '',
  password: '',
  projectName: '',
  description: ''
};

/**
 * Load credentials from a file
 */
function loadCredentials(filepath) {
  const contents = fs.readFileSync(path.join(__dirname, '/', filepath), 'utf-8').split('\n');
  if (!contents) {
    throw new Error(`Failed to read file: ${filepath}`);
  }
  contents.forEach((line) => {
    line = line.trim();
    if (line !== '' && !line.startsWith('#')) {
      const keyValue = line.split('=');
      configs[keyValue[0]] = keyValue[1];
    }
  });
}

describe('GitHub API:', () => {
  describe('When some condition is met:', () => {
    before(() => {
      loadCredentials(credentialsFilename);
      assert.notEqual(configs.username, '',
        `The credentials file '${credentialsFilename}' needs to be filled in with a valid username!`);
      assert.notEqual(configs.password, '',
        `The credentials file '${credentialsFilename}' needs to be filled in with a valid password!`);
    });

    it('should exhibit some behavior', () => {
      // TODO
    });

  });
});
