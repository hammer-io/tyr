
import fs from 'fs';
import constants from '../constants/constants';

export default function createIndexFile(folderName) {
  fs.readFile('./templates/template-index.js', (err, contents) => {
    if (err) {
      console.log(`${constants.indexJS.error.fileRead}\n${err.toString()}`);
    } else {
      fs.writeFile(`${folderName}/src/index.js`, contents, (err) => {
        if (err) {
          console.log(`${constants.indexJS.error.fileWrite}\n${err.toString()}`);
        }
      })
    }
  });
}
