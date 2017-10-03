
import fs from 'fs';

export default function createIndexFile(folderName) {
  fs.readFile('./templates/template-index.js', (readErr, contents) => {
    if (readErr) {
      console.log('An error occurred while reading template-index.js');
    } else {
      fs.writeFile(`${folderName}/src/index.js`, contents, (writeErr) => {
        if (writeErr) {
          console.log(`An error occurred while writing ${folderName}/src/index.js`);
        }
      })
    }
  });
}
