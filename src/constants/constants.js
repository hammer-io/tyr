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
  },

  github: {
    name: 'GitHub',
    gitIgnore: {
      fileName: '.gitignore'
    }
  },

  heroku: {
    name: 'Heroku',
  },

  express: {
    name: 'ExpressJS',
    version: '4.16.0',
    index: {
      fileName: 'index.js',
      error: {
        fileWrite: 'Failed to write express index.js!'
      }
    },
    routes: {
      fileName: 'routes.js',
      error: {
        fileWrite: 'Failed to write express route.js!'
      }
    }
  },

  tyrFile: {
    fileName: '.tyrfile'
  },

  tyr: {
    name: 'tyr',
    cliName: 'tyr',
  },

  indexJS: {
    fileName: 'index.js',
    error: {
      fileWrite: 'Failed to write index.js!',
      fileRead: 'Failed to read template-index.js!'
    }
  },

  mocha: {
    name: 'Mocha',
    fileName: 'test.js'
  },

  readme: {
    fileName: 'README.md'
  }
};
