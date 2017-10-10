import assert from 'assert';
import fs from 'fs';
import fsExtra from 'fs-extra';

// Tests need to import transpiled files that will be located in dist/ rather than src/
import { initProject } from '../dist/cli'
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

describe('Initialize Project Files', () => {
  before(() => {
    initProject(configs);
  });

  describe('Initialize Project Directories', () => {
    it('should create a new directory with the project name', () => {
      assert.equal(true, fs.existsSync(configs.projectName));
    });

    it('should create a src directory underneath the project directory', () => {
      assert.equal(true, fs.existsSync(configs.projectName + '/src'));
    });

    it('should return an error if a directory with the project name already exists', () => {
      const result = initProject(configs); // run initProject again to see if it fails
      assert.equal(constants.config.projectName.error.duplicateMessage, result);
    });
  });

  describe('Initialize Travis CI', () => {
    it('should create a .travis.yml file', () => {
      assert.equal(true, fs.existsSync(`${configs.projectName}/.travis.yml`));
    });

    it('should create a .travis.yml file with the proper contents', () => {
      const contents = fs.readFileSync(`${configs.projectName}/.travis.yml`);
      assert.equal(constants.travisCI.fileContents, contents);
    });
  });

  describe('Initialize Docker', () => {
    it('should create a Dockerfile and .dockerignore', () => {
      assert.equal(true, fs.existsSync(`${configs.projectName}/Dockerfile`));
      assert.equal(true, fs.existsSync(`${configs.projectName}/.dockerignore`));
    });

    it('should create a Dockerfile and .dockerignore with the proper contents', () => {
      const dockerContents = fs.readFileSync(`${configs.projectName}/Dockerfile`);
      const dockerignoreContents = fs.readFileSync(`${configs.projectName}/.dockerignore`);

      assert.equal(constants.docker.dockerFile.fileContents, dockerContents);
      assert.equal(constants.docker.dockerIgnore.fileContents, dockerignoreContents);
    });
  });

  describe('Initialize package.json', () => {
    it('should create a package.json file', () => {
      assert.equal(true, fs.existsSync(`${configs.projectName}/package.json`));
    });

    it('should create a package.json file with the proper contents', () => {
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


      const packageJsonActualContents = fs.readFileSync(`${configs.projectName}/package.json`);
      assert.equal(packageJsonExpectedContents, packageJsonActualContents);
    });
  });

  describe('Initialize index.js', () => {
    it('should create an index.js file', () => {
      assert.equal(true, fs.existsSync(`${configs.projectName}/src/index.js`));
    });

    it('should create an index.js file with the proper contents', () => {
      const indexJsContents = fs.readFileSync(`${configs.projectName}/src/index.js`);
      assert.equal(constants.indexJS.fileContents, indexJsContents);
    });
  });

  after(() => {
    fsExtra.removeSync(configs.projectName);
  });
});



