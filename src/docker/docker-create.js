import fs from 'fs';

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

  fs.writeFile(`${config.projectName}/Dockerfile`, dockerFileContents, (err) => {
    if (err) {
      console.log(`ERROR: Failed to write Dockerfile\n${err.toString()}`);
    }
  });

  const dockerIgnoreContents = 'node_modules\nnpm-debug.log\n';

  fs.writeFile(`${config.projectName}/.dockerignore`, dockerIgnoreContents, (err) => {
    if (err) {
      console.log(`ERROR: Failed to write .dockerignore\n${err.toString()}`);
    }
  });
}
