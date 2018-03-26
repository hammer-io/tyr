import assert from 'assert';
import fs from 'fs';
import {validateProjectConfigurations, validateProjectName, validateVersionNumber, validateLicense} from '../dist/utils/project-configuration-validator';
import choices from '../dist/constants/choices';

describe('Project Configuration Validator', () => {
  describe('validateProjectConfigurations()', () => {
    it('should validate configuration file without errors', () => {
      const errors = validateProjectConfigurations(JSON.parse(fs.readFileSync('test/test-configurations/valid-project-configuration', 'utf-8')));
      assert.equal(errors.length, 0);
    });

    it('should validate configuration file with errors because of an invalid format', () => {
      const errors = validateProjectConfigurations(JSON.parse(fs.readFileSync('test/test-configurations/bad-format-configuration', 'utf-8')));
      assert.equal(errors.length, 1);
      assert.equal(errors[0], 'Invalid configuration file format!');
    });

    it('should validate configuration file with errors because of missing project' +
      ' configurations', () =>{
      const errors = validateProjectConfigurations(JSON.parse(fs.readFileSync('test/test-configurations/bad-project-configuration')));
      assert.equal(errors.length, 3);
      assert.equal(errors[0], 'Project Name does not exist!');
      assert.equal(errors[1], 'Project Description does not exist!');
      assert.equal(errors[2], 'Private Project Flag does not exist!');
    });

    it('should validate configuration file with errors because of invalid project name', () => {
      const input = JSON.parse(fs.readFileSync('test/test-configurations/invalid-project-name', 'utf-8'));
      const errors = validateProjectConfigurations(input);
      assert.equal(errors.length, 1);
      assert.equal(errors[0], 'Invalid project name!');
    });

    it('validate configuration file with errors because of invalid version number', () => {
      const input = JSON.parse(fs.readFileSync('test/test-configurations/invalid-version-number', 'utf-8'));
      const errors = validateProjectConfigurations(input);
      assert.equal(errors.length, 1);
      assert.equal(errors[0], 'Invalid version number!');
    });

    it('validate configuration file with errors because of invalid license', () => {
      const input = JSON.parse(fs.readFileSync('test/test-configurations/invalid-license', 'utf-8'));
      const errors = validateProjectConfigurations(input);
      assert.equal(errors.length, 1);
      assert.equal(errors[0], 'License must be a valid SPDX License!');
    });

    it('should validate configuration file with errors because of bad tool names', () => {
      const input = JSON.parse(fs.readFileSync('test/test-configurations/bad-tooling-names'));
      const errors = validateProjectConfigurations(input);
      assert.equal(errors.length, 5);
      assert.equal(errors[0], `Invalid source control choice. Valid choices are ${choices.sourceControlChoices}.`);
      assert.equal(errors[1], `Invalid CI choice. Valid choices are ${choices.ciChoices}.`);
      assert.equal(errors[2], `Invalid container choice. Valid choices are ${choices.containerizationChoices}`);
      assert.equal(errors[3], `Invalid deployment choice. Valid choices are ${choices.deploymentChoices}`);
      assert.equal(errors[4], `Invalid web framework choice. Valid choices are ${choices.webChoices}`);

    });

    it('should validate configuration file with errors because of bad tooling configurations' +
      ' because of no source control', () => {
      const input = JSON.parse(fs.readFileSync('test/test-configurations/no-source-control-invalid', 'utf-8'));
      const errors = validateProjectConfigurations(input);
      assert.equal(errors.length, 3);
      assert.equal(errors[0], 'If no source control tool was selected, there cannot be a CI tool' +
        ' selected.');
      assert.equal(errors[1], 'If no source control tool was selected, there cannot be a containerization' +
        ' tool selected. ');
      assert.equal(errors[2], 'If no source control tool was selected, there cannot be a deployment tool' +
        ' selected');
    });

    it('should validate configuration file with errors because of bad tooling configurations' +
      ' because of no continuous integration (undefined)', () => {
      const input = JSON.parse(fs.readFileSync('test/test-configurations/no-ci-invalid', 'utf-8'));
      const errors = validateProjectConfigurations(input);
      assert.equal(errors.length, 2);
      assert.equal(errors[0], 'If no continuous integration tool was selected, there cannot be a' +
        ' containerization tool selected');
      assert.equal(errors[1], 'If no continuous integration tool was selected, there cannot be a' +
        ' deployment tool selected')
    });

    it('should validate configuration file with errors because of bad tooling configurations' +
      ' because of no containerization (undefined)', () => {
      const input = JSON.parse(fs.readFileSync('test/test-configurations/no-containerization-invalid', 'utf-8'));
      const errors = validateProjectConfigurations(input);
      assert.equal(errors.length, 1);
      assert.equal(errors[0], 'If no containerization tool was selected, there cannot be a deployment tool' +
        ' selected')
    });


    it('should validate configuration with errors because of bad tooling configurations' +
      ' because of no continuous integration (<None>)', () => {
      const input = JSON.parse(fs.readFileSync('test/test-configurations/no-ci-none-invalid', 'utf-8'));
      const errors = validateProjectConfigurations(input);
      assert.equal(errors.length, 2);
      assert.equal(errors[0], 'If no continuous integration tool was selected, there cannot be a' +
        ' containerization tool selected')
      assert.equal(errors[1], 'If no continuous integration tool was selected, there cannot be a' +
        ' deployment tool selected')
    });

    it('should validate configuration file with errors because of bad tooling configurations' +
      ' because of no containerization (<None>)', () => {
      const input = JSON.parse(fs.readFileSync('test/test-configurations/no-containerization-none-invalid', 'utf-8'));
      const errors = validateProjectConfigurations(input);
      assert.equal(errors.length, 1);
      assert.equal(errors[0], 'If no containerization tool was selected, there cannot be a deployment tool' +
        ' selected')
    });

    it('should validate configuration file with errors because of a bad web framework choice', () => {
      const input = JSON.parse(fs.readFileSync('test/test-configurations/invalid-web-framework-choice-configuration', 'utf-8'));
      const errors = validateProjectConfigurations(input);
      assert.equal(errors.length, 1);
      assert.equal(errors[0], `Invalid web framework choice. Valid choices are <None>,ExpressJS`)
    });

    it('should validate configuration file with errors because of a bad test framework choice', () => {
      const input = JSON.parse(fs.readFileSync('test/test-configurations/invalid-test-choice-configuration', 'utf-8'));
      const errors = validateProjectConfigurations(input);
      assert.equal(errors.length, 1);
      assert.equal(errors[0], `Invalid test framework choice. Valid choices are <None>,Mocha`)
    });

    it('should validate configuration file with errors because of a bad orm framework choice', () => {
      const input = JSON.parse(fs.readFileSync('test/test-configurations/invalid-orm-choice-configuration', 'utf-8'));
      const errors = validateProjectConfigurations(input);
      assert.equal(errors.length, 1);
      assert.equal(errors[0], `Invalid orm choice. Valid choices are <None>,Sequelize`)
    });
  });

  describe('validateProjectName()', () => {
    it('should properly validate project names', () => {
      assert.equal(validateProjectName('good-name'), true);
      assert.equal(validateProjectName('test'), 'Project with this name already exists in this' +
        ' directory!');
      assert.equal(validateProjectName('**baddname'), 'Invalid project name!');
      assert.equal(validateProjectName(), 'Invalid project name!');
      assert.equal(validateProjectName('thisisaverylongnamethatisovertwentycharacterslong'), 'Project Names must be less than 20 characters or less!');
      assert.equal(validateProjectName("test1/"), 'Invalid project name!')
    });

  });

  describe('validateVersionNumber()', () => {
    it('should properly validate project versions', () => {
      assert.equal(validateVersionNumber('0.0.0'), true);
      assert.equal(validateVersionNumber('1.1.fdafda'), true);
      assert.equal(validateVersionNumber('fdafda.1'), 'Invalid version number!');
    });
  });

  describe('validateLicense()', () => {
    it('should properly validate license names', () => {
      assert.equal(validateLicense('MIT'), true);
      assert.equal(validateLicense('badlicense'), 'License must be a valid SPDX License!');
      assert.equal(validateLicense(''), true);
    })
  });
});