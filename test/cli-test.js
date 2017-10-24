import assert from 'assert';
import fs from 'fs-extra';
import {
  loadTemplate
} from '../src/utils/file';

// Tests need to import transpiled files that will be located in dist/ rather than src/
import { initProject, isUserFinishedWithPrereqs } from '../dist/cli'
import constants from '../dist/constants/constants';
import { generateProjectFiles } from '../src/cli';

const configs = {
  projectConfigurations: {
    projectName: 'jack',
    description: 'Jack\'s Test Project',
    version: '0.0.1',
    author: 'Jack Meyer',
    license: 'MIT'
  },

  tooling: {
    sourceControl: 'GitHub',
    ci: 'TravisCI',
    containerization: 'Docker'
  }

};

const configs2 = {
  projectConfigurations: {
    projectName: 'jack',
    description: 'Jack\'s Test Project',
    version: '0.0.1',
    author: 'Jack Meyer',
    license: 'MIT',
  },
  tooling: {
    web: 'ExpressJS'
  }
};

const configs3 = {
  projectConfigurations: {
    projectName: 'jack',
    description: 'Jack\'s Test Project',
    version: '0.0.1',
    author: 'Jack Meyer',
    license: 'MIT',
  },

  tooling: {
    ci: 'TravisCI',
    deployment: 'Heroku'
  }
};

const noErrorConfig = {
  projectConfigurations:
    {
      projectName: 'jack',
      description: 'jack',
      version: '0.0.0',
      author: 'jack',
      license: ''
    },
  tooling:
    {
      sourceControl: '<None>',
      web: '<None>',
      ci: '<None>',
      containerization: '<None>',
      deployment: '<None>'
    }
};


describe('Initialize Project Files with GitHub, Travis, Docker', () => {
  before(async () => {
    await generateProjectFiles(configs);
  });

  describe('Initialize Project Directories', () => {
    it('should create a new directory with the project name', () => {
      assert.equal(fs.existsSync(configs.projectConfigurations.projectName), true);
    });

    it('should create a src directory underneath the project directory', () => {
      assert.equal(fs.existsSync(configs.projectConfigurations.projectName + '/src'), true);
    });

    it('should return an error if a directory with the project name already exists', async () => {
      const actualResult = await generateProjectFiles(configs); // run initProject again to see
      // if it fails
      assert.equal(actualResult, 'Project already exists!');
    });
  });

  describe('Intialize GitHub', () => {
    it('should create a .gitignore file', () => {
      assert.equal(fs.existsSync(`${configs.projectConfigurations.projectName}/.gitignore`), true);
    });

    it('should create a .gitignore file with the proper contents', () => {
      const expectedContents = loadTemplate('./../../templates/git/.gitignore');
      const actualContents = fs.readFileSync(`${configs.projectConfigurations.projectName}/.gitignore`);
      assert.equal(actualContents, expectedContents);
    });
  });

  describe('Initialize Travis CI', () => {
    it('should create a .travis.yml file', () => {
      assert.equal(fs.existsSync(`${configs.projectConfigurations.projectName}/.travis.yml`), true);
    });

    it('should create a .travis.yml file with the proper contents', () => {
      const expectedContents = loadTemplate('./../../templates/travis/.travis.yml');
      const actualContents = fs.readFileSync(`${configs.projectConfigurations.projectName}/.travis.yml`);
      assert.equal(actualContents, expectedContents);
    });
  });

  describe('Initialize Docker', () => {
    it('should create a Dockerfile and .dockerignore', () => {
      assert.equal(fs.existsSync(`${configs.projectConfigurations.projectName}/Dockerfile`), true);
      assert.equal(fs.existsSync(`${configs.projectConfigurations.projectName}/.dockerignore`), true);
    });

    it('should create a Dockerfile and .dockerignore with the proper contents', () => {
      const dockerExpectedContents = loadTemplate('./../../templates/docker/Dockerfile');
      const dockerignoreExpectedContents = loadTemplate('./../../templates/docker/.dockerignore');
      const dockerActualContents = fs.readFileSync(`${configs.projectConfigurations.projectName}/Dockerfile`);
      const dockerignoreActualContents = fs.readFileSync(`${configs.projectConfigurations.projectName}/.dockerignore`);

      assert.equal(dockerActualContents, dockerExpectedContents);
      assert.equal(dockerignoreActualContents, dockerignoreExpectedContents);
    });
  });

  describe('Initialize package.json', () => {
    it('should create a package.json file', () => {
      assert.equal(fs.existsSync(`${configs.projectConfigurations.projectName}/package.json`), true);
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
      const packageJsonActualContents = fs.readFileSync(`${configs.projectConfigurations.projectName}/package.json`, 'utf-8');
      assert.equal(packageJsonActualContents, packageJsonExpectedContents);
    });
  });

  describe('Initialize index.js', () => {
    it('should create an index.js file', () => {
      assert.equal(fs.existsSync(`${configs.projectConfigurations.projectName}/src/index.js`), true);
    });

    it('should create an index.js file with the proper contents', () => {
      const expectedContents = loadTemplate('./../../templates/js/index.js');
      const actualContents = fs.readFileSync(`${configs.projectConfigurations.projectName}/src/index.js`);
      assert.equal(actualContents, expectedContents);
    });
  });

  describe('Generate README.md', () => {
    it('should create a README.md file', () => {
      assert.equal(fs.existsSync(`${configs.projectConfigurations.projectName}/${constants.readme.fileName}`), true);
    });
    it('should contain the proper contents', () => {
      const expectedContents = `# ${configs.projectConfigurations.projectName}\n`
        + `<p>${configs.projectConfigurations.description}</p>`
        + '## Installation\n'
        + '\n'
        + '<p>`npm install`</p>\n'
        + '\n'
        + '## Usage\n'
        + '\n'
        + '<p>`npm start`</p>\n'
        + '<p>Generated by Tyr-CLI</p>';
      const actualContents = fs.readFileSync(`${configs.projectConfigurations.projectName}/${constants.readme.fileName}`);
      assert.equal(actualContents, expectedContents);
    })
  });

  describe('Create Sample Mocha Test', () => {
    it('should create a mocha test file with a sample test inside', () => {
      const expectedContents = loadTemplate('./../../templates/mocha/test.js');
      const actualContents = fs.readFileSync(`${configs.projectConfigurations.projectName}/${constants.mocha.fileName}`);
      assert.equal(actualContents, expectedContents);
    });
  });
  after(() => {
    fs.removeSync(configs.projectConfigurations.projectName);
  });
});

