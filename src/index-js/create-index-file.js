
import fs from 'fs';
import constants from '../constants/constants';

export default function createIndexFile(folderName) {
  fs.writeFileSync(`${folderName}/src/index.js`, constants.indexJS.fileContents, (err) => {
    if (err) {
      console.log(`${constants.indexJS.error.fileWrite}\n${err.toString()}`);
    }
  });
}
