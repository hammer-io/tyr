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
    fileConents: '' +
    'language: node_js\n' +
    'node_js:\n' +
    '  - \'5\'\n' +
    '\n' +
    'notifications:\n' +
    '  email:\n' +
    '    on_success: never',
    error: {
      fileWrite: 'Failed to write .travis.yml!'
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
    }
  },

  hammer: {
    name: 'hammer-io',
    cliName: 'hammer-cli'
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
      message: 'License:'
    },

    ci: {
      name: 'ci',
      message: 'Choose your CI tool:'
    },

    container: {
      name: 'container',
      message: 'Choose your containerization tool:'
    }
  }
}