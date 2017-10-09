import fs from 'fs';
import constants from '../constants/constants';

export default function initTravisCI(config) {
  fs.writeFileSync(`${config.projectName}/${constants.travisCI.fileName}`, constants.travisCI.fileContents);
}