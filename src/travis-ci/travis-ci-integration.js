import inquirer from 'inquirer';

import constants from '../constants/constants';
import * as githubClient from '../clients/github'
import * as travisClient from '../clients/travis-ci'

function promptPassword() {
  const questions = [{
    name: 'passw',
    type: 'password',
    message: 'GitHub Password:'
  }];

  return inquirer.prompt(questions);
}

export default async function enableTravisOnProject(username, projectName) {
  const answers = await promptPassword();
  const config = {
    username,
    projectName,
    passw: answers.passw
  };

  try {
    // Create a temporary GitHub oauth token
    const githubResponse = await githubClient.requestGitHubToken(config);
    const githubToken = githubResponse.token;
    const githubUrl = githubResponse.url;

    // Use the GitHub token to get a Travis token
    const travisAccessToken = await travisClient.requestTravisToken(githubToken);

    // Delete the temporary GitHub token
    await githubClient.deleteGitHubToken(githubUrl, config);

    // Get the project repository ID, and then use that ID to activate Travis for the project
    const repoId = await travisClient.getRepositoryId(travisAccessToken, config);
    await travisClient.activateTravisHook(repoId, travisAccessToken);

    winston.log('info', `TravisCI successfully enabled on ${config.username}/${config.projectName}`);
  } catch (err) {
    winston.log('error', constants.travisCI.error.enableTravisOnProject, err);
  }
}
