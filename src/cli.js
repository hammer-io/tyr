import * as prompt from './prompt/prompt';

export async function run(configFile, logFile) {
  // TODO enable logfile

  // TODO enable config file parsing
  if (configFile) {
    return;
  }

  // TODO enable config prompting
  const configs = await prompt.prompt();
  console.log(configs);


  // TODO generate project
}
