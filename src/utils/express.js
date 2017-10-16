import fs from 'fs';
import path from 'path';

/**
 * Load template file
 */
function loadTemplate(filepath) {
  return fs.readFileSync(path.join(__dirname, '/', filepath), 'utf-8');
}

/**
 * Generate Express files - index.js and routes.js
 */
export function createJsFiles(folderName) { // eslint-disable-line import/prefer-default-export
  fs.writeFileSync(
    `${folderName}/src/index.js`,
    loadTemplate('./../../templates/js/express/index.js')
  );
  fs.writeFileSync(
    `${folderName}/src/routes.js`,
    loadTemplate('./../../templates/js/express/routes.js')
  );
}
