import assert from 'assert';
import chalk from 'chalk';
import fs from 'fs-extra';
import winston from 'winston';
import {
  loadTemplate
} from '../src/utils/file';

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

const configs2 = {
  projectName: 'jack',
  description: 'Jack\'s Test Project',
  version: '0.0.1',
  author: 'Jack Meyer',
  license: 'MIT',
  web: 'ExpressJS'
};

const configs3 = {
  projectName: 'jack',
  description: 'Jack\'s Test Project',
  version: '0.0.1',
  author: 'Jack Meyer',
  license: 'MIT',
  ci: 'TravisCI',
  deployment: 'Heroku'
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

// /**
//  * Load template file
//  */
// function loadTemplate(filepath) {
//   return fs.readFileSync(path.join(__dirname, '/', filepath), 'utf-8');
// }

describe('User Preferences:', () => {
  describe('When the user is asked about completing the prerequisites:', () => {
    let hook;
    let previousLevel;

    beforeEach(() => {
      hook = captureStream(process.stdout);
      previousLevel = winston.level;
      winston.level = 'info';
    });

    afterEach(() => {
      hook.unhook();
      winston.level = previousLevel;
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
      const expectedContents = loadTemplate('./../../templates/travis/.travis.yml');
      const actualContents = fs.readFileSync(`${configs.projectName}/.travis.yml`);
      assert.equal(actualContents, expectedContents);
    });
  });

  describe('Initialize Docker', () => {
    it('should create a Dockerfile and .dockerignore', () => {
      assert.equal(fs.existsSync(`${configs.projectName}/Dockerfile`), true);
      assert.equal(fs.existsSync(`${configs.projectName}/.dockerignore`), true);
    });

    it('should create a Dockerfile and .dockerignore with the proper contents', () => {
      const dockerExpectedContents = loadTemplate('./../../templates/docker/Dockerfile');
      const dockerignoreExpectedContents = loadTemplate('./../../templates/docker/.dockerignore');
      const dockerActualContents = fs.readFileSync(`${configs.projectName}/Dockerfile`);
      const dockerignoreActualContents = fs.readFileSync(`${configs.projectName}/.dockerignore`);

      assert.equal(dockerActualContents, dockerExpectedContents);
      assert.equal(dockerignoreActualContents, dockerignoreExpectedContents);
    });
  });

  describe('Initialize package.json', () => {
    it('should create a package.json file', () => {
      assert.equal(fs.existsSync(`${configs.projectName}/package.json`), true);
    });

    it('should create a package.json file with the proper contents', () => {
      const packageJsonExpectedContents = '{\n' +
        '  "name": "jack",\n' +
        '  "version": "0.0.1",\n' +
        '  "description": "Jack\'s Test Project",\n' +
        '  "main": "src/index.js",\n' +
        '  "scripts": {\n' +
        '    "start": "node src/index.js",\n' +
        '    "test": "mocha"\n' +
        '  },\n' +
        '  "repository": {},\n' +
        '  "authors": [\n' +
        '    "Jack Meyer"\n' +
        '  ],\n' +
        '  "license": "MIT",\n' +
        '  "bin": {},\n' +
        '  "dependencies": {},\n' +
        '  "devDependencies": {\n' +
        '    "mocha": "3.5.3"\n' +
        '  }\n' +
        '}';
      const packageJsonActualContents = fs.readFileSync(`${configs.projectName}/package.json`, 'utf-8');
      assert.equal(packageJsonActualContents, packageJsonExpectedContents);
    });
  });

  describe('Initialize index.js', () => {
    it('should create an index.js file', () => {
      assert.equal(fs.existsSync(`${configs.projectName}/src/index.js`), true);
    });

    it('should create an index.js file with the proper contents', () => {
      const expectedContents = loadTemplate('./../../templates/js/index.js');
      const actualContents = fs.readFileSync(`${configs.projectName}/src/index.js`);
      assert.equal(actualContents, expectedContents);
    });
  });

  describe('Create Sample Mocha Test', () => {
    it('should create a mocha test file with a sample test inside', () => {
      const expectedContents = loadTemplate('./../../templates/mocha/test.js');
      const actualContents = fs.readFileSync(`${configs.projectName}/${constants.mocha.fileName}`);
      assert.equal(actualContents, expectedContents);
    });
  });

  after(() => {
    fs.removeSync(configs.projectName);
  });
});

describe('Initialize Project Files With ExpressJS', () => {
  before(() => {
    initProject(configs2);
  });

  describe('Initialize package.json', () => {
    it('should create a package.json file with the proper contents', () => {
      const packageJsonExpectedContents = '{\n' +
        '  "name": "jack",\n' +
        '  "version": "0.0.1",\n' +
        '  "description": "Jack\'s Test Project",\n' +
        '  "main": "src/index.js",\n' +
        '  "scripts": {\n' +
        '    "start": "node src/index.js",\n' +
        '    "test": "mocha"\n' +
        '  },\n' +
        '  "repository": {},\n' +
        '  "authors": [\n' +
        '    "Jack Meyer"\n' +
        '  ],\n' +
        '  "license": "MIT",\n' +
        '  "bin": {},\n' +
        '  "dependencies": {\n' +
        '    "express": "4.16.0"\n' +
        '  },\n' +
        '  "devDependencies": {\n' +
        '    "mocha": "3.5.3"\n' +
        '  }\n' +
        '}';
      const packageJsonActualContents = fs.readFileSync(`${configs2.projectName}/package.json`, 'utf-8');
      assert.equal(packageJsonActualContents, packageJsonExpectedContents);
    });
  });

  describe('Initialize index.js', () => {
    it('should create an index.js file', () => {
      assert.equal(fs.existsSync(`${configs2.projectName}/src/index.js`), true);
    });

    it('should create an index.js file with the proper contents', () => {
      const expectedContents = loadTemplate('./../../templates/js/express/index.js');
      const actualContents = fs.readFileSync(`${configs2.projectName}/src/index.js`);
      assert.equal(actualContents, expectedContents);
    });
  });

  describe('Initialize routes.js', () => {
    it('should create an routes.js file', () => {
      assert.equal(fs.existsSync(`${configs2.projectName}/src/index.js`), true);
    });

    it('should create an index.js file with the proper contents', () => {
      const expectedContents = loadTemplate('./../../templates/js/express/routes.js');
      const actualContents = fs.readFileSync(`${configs2.projectName}/src/routes.js`);
      assert.equal(actualContents, expectedContents);
    });
  });

  after(() => {
    fs.removeSync(configs2.projectName);
  });
});

describe('Initialize Project Files With Heroku', () => {
  before(() => {
    initProject(configs3);
  });

  describe('Initialize Travis CI', () => {
    it('should create a .travis.yml file', () => {
      assert.equal(fs.existsSync(`${configs3.projectName}/.travis.yml`), true);
    });

    it('should create a .travis.yml file with the proper contents', () => {
      const expectedContents = 'language: node_js\n' +
        'node_js:\n' +
        '  - \'5\'\n' +
        'notifications:\n' +
        '  email:\n' +
        '    on_success: never\n' +
        'before_install:\n' +
        '  - docker build -t jack .\n' +
        '  - docker ps -a\n' +
        'after_success:\n' +
        '  - |-\n' +
        '    if [ "$TRAVIS_BRANCH" == "master" ]; then\n' +
        '    docker login -e="$HEROKU_EMAIL" -u="$HEROKU_USERNAME" -p="$HEROKU_PASSWORD" registry.heroku.com;\n' +
        '    docker tag jack registry.heroku.com/jack/web;\n' +
        '    docker push registry.heroku.com/jack/web;\n' +
        '    fi\n';
      const actualContents = fs.readFileSync(`${configs3.projectName}/.travis.yml`, 'utf-8');
      assert.equal(actualContents, expectedContents);
    });
  });

  after(() => {
    fs.removeSync(configs3.projectName);
  });
});


describe('Incorrect input should result return undefined', () => {
  it('loadFile should return undefined if the template doesn\'t exist', () => {
    assert.equal(loadTemplate('template/xyz'), undefined);
  });
});
