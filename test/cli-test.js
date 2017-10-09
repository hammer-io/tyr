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
    it('should create a .travis.yml file with the proper contents', () => {

      cli.initProject(configs);
      var contents = fs.readFileSync(`${configs.projectName}/.travis.yml`);
      assert.equal(constants.travisCI.fileContents, contents);

      // clean up directory that was created
      fsExtra.removeSync(configs.projectName);
    });
  });
});

describe('Init Project', () => {
  describe('#initDocker()', () => {
    it('should create a Dockerfile and .dockerignore', () => {

      cli.initProject(configs);
      assert.equal(true, fs.existsSync(`${configs.projectName}/Dockerfile`));
      assert.equal(true, fs.existsSync(`${configs.projectName}/.dockerignore`));


      // clean up directory that was created
      fsExtra.removeSync(configs.projectName);
    });
  });
});

describe('Init Project', () => {
  describe('#initDocker()', () => {
    it('should create a Dockerfile and .dockerignore with the proper contents', () => {

      cli.initProject(configs);
      var dockerContents = fs.readFileSync(`${configs.projectName}/Dockerfile`);
      var dockerignoreContents = fs.readFileSync(`${configs.projectName}/.dockerignore`);

      assert.equal(constants.docker.dockerFile.fileContents, dockerContents);
      assert.equal(constants.docker.dockerIgnore.fileContents, dockerignoreContents);


      // clean up directory that was created
      fsExtra.removeSync(configs.projectName);
    });
  });
});

describe('Init Project', () => {
  describe('#createPackageJson()', () => {
    it('should create a package.json file', () => {

      cli.initProject(configs);
      assert.equal(true, fs.existsSync(`${configs.projectName}/package.json`));

      // clean up directory that was created
      fsExtra.removeSync(configs.projectName);
    });
  });
});

describe('Init Project', () => {
  describe('#createPackageJson()', () => {
    it('should create a package.json file with the proper contents', () => {

      cli.initProject(configs);

      const packageJsonExpectedContents = '{\n' +
        '\t"name": "jack",\n' +
        '\t"version": "0.0.1",\n' +
        '\t"description": "Jack\'s Test Project",\n' +
        '\t"main": "src/index.js",\n' +
        '\t"scripts": {\n' +
        '\t\t"start": "node src/index.js"\n' +
        '\t},\n' +
        '\t"repository": {},\n' +
        '\t"authors": [\n' +
        '\t\t"Jack Meyer"\n' +
        '\t],\n' +
        '\t"license": "MIT",\n' +
        '\t"bin": {},\n' +
        '\t"dependencies": {}\n' +
        '}';


      var  packageJsonActualContents= fs.readFileSync(`${configs.projectName}/package.json`);
      assert.equal(packageJsonExpectedContents, packageJsonActualContents);


      // clean up directory that was created
      fsExtra.removeSync(configs.projectName);
    });
  });
});

describe('Init Project', () => {
  describe('#createIndexFile()', () => {
    it('should create an index.js file', () => {

      cli.initProject(configs);
      assert.equal(true, fs.existsSync(`${configs.projectName}/src/index.js`));


      // clean up directory that was created
      fsExtra.removeSync(configs.projectName);
    });
  });
});

describe('Init Project', () => {
  describe('#createIndexFile()', () => {
    it('should create an index.js file with the proper contents', () => {

      cli.initProject(configs);
      var indexJsContents = fs.readFileSync(`${configs.projectName}/src/index.js`);

      assert.equal(constants.indexJS.fileContents, indexJsContents);

      // clean up directory that was created
      fsExtra.removeSync(configs.projectName);
    });
  });
});


