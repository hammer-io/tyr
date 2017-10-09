
import fs from 'fs';
import constants from '../constants/constants';

export default function createIndexFile(folderName) {
  fs.writeFileSync(`${folderName}/src/index.js`, constants.indexJS.fileContents);
}
