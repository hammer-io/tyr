export default {

  docker: {
    name: 'Docker',
    dockerFile: {
      fileName: 'Dockerfile',
      error: {
        fileWrite: 'Failed to write Dockerfile!'
      }
    },

    dockerIgnore: {
      fileName: '.dockerignore',
      error: {
        fileWrite: 'Failed to write .dockerignore!'
      }
    }
  },

  travisCI: {
    name: 'TravisCI',
    fileName: '.travis.yml',
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
    },

    error: {
      signInFail: 'Failed to sign into github'
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

  express: {
    name: 'ExpressJS',
    version: '4.16.0'
  },

  tyr: {
    name: 'tyr',
    cliName: 'tyr',
    globalPrereqs: [
      {
        name: 'hasGithubAccount',
        message: 'Do you have a GitHub account?',
        responseIfNo: 'GitHub is currently the source control tool of choice. Please visit https://github.com/ to create a new account before proceeding.'
      }
    ],
    optionalPrereqs: {
      travis: {
        name: 'hasTravisAccount',
        message: 'Do you have a Travis account?',
        responseIfNo: 'If you want to use TravisCI as your continuous integration choice, please visit https://travis-ci.org/ and create an account before proceeding.'
      },
      dockerHub: {
        name: 'hasDockerhubAccount',
        message: 'Do you have a Dockerhub account?',
        responseIfNo: 'Docker and Docker Hub are used by default for creating your project\'s application container. Please visit https://hub.docker.com/ to create a new account before proceeding.'
      },
      heroku: {
        name: 'hasHerokuAccount',
        message: 'Do you have a Heroku account?',
        responseIfNo: 'Heroku is used to deploy the built application. Please visit https://www.heroku.com/ to create a new account'
      }
    }
  },

  indexJS: {
    fileName: 'index.js',
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
    },

    web: {
      name: 'web',
      message: 'Choose your web application framework:'
    }
  },

  mocha: {
    name: 'Mocha',
    fileName: 'test.js',
    error: {
      fileWrite: 'Failed to write tests.js!',
      fileRead: 'Failed to read tests.js template!'
    }
  }
};
