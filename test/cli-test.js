import assert from 'assert';
import chalk from 'chalk';
import fs from 'fs-extra';

// Tests need to import transpiled files that will be located in dist/ rather than src/
import { initProject, isUserFinishedWithPrereqs } from '../dist/cli'
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

// Test strategy for capturing console output found here:
// https://stackoverflow.com/questions/18543047/mocha-monitor-application-output
function captureStream(stream){
  const oldWrite = stream.write;
  let buf = '';
  stream.write = function(chunk, encoding, callback){
    buf += chunk.toString(); // chunk is a String or Buffer
    oldWrite.apply(stream, arguments);
  };

  return {
    unhook: function unhook(){
      stream.write = oldWrite;
    },
    captured: function(){
      return buf;
    },
    clear: function(){
      buf = '';
    }
  };
}

describe('User Preferences:', () => {
  describe('When the user is asked about completing the prerequisites:', () => {
    let hook;

    beforeEach(() => {
      hook = captureStream(process.stdout);
    });

    afterEach(() => {
      hook.unhook();
    });

    it('should output prereq-specific error if user answers NO for a single prereq', () => {
      constants.tyr.globalPrereqs.forEach((prereq) => {
        const promptAnswers = {};
        promptAnswers[prereq.name] = false;
        isUserFinishedWithPrereqs(promptAnswers);
        assert.equal(hook.captured(), chalk.red(prereq.responseIfNo) + '\n');
        hook.clear();
      });
    });

    it('should output all the prereq-specific errors if user answers NO for all the prereqs', () => {
      const promptAnswers = {};
      let expected = '';
      constants.tyr.globalPrereqs.forEach((prereq) => {
        promptAnswers[prereq.name] = false;
        expected += chalk.red(prereq.responseIfNo) + '\n';
      });
      isUserFinishedWithPrereqs(promptAnswers);
      assert.equal(hook.captured(), expected);
    });

    it('should return \'false\' if any of the prereq questions are NO', () => {
      // Check for single NO's
      constants.tyr.globalPrereqs.forEach((prereq) => {
        const promptAnswers = {};
        promptAnswers[prereq.name] = false;
        const actual = isUserFinishedWithPrereqs(promptAnswers);
        assert.equal(actual, false);
      });
    });

    it('should return \'true\' if all of the prereq questions are YES', () => {
      const promptAnswers = {};
      constants.tyr.globalPrereqs.forEach((prereq) => {
        promptAnswers[prereq.name] = true;
      });
      const actual = isUserFinishedWithPrereqs(promptAnswers);
      assert.equal(actual, true);
    });
  });
});

describe('Initialize Project Files', () => {
  before(() => {
    initProject(configs);
  });

  describe('Initialize Project Directories', () => {
    it('should create a new directory with the project name', () => {
      assert.equal(fs.existsSync(configs.projectName), true);
    });

    it('should create a src directory underneath the project directory', () => {
      assert.equal(fs.existsSync(configs.projectName + '/src'), true);
    });

    it('should return an error if a directory with the project name already exists', () => {
      const actualResult = initProject(configs); // run initProject again to see if it fails
      assert.equal(actualResult, constants.config.projectName.error.duplicateMessage);
    });
  });

  describe('Initialize Travis CI', () => {
    it('should create a .travis.yml file', () => {
      assert.equal(fs.existsSync(`${configs.projectName}/.travis.yml`), true);
    });

    it('should create a .travis.yml file with the proper contents', () => {
      const actualContents = fs.readFileSync(`${configs.projectName}/.travis.yml`);
      assert.equal(actualContents, constants.travisCI.fileContents);
    });
  });

  describe('Initialize Docker', () => {
    it('should create a Dockerfile and .dockerignore', () => {
      assert.equal(fs.existsSync(`${configs.projectName}/Dockerfile`), true);
      assert.equal(fs.existsSync(`${configs.projectName}/.dockerignore`), true);
    });

    it('should create a Dockerfile and .dockerignore with the proper contents', () => {
      const dockerActualContents = fs.readFileSync(`${configs.projectName}/Dockerfile`);
      const dockerignoreActualContents = fs.readFileSync(`${configs.projectName}/.dockerignore`);

      assert.equal(dockerActualContents, constants.docker.dockerFile.fileContents);
      assert.equal(dockerignoreActualContents, constants.docker.dockerIgnore.fileContents);
    });
  });

  describe('Initialize package.json', () => {
    it('should create a package.json file', () => {
      assert.equal(fs.existsSync(`${configs.projectName}/package.json`), true);
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
      assert.equal(packageJsonActualContents, packageJsonExpectedContents);
    });
  });

  describe('Initialize index.js', () => {
    it('should create an index.js file', () => {
      assert.equal(fs.existsSync(`${configs.projectName}/src/index.js`), true);
    });

    it('should create an index.js file with the proper contents', () => {
      const indexJsContents = fs.readFileSync(`${configs.projectName}/src/index.js`);
      assert.equal(indexJsContents,constants.indexJS.fileContents);
    });
  });

  after(() => {
    fs.removeSync(configs.projectName);
  });
});



