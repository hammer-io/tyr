import assert from 'assert';
import fs from 'fs';

import { parseConfigsFromFile } from '../dist/services/project-configuration-service';
import { getActiveLogger } from '../dist/utils/log/winston';

const log = getActiveLogger();

describe('Project Configuration Service', () => {
  describe('parseConfigsFromFile()', () => {
    it('should read configurations without issues', () =>{
      try {
        assert.equal(
          JSON.parse(fs.readFileSync('test/test-configurations/valid-project-configuration')),
          parseConfigsFromFile('test/test-configurations/valid-project-configuration'));
      } catch (error) {

      }
    });

    it('should parse configurations and throw an error when an error occurs', () => {
      try {
        parseConfigsFromFile('test/test-configurations/bad-format-configuration');
      } catch (error) {
        assert.equal(error.message, 'Invalid configuration file format!');
      }
    });
  });
});