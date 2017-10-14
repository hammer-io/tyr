export default {

  docker: {
    name: 'Docker',
    dockerFile: {
      fileName: 'Dockerfile',
      fileContents: '# Use the official Node runtime as a parent image\n' +
      '# More info at https://hub.docker.com/_/node/\n' +
      'FROM node:alpine\n' +
      '    \n' +
      '# Set the working directory\n' +
      'WORKDIR /usr/src/app\n' +
      '\n' +
      '# Install app dependencies\n' +
      'COPY package.json package-lock.json ./\n' +
      'RUN npm install\n' +
      '\n' +
      '# Bundle app source\n' +
      'COPY . .\n' +
      '\n' +
      '# Make port 8080 available to the world outside this container\n' +
      'EXPOSE 8080\n' +
      '\n' +
      '# Run "npm start" when the container launches\n' +
      'CMD ["npm", "start"]\n',
      error: {
        fileWrite: 'Failed to write Dockerfile!'
      }
    },

    dockerIgnore: {
      fileName: '.dockerignore',
      fileContents: 'node_modules\n' +
      'npm-debug.log',
      error: {
        fileWrite: 'Failed to write .dockerignore!'
      }
    }
  },

  travisCI: {
    name: 'TravisCI',
    fileName: '.travis.yml',
    fileContents: '' +
    'language: node_js\n' +
    'node_js:\n' +
    '  - \'5\'\n' +
    '\n' +
    'notifications:\n' +
    '  email:\n' +
    '    on_success: never',
    error: {
      fileWrite: 'Failed to write .travis.yml!',
      enableTravisOnProject: 'Failed to enable TravisCI for the project!'
    }
  },

  github: {
    username: {
      name: 'githubUsername',
      message: 'GitHub Username:'
    },

    password: {
      name: 'githubPassword',
      message: 'GitHub Password:'
    },

    gitIgnore: {
      fileName: '.gitignore',
      error: {
        fileWrite: 'Failed to write .gitignore!'
      }
    }
  },

  dockerHub: {
    username: {
      name: 'dockerHubUsername',
      message: 'Docker Hub Username:'
    },

    password: {
      name: 'dockerHubPassword',
      message: 'Docker Hub Password:'
    }
  },

  heroku: {
    name: 'Heroku',
    email: {
      name: 'herokuEmail',
      message: 'Heroku Email:'
    },

    username: {
      name: 'herokuUsername',
      message: 'Heroku Username:'
    },

    password: {
      name: 'herokuPassword',
      message: 'Heroku Password:'
    }
  },

  tyr: {
    name: 'tyr',
    cliName: 'tyr',
    globalPrereqs: [
      {
        name: 'hasGithubAccount',
        message: 'Do you have a GitHub account?',
        responseIfNo: 'GitHub is currently the source control tool of choice. Please visit https://github.com/ to create a new account before proceeding.'
      },
      {
        name: 'hasDockerhubAccount',
        message: 'Do you have a Dockerhub account?',
        responseIfNo: 'Docker and Docker Hub are used by default for creating your project\'s application container. Please visit https://hub.docker.com/ to create a new account before proceeding.'
      },
      {
        name: 'hasHerokuAccount',
        message: 'Do you have a Heroku account?',
        responseIfNo: 'Heroku is used to deploy the built application. Please visit https://www.heroku.com/ to create a new account'
      }
    ],
    optionalPrereqs: {
      travis: {
        name: 'hasTravisAccount',
        message: 'Do you have a Travis account?',
        responseIfNo: 'If you want to use TravisCI as your continuous integration choice, please visit https://travis-ci.org/ and create an account before proceeding.'
      }
    }
  },

  indexJS: {
    fileName: 'index.js',
    fileContents: '\n' +
    'function main() {\n' +
    '  console.log(\'Hello World\');\n' +
    '}\n' +
    '\n' +
    'main();\n',
    error: {
      fileWrite: 'Failed to write index.js!',
      fileRead: 'Failed to read template-index.js!'
    }
  },

  config: {
    projectName: {
      name: 'projectName',
      message: 'Project Name:',

      error: {
        invalidMessage: 'Invalid Project Name!',
        duplicateMessage: 'Project with this name already exists in this directory!'
      }
    },

    description: {
      name: 'description',
      message: 'Description:'
    },

    version: {
      name: 'version',
      message: 'Version:',

      error: {
        invalidMessage: 'Invalid Version Number!'
      }
    },

    author: {
      name: 'author',
      message: 'Author:'
    },

    license: {
      name: 'license',
      message: 'License:',

      error: {
        invalidMessage: 'Invalid License!'
      }
    },

    ci: {
      name: 'ci',
      message: 'Choose your CI tool:'
    },

    container: {
      name: 'container',
      message: 'Choose your containerization tool:'
    },

    deployment: {
      name: 'deployment',
      message: 'Choose your hosting service:'
    }
  }
}
