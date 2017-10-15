# Use the official Node runtime as a parent image
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