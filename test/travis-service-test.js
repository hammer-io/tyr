import assert from 'assert';
import fs from 'fs-extra';

import {generateTravisCIFile} from '../dist/services/travis-service';

describe('Test Travis Service', () => {
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
      assert.equal(actualContents.trim(), expectedContents.trim());
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
        "    docker login -e=\"$HEROKU_EMAIL\" -u=\"$HEROKU_USERNAME\" -p=\"$HEROKU_PASSWORD\"\n" +
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
      assert.equal(actualContents.trim(), expectedContents.trim());


    });

    afterEach(() => {
      fs.removeSync('test-project');
    });
  });
});