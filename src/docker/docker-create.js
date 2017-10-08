import fs from 'fs';

import constants from '../constants/constants'

const dockerFileContents = `# Use the official Node runtime as a parent image
# More info at https://hub.docker.com/_/node/
FROM node:alpine
    
# Set the working directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json package-lock.json ./
RUN npm install

# Bundle app source
COPY . .

# Make port 8080 available to the world outside this container
EXPOSE 8080

# Run "npm start" when the container launches
CMD ["npm", "start"]
`;

export default function initDocker(config) {
  console.log('Creating Dockerfile and .dockerignore...');

  fs.writeFileSync(`${config.projectName}/${constants.docker.dockerFile.fileName}`, dockerFileContents, (err) => {
    if (err) {
      console.log(`${constants.docker.dockerFile.error.fileWrite}\n${err.toString()}`);
    }
  });

  const dockerIgnoreContents = 'node_modules\nnpm-debug.log\n';

  fs.writeFileSync(`${config.projectName}/${constants.docker.dockerIgnore.fileName}`, dockerIgnoreContents, (err) => {
    if (err) {
      console.log(`${constants.docker.dockerIgnore.error.fileWrite}\n${err.toString()}`);
    }
  });
}
