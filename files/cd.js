import fs from 'fs';
import os from 'os';
import path from 'path';

const homeDir = os.homedir();
let currentDir = homeDir;


function cd(dir) {
    const newDir = path.resolve(currentDir, dir);
    if (fs.existsSync(newDir) && fs.lstatSync(newDir).isDirectory()) {
      currentDir = newDir;
    } else {
      console.log('Operation failed');
    }
  };

  export default cd;