describe('Create .tyrfile', () => {
  before(async () => {
    await generateProjectFiles(noErrorConfig);
  });

  it('should create a .tyrfile', () => {
    assert.equal(fs.existsSync(`${noErrorConfig.projectConfigurations.projectName}/.tyrfile`), true);
  });

  it('should create a .tyrfile with the proper contents', () => {
    const actualContents = fs.readFileSync(`${noErrorConfig.projectConfigurations.projectName}/.tyrfile`);
    assert.equal(JSON.stringify(JSON.parse(actualContents)), JSON.stringify(noErrorConfig));
  });

  after(() => {
    fs.removeSync(noErrorConfig.projectConfigurations.projectName);
  });
});

describe('Initialize Project Files With ExpressJS', () => {
  before(async () => {
    await generateProjectFiles(configs2);
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
      const packageJsonActualContents = fs.readFileSync(`${configs2.projectConfigurations.projectName}/package.json`, 'utf-8');
      assert.equal(packageJsonActualContents, packageJsonExpectedContents);
    });
  });

  describe('Initialize index.js', () => {
    it('should create an index.js file', () => {
      assert.equal(fs.existsSync(`${configs2.projectConfigurations.projectName}/src/index.js`), true);
    });

    it('should create an index.js file with the proper contents', () => {
      const expectedContents = loadTemplate('./../../templates/js/express/index.js');
      const actualContents = fs.readFileSync(`${configs2.projectConfigurations.projectName}/src/index.js`);
      assert.equal(actualContents, expectedContents);
    });
  });

  describe('Initialize routes.js', () => {
    it('should create an routes.js file', () => {
      assert.equal(fs.existsSync(`${configs2.projectConfigurations.projectName}/src/index.js`), true);
    });

    it('should create an index.js file with the proper contents', () => {
      const expectedContents = loadTemplate('./../../templates/js/express/routes.js');
      const actualContents = fs.readFileSync(`${configs2.projectConfigurations.projectName}/src/routes.js`);
      assert.equal(actualContents, expectedContents);
    });
  });

  after(() => {
    fs.removeSync(configs2.projectConfigurations.projectName);
  });
});

describe('Initialize Project Files With Heroku', () => {
  before(async () => {
    await generateProjectFiles(configs3);
  });

  describe('Initialize Travis CI', () => {
    it('should create a .travis.yml file', () => {
      assert.equal(fs.existsSync(`${configs3.projectConfigurations.projectName}/.travis.yml`), true);
    });

    it('should create a .travis.yml file with the proper contents', () => {
      const expectedContents = 'language: node_js\n' +
        'node_js:\n' +
        '  - \'5\'\n' +
        'notifications:\n' +
        '  email:\n' +
        '    on_success: never\n' +
        'services:\n' +
        '  - docker\n' +
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
      const actualContents = fs.readFileSync(`${configs3.projectConfigurations.projectName}/.travis.yml`, 'utf-8');
      assert.equal(actualContents, expectedContents);
    });
  });

  after(() => {
    fs.removeSync(configs3.projectConfigurations.projectName);
  });
});


describe('Incorrect input should result return undefined', () => {
  it('loadFile should return undefined if the template doesn\'t exist', () => {
    assert.equal(loadTemplate('template/xyz'), undefined);
  });
});
