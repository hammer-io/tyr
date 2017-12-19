import assert from 'assert';

import { parseConfigsFromFile } from '../dist/services/project-configuration-service';
import { getActiveLogger } from '../dist/utils/log/winston';

const log = getActiveLogger();

describe('Project Configuration Service', () => {
  describe('Read from Configuration File', () => {
    it('should parse configurations without issues', () =>{

    });

    it('should parse configurations and throw an error when an error occurrs', () => {
      try {
        parseConfigsFromFile('test/test-configurations/bad-format-configuration');
      } catch (error) {
        log.error(error.message);
      }

    });
  });
});