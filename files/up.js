import os from 'os';
import path from 'path';


const homeDir = os.homedir();
let currentDir = homeDir;

function up() {
    const parentDir = path.dirname(currentDir);
    if (parentDir !== currentDir && parentDir.length >= homeDir.length) {
      currentDir = parentDir;
    } else {
      console.log('You are already in the root directory.');
    }
  };

export default up;