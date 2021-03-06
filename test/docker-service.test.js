import assert from 'assert';
import fs from 'fs-extra';
import eol from 'eol';

import {generateDockerFiles} from '../dist/services/docker-service';

describe('Docker Service Test', () => {
  describe('generateDockerFiles()', () => {
    beforeEach(() => {
      fs.mkdirSync('test-docker');
    });

    it('should generate a .dockerignore file', async () => {
      const dockerignoreExpectedContents = "" +
        "node_modules\n" +
        "npm-debug.log";

      await generateDockerFiles(`${process.cwd()}/test-docker`);

      assert.equal(eol.auto(fs.readFileSync('test-docker/.dockerignore', 'utf-8')), eol.auto(dockerignoreExpectedContents));
      assert.equal(fs.existsSync('test-docker/.dockerignore'), true);
    });

    it('should generate a .dockerignore file in the correct directory', async () => {
      const dockerignoreExpectedContents = "" +
        "node_modules\n" +
        "npm-debug.log";

      // test-docker/test-docker is where the file will be to make removal easy for each test
      const filePath = `${process.cwd()}/test-docker/projectName`;
      fs.mkdirSync(`${filePath}`);
      await generateDockerFiles(filePath);

      assert.equal(eol.auto(fs.readFileSync(`${filePath}/.dockerignore`, 'utf-8')), eol.auto(dockerignoreExpectedContents));
      assert.equal(fs.existsSync(`${filePath}/.dockerignore`), true);
    });

    it('should generate a Dockerfile file', async () => {
      const dockerfileExpectedContents = "" +
        "# Use the official Node runtime as a parent image\n" +
        "# More info at https://hub.docker.com/_/node/\n" +
        "FROM node:alpine\n" +
        "\n" +
        "# Set the working directory\n" +
        "WORKDIR /app\n" +
        "COPY package.json /app\n" +
        "\n" +
        "# Install app dependencies\n" +
        "RUN npm install\n" +
        "\n" +
        "# Bundle app source\n" +
        "COPY . /app\n" +
        "\n" +
        "# Make port 8080 available to the world outside this container\n" +
        "EXPOSE 8080\n" +
        "\n" +
        "# Run \"npm start\" when the container launches\n" +
        "CMD [\"npm\", \"start\"]";


      await generateDockerFiles(`${process.cwd()}/test-docker`);

      assert.equal(fs.existsSync('test-docker/Dockerfile'), true);
      assert.equal(eol.auto(fs.readFileSync('test-docker/Dockerfile', 'utf-8')), eol.auto(dockerfileExpectedContents));

    });

    it('should generate a Dockerfile file', async () => {
      const dockerfileExpectedContents = "" +
        "# Use the official Node runtime as a parent image\n" +
        "# More info at https://hub.docker.com/_/node/\n" +
        "FROM node:alpine\n" +
        "\n" +
        "# Set the working directory\n" +
        "WORKDIR /app\n" +
        "COPY package.json /app\n" +
        "\n" +
        "# Install app dependencies\n" +
        "RUN npm install\n" +
        "\n" +
        "# Bundle app source\n" +
        "COPY . /app\n" +
        "\n" +
        "# Make port 8080 available to the world outside this container\n" +
        "EXPOSE 8080\n" +
        "\n" +
        "# Run \"npm start\" when the container launches\n" +
        "CMD [\"npm\", \"start\"]";

      // test-docker/test-docker is where the file will be to make removal easy for each test
      const filePath = `${process.cwd()}/test-docker/projectName`;
      fs.mkdirSync(`${filePath}`);
      await generateDockerFiles(filePath);

      assert.equal(fs.existsSync(`${filePath}/Dockerfile`), true);
      assert.equal(eol.auto(fs.readFileSync(`${filePath}/Dockerfile`, 'utf-8')), eol.auto(dockerfileExpectedContents));

    });
  });
  afterEach(() => {
    fs.removeSync('test-docker');
  });

});