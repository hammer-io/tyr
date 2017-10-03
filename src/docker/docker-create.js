import fs from 'fs';

function copyFile(source, target, cb) {
  let cbCalled = false;

  function done(err) {
    if (!cbCalled) {
      cb(err);
      cbCalled = true;
    }
  }

  const rd = fs.createReadStream(source);
  rd.on('error', (err) => {
    done(err);
  });
  const wr = fs.createWriteStream(target);
  wr.on('error', (err) => {
    done(err);
  });
  wr.on('close', () => {
    done();
  });
  rd.pipe(wr);
}

export default function initDocker(config) {
  console.log('Creating Dockerfile and .dockerignore...');

  copyFile('./assets/docker/Dockerfile', `${config.projectName}/Dockerfile`, (err) => {
    console.log(`ERROR: Failed to create Dockerfile\n    ${err}`);
  });
  copyFile('./assets/docker/.dockerignore', `${config.projectName}/.dockerignore`, (err) => {
    console.log(`ERROR: Failed to create .dockerignore\n    ${err}`);
  });
}
