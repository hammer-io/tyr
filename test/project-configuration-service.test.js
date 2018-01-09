import assert from 'assert';
import fs from 'fs';

import { parseConfigsFromFile } from '../dist/services/project-configuration-service';

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

    it('should remove <None> from any tooling choice and remove the key it belongs to', () => {

      const configs  = parseConfigsFromFile('test/test-configurations/.tyrfile');
      assert.equal('test-project', configs.projectConfigurations.projectName);
      assert.equal('test-project', configs.projectConfigurations.description);
      assert.equal('0.0.0', configs.projectConfigurations.version);
      assert.equal('test', configs.projectConfigurations.author);
      assert.equal('MIT', configs.projectConfigurations.license);
      assert.equal(0, Object.keys(configs.toolingConfigurations).length);
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