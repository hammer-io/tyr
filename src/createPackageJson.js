
import fs from 'fs';
import packageTemplate from '../template-package.json';


export default function createPackageJson(config) {
  const author = config.author.split(',');

  const packageJson = packageTemplate;

  packageJson.name = config.projectName;
  packageJson.version = config.version;
  packageJson.description = config.description;
  packageJson.authors = author;
  packageJson.license = config.license;

  const json = JSON.stringify(packageJson, null, '\t');

  fs.writeFile(`${config.projectName}/package.json`, json, 'utf8', (err) => {
    if (err) {
      console.log(`An error occurred while writing to ${config.projectName}/package.json`);
    }
  });
}

