import assert from 'assert';
import sinon from 'sinon';
import fs from 'fs-extra';
import eol from 'eol';

import * as githubClient from '../dist/clients/github-client';
import * as travisClient from '../dist/clients/travis-client';

import * as travisService from '../dist/services/travis-service';
import {generateTravisCIFile, enableTravis} from '../dist/services/travis-service';

describe('Test Travis Service', () => {
  let configs = {};
  let githubTokenRequest = {};
  let travisTokenRequest = {};
  let travisAccountRequest = {};
  let travisGetUserInformationRequest = {};
  let syncTravisWithGithubRequest = {};
  let getRepositoryIdRequest = {};
  let activateTravisHookRequest = {};
  let setEnvironmentVariableRequest = {};
  let deleteGithubTokenRequest = {};
  let waitForSync = {};


  describe('enableTravis()', async function (){
    beforeEach(() => {
      configs = JSON.parse(fs.readFileSync('test/test-configurations/valid-project-configurations-credentials'));
      githubTokenRequest = sinon.stub(githubClient, 'requestGitHubToken');
      travisTokenRequest = sinon.stub(travisClient, 'requestTravisToken');
      travisAccountRequest = sinon.stub(travisClient, 'getUserAccount');
      travisGetUserInformationRequest = sinon.stub(travisClient, 'getUserInformation');
      syncTravisWithGithubRequest = sinon.stub(travisClient, 'syncTravisWithGithub');
      getRepositoryIdRequest = sinon.stub(travisClient, 'getRepositoryId');
      activateTravisHookRequest = sinon.stub(travisClient, 'activateTravisHook');
      setEnvironmentVariableRequest = sinon.stub(travisClient, 'setEnvironmentVariable');
      deleteGithubTokenRequest = sinon.stub(githubClient, 'deleteGitHubToken');
      waitForSync = sinon.stub(travisService, 'waitForSync');
    });


    it('should enable Travis CI for a user', async function(done) {
      githubTokenRequest.resolves("1234");
      travisTokenRequest.resolves("1234");
      travisAccountRequest.resolves({accounts: [
          {id: 1, login: 'blah'},
          {id: 2, login: 'something else'}
        ]});
      travisGetUserInformationRequest.resolves({user: {is_syncing: false}});
      waitForSync.resolves(done());
      syncTravisWithGithubRequest.resolves();
      getRepositoryIdRequest.resolves(1);
      activateTravisHookRequest.resolves();
      setEnvironmentVariableRequest.resolves();
      deleteGithubTokenRequest.resolves();

      try {
        const token = await enableTravis(configs);
        assert.equal(token, '1234');
      } catch (error) {
        console.log(error.message);
      }
    });

    it('should throw an error if the GitHub token request fails', async () => {
      githubTokenRequest.rejects();

      try {
        await enableTravis(configs);
        assert.equal(true, false, 'should throw an error');
      } catch (error) {
        assert.equal(error.message, "Failed to enable travis on blah/test because we were unable to get a token from GitHub.")
      }
    });

    it('should throw an error if the Travis token request fails', async function() {
      githubTokenRequest.resolves("1234");
      travisTokenRequest.rejects();

      try {
        await enableTravis(configs);
        assert.equal(true, false, 'should throw an error');
      } catch (error) {
        assert.equal(error.message, "Failed to enable travis on blah/test" +
          " because we were unable to get a token from TravisCI.");
      }
    });

    it('should thrown an error if the User Account request fails', async function() {
      githubTokenRequest.resolves("1234");
      travisTokenRequest.resolves("1234");
      travisAccountRequest.rejects();

      try {
        await enableTravis(configs);
        assert.equal(true, false, 'should throw an error');
      } catch (error) {
        assert.equal(error.message, "Failed to enable travis on blah/test because we were unable" +
          " to get account information from TravisCI.")
      }
    });

    it('should throw an error if Travis cannot sync with GitHub', async function(done) {
      githubTokenRequest.resolves("1234");
      travisTokenRequest.resolves("1234");
      travisAccountRequest.resolves({accounts: [
          {id: 1, login: 'blah'},
          {id: 2, login: 'something else'}
        ]});
      travisGetUserInformationRequest.resolves({user: {is_syncing: false}});
      waitForSync.resolves(done());
      syncTravisWithGithubRequest.rejects();

      try {
        await enableTravis(configs);
        assert.equal(true, false, 'should throw an error');
      } catch (error) {
        assert.equal(error.message, "Failed to enable travis on blah/test because we were unable" +
          " to sync TravisCI with GitHub.")
      }


    });

    it('should throw an error if Travis Hook cannot be activiated on the repository', async function(done) {
      githubTokenRequest.resolves("1234");
      travisTokenRequest.resolves("1234");
      travisAccountRequest.resolves({accounts: [
          {id: 1, login: 'blah'},
          {id: 2, login: 'something else'}
        ]});
      travisGetUserInformationRequest.resolves({user: {is_syncing: false}});
      waitForSync.resolves(done());
      syncTravisWithGithubRequest.resolves();
      getRepositoryIdRequest.resolves(1);
      activateTravisHookRequest.rejects();

      try {
        await enableTravis(configs);
        assert.equal(true, false, 'should throw an error');
      } catch (error) {
        assert.equal(error.message, "Failed to enable travis on blah/test because we were unable" +
          " to activate TravisCI.")
      }
    });

    it('should throw an error if environment variables cannot be set', async function(done) {
      githubTokenRequest.resolves("1234");
      travisTokenRequest.resolves("1234");
      travisAccountRequest.resolves({accounts: [
          {id: 1, login: 'blah'},
          {id: 2, login: 'something else'}
        ]});
      travisGetUserInformationRequest.resolves({user: {is_syncing: false}});
      waitForSync.resolves(done());
      syncTravisWithGithubRequest.resolves();
      getRepositoryIdRequest.resolves(1);
      activateTravisHookRequest.resolves();
      setEnvironmentVariableRequest.rejects();

      try {
        await enableTravis(configs);
        assert.equal(true, false, 'should throw an error');
      } catch (error) {
        assert.equal(error.message, "Failed to enable travis on blah/test because we were unable" +
          " to set environment variables.")
      }

    });

    afterEach(() => {
      githubTokenRequest.restore();
      travisTokenRequest.restore();
      travisAccountRequest.restore();
      travisGetUserInformationRequest.restore();
      syncTravisWithGithubRequest.restore();
      getRepositoryIdRequest.restore();
      activateTravisHookRequest.restore();
      setEnvironmentVariableRequest.restore();
      deleteGithubTokenRequest.restore();
      waitForSync.restore();
    });
  });

  describe('generateTravisCIFile', () => {
    beforeEach(() => {
      fs.mkdirSync('test-project');
    });

    it('should generate a basic .travis.yml file since heroku/docker was not selected', async () => {
      const configs = JSON.parse("{\n" +
        "    \"projectConfigurations\": {\n" +
        "        \"projectName\": \"test-project\",\n" +
        "        \"description\": \"test-project\",\n" +
        "        \"version\": \"0.0.0\",\n" +
        "        \"author\": \"jack\",\n" +
        "        \"license\": \"MIT\"\n" +
        "    },\n" +
        "    \"toolingConfigurations\": {\n" +
        "        \"sourceControl\": \"GitHub\",\n" +
        "        \"ci\": \"TravisCI\"\n" +
        "    }\n" +
        "}");

      const expectedContents = "language: node_js\n" +
        "node_js:\n" +
        "  - '5'\n" +
        "notifications:\n" +
        "  email:\n" +
        "    on_success: never";

      await generateTravisCIFile(configs);

      const actualContents = fs.readFileSync('test-project/.travis.yml', 'utf-8');

      assert.equal(fs.existsSync('test-project/.travis.yml'), true);
      assert.equal(eol.auto(actualContents.trim()), eol.auto(expectedContents.trim()));
    });

    it('should generate a .travis.yml file for use with heroku/docker', async () => {
      const configs = JSON.parse("{\n" +
        "    \"projectConfigurations\": {\n" +
        "        \"herokuAppName\": \"test-project\",\n" +
        "        \"projectName\": \"test-project\",\n" +
        "        \"description\": \"test-project\",\n" +
        "        \"version\": \"0.0.0\",\n" +
        "        \"author\": \"jack\",\n" +
        "        \"license\": \"MIT\"\n" +
        "    },\n" +
        "    \"toolingConfigurations\": {\n" +
        "        \"sourceControl\": \"GitHub\",\n" +
        "        \"ci\": \"TravisCI\",\n" +
        "        \"containerization\": \"Docker\",\n" +
        "        \"deployment\": \"Heroku\",\n" +
        "        \"web\": \"ExpressJS\"\n" +
        "    }\n" +
        "}");

      const expectedContents = "language: node_js\n" +
        "node_js:\n" +
        "  - '5'\n" +
        "notifications:\n" +
        "  email:\n" +
        "    on_success: never\n" +
        "services:\n" +
        "  - docker\n" +
        "before_install:\n" +
        "  - docker build -t test-project .\n" +
        "  - docker ps -a\n" +
        "after_success:\n" +
        "  - >-\n" +
        "    if [ \"$TRAVIS_BRANCH\" == \"master\" ]; then\n" +
        "\n" +
        "    docker login -u=\"$HEROKU_USERNAME\" -p=\"$HEROKU_PASSWORD\"\n" +
        "    registry.heroku.com;\n" +
        "\n" +
        "    docker build -t registry.heroku.com/test-project/web .;\n" +
        "\n" +
        "    docker push registry.heroku.com/test-project/web;\n" +
        "\n" +
        "    fi\n";

      await generateTravisCIFile(configs);

      const actualContents = fs.readFileSync('test-project/.travis.yml', 'utf-8');

      assert.equal(fs.existsSync('test-project/.travis.yml'), true);
      assert.equal(eol.auto(actualContents.trim()), eol.auto(expectedContents.trim()));
    });

    afterEach(() => {
      fs.removeSync('test-project');
    });
  });
});