//Sample test
import assert from 'assert';
import fs from 'fs';
import fsExtra from 'fs-extra';

// Tests need to import transpiled files that will be located in dist/ rather than src/
var cli = require('../dist/cli');
import constants from '../dist/constants/constants';

const configs = {
  projectName: 'jack',
  description: 'Jack\'s Test Project',
  version: '0.0.1',
  author: 'Jack Meyer',
  license: 'MIT',
  ci: 'TravisCI',
  container: 'Docker'
};

describe('Init Project', () => {
  describe('#initProject()', () => {
    it('should create a new directory with the project name', () => {


      cli.initProject(configs);
      assert.equal(true, fs.existsSync(configs.projectName));

      // clean up directory that was created
      fsExtra.removeSync(configs.projectName);
    });
  });
});

describe('Init Project', () => {
  describe('#initProject()', () => {
    it('should create a src directory underneath the project directory', () => {
      cli.initProject(configs);
      assert.equal(true, fs.existsSync(configs.projectName + '/src'));

      // clean up directory that was created
      fsExtra.removeSync(configs.projectName);
    });
  });
});

describe('Init Project', () => {
  describe('#initProject()', () => {
    it('should return an error if a directory with the project name already exists', () => {

      cli.initProject(configs);
      var result = cli.initProject(configs); // run initProject again to see if it fails
      assert.equal(constants.config.projectName.error.duplicateMessage, result);

      // clean up directory that was created
      fsExtra.removeSync(configs.projectName);
    });
  });
});

describe('Init Project', () => {
  describe('#initTravisCI()', () => {
    it('should create a .travis.yml file', () => {

      cli.initProject(configs);
      assert.equal(true, fs.existsSync(`${configs.projectName}/.travis.yml`));

      // clean up directory that was created
      fsExtra.removeSync(configs.projectName);
    });
  });
});

describe('Init Project', () => {
  describe('#initTravisCI()', () => {
    it('should create a Dockerfile and .dockerignore', () => {

      cli.initProject(configs);
      assert.equal(true, fs.existsSync(`${configs.projectName}/Dockerfile`));
      assert.equal(true, fs.existsSync(`${configs.projectName}/.dockerignore`));


      // clean up directory that was created
      fsExtra.removeSync(configs.projectName);
    });
  });
});


