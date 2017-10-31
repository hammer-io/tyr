export default {

  docker: {
    name: 'Docker',
    dockerFile: {
      fileName: 'Dockerfile'
    },

    dockerIgnore: {
      fileName: '.dockerignore'
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
      fileName: 'index.js'
    },
    routes: {
      fileName: 'routes.js'
    }
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
  }
};
