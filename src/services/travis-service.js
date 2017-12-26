/* eslint-disable import/prefer-default-export */
import yaml from 'js-yaml';

import * as file from './../utils/files/file';

/**
 * Generates the TravisCI file.
 * @param configs the configurations object
 * @returns {Promise<void>}
 */
export async function generateTravisCIFile(configs) {
  // load in the base travis CI file.
  const travisCIFile = yaml.safeLoad(file.loadTemplate('./../../../templates/travis/travis.yml'));

  // if the user has selected heroku for deployment, then generate the specific heroku instances
  if (configs.toolingConfigurations.deployment === 'Heroku') {
    const docker = 'docker';
    const dockerBuild = `docker build -t ${configs.projectConfigurations.projectName} .`;
    const dockerPs = 'docker ps -a';
    const afterSuccess =
      'if [ "$TRAVIS_BRANCH" == "master" ]; then\n' +
      'docker login -e="$HEROKU_EMAIL" -u="$HEROKU_USERNAME" -p="$HEROKU_PASSWORD" registry.heroku.com;\n' +
      `docker build -t registry.heroku.com/${configs.projectConfigurations.projectName}/web .;\n` +
      `docker push registry.heroku.com/${configs.projectConfigurations.projectName}/web;\n` +
      'fi';

    travisCIFile.services = [docker];
    travisCIFile.before_install = [dockerBuild, dockerPs];
    travisCIFile.after_success = [afterSuccess];
  }

  file.writeFile(`${configs.projectConfigurations.projectName}/.travis.yml`, yaml.safeDump(travisCIFile));
}
