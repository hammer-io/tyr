import assert from 'assert';
import sinon from 'sinon';
import fs from 'fs-extra';
import eol from 'eol';

import * as githubClient from '../dist/clients/github-client';
import * as githubService from '../dist/services/github-service';
import * as cli from '../dist/cli';

describe('GitHub Service', () => {
  describe('generateGithubFiles()', () => {
    beforeEach(() => {
      fs.mkdirSync('test-github');
    });

    it('should generate a .gitignore file', async () => {
      const expectedGitignoreContents = "# tyr\n" +
        ".tyrfile\n" +
        "\n" +
        "### Node ###\n" +
        "# Logs\n" +
        "logs\n" +
        "*.log\n" +
        "npm-debug.log*\n" +
        "yarn-debug.log*\n" +
        "yarn-error.log*\n" +
        "\n" +
        "# Runtime data\n" +
        "pids\n" +
        "*.pid\n" +
        "*.seed\n" +
        "*.pid.lock\n" +
        "\n" +
        "# Directory for instrumented libs generated by jscoverage/JSCover\n" +
        "lib-cov\n" +
        "\n" +
        "# Coverage directory used by tools like istanbul\n" +
        "coverage\n" +
        "\n" +
        "# nyc test coverage\n" +
        ".nyc_output\n" +
        "\n" +
        "# Grunt intermediate storage (http://gruntjs.com/creating-plugins#storing-task-files)\n" +
        ".grunt\n" +
        "\n" +
        "# Bower dependency directory (https://bower.io/)\n" +
        "bower_components\n" +
        "\n" +
        "# node-waf configuration\n" +
        ".lock-wscript\n" +
        "\n" +
        "# Compiled binary addons (http://nodejs.org/api/addons.html)\n" +
        "build/Release\n" +
        "\n" +
        "# Dependency directories\n" +
        "node_modules/\n" +
        "jspm_packages/\n" +
        "\n" +
        "# Typescript v1 declaration files\n" +
        "typings/\n" +
        "\n" +
        "# Optional npm cache directory\n" +
        ".npm\n" +
        "\n" +
        "# Optional eslint cache\n" +
        ".eslintcache\n" +
        "\n" +
        "# Optional REPL history\n" +
        ".node_repl_history\n" +
        "\n" +
        "# Output of pm pack\\\n" +
        "*.tgz\n" +
        "\n" +
        "# Yarn Integrity file\n" +
        ".yarn-integrity\n" +
        "\n" +
        "# dotenv environment variables file\n" +
        ".env";

      await githubService.generateGithubFiles('test-github');

      assert.equal(fs.existsSync('test-github/.gitignore'), true);
      assert.equal(eol.auto(fs.readFileSync('test-github/.gitignore', 'utf-8')), eol.auto(expectedGitignoreContents));
    });

    afterEach(() => {
      fs.removeSync('test-github');
    })
  });

  describe('isValidCredentials()', () => {

    // stub the githubClient getCurrentUser() method.
    let stub = sinon.stub(githubClient, 'getCurrentUser');

    it('should return true if the credentials are valid', async () => {

      // stub the github client to resolve. It doesn't matter what it resolves to, we just need
      // to test what happens when it does resolve.
      stub.resolves(true);

      // it doesn't what credentials we send
      const isValid = await githubService.isValidCredentials('blah', 'blah');

      assert.equal(isValid, true);
    });

    it('should return false if the credentials are invalid', async () => {

      // stub the github client to return a 401 (unauthorized).
      stub.rejects({status: 401});


      // it doesn't matter the credentials, just checking to make sure the client that this function
      // returns true when the client resolves.
      const isValid = await githubService.isValidCredentials('blah', 'blah');
      assert.equal(isValid, false);
    });

    it('should throw an error if there was a problem contacting the API', async () => {
      stub.rejects({status: 404}); // it does't matter what the error is, just that the status
                                   // is not 401

      try {
        const isValid = await githubService.isValidCredentials('blah', 'blah');
      } catch (error) {
        assert.equal(error.message, 'Something went wrong contacting the GitHub API!');
      }

      stub.rejects({status: 500});
      try {
        const isValid = await githubService.isValidCredentials('blah', 'blah');
      } catch (error) {
        assert.equal(error.message, 'Something went wrong contacting the GitHub API!');
      }
    });

    after(() => {
      stub.restore();
    })
  });

  describe('createGitHubRepository()', () => {

    let githubRepositoryCreateStub = sinon.stub(githubClient, 'createRepository');

    it('should successfully create repository', async () => {
      githubRepositoryCreateStub.resolves(true); // doesn't matter what it resolves to
      await githubService.createGitHubRepository('blah', 'blah', 'blah', 'blah');
    });

    it('should throw an error if there was an issue creating a repository', async () => {
      githubRepositoryCreateStub.rejects(new Error());
      try {
        await githubService.createGitHubRepository('blah', 'blah', 'blah', 'blah');
      } catch (error) {
        assert(error.message, 'Failed to create GitHub Repository');
      }
    });

    after(() => {
      githubRepositoryCreateStub.restore();
    });

  });
});