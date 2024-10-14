import os from 'os';
import path from 'path';
import readline from 'readline';
import fs from 'fs';
import crypto from 'crypto';
import { createBrotliCompress, createBrotliDecompress } from 'zlib';





const usernameArg = process.argv.find(arg => arg.startsWith('--username='));
const username = usernameArg ? usernameArg.split('=')[1] : 'Guest';
const homeDir = os.homedir();
let currentDir = homeDir;

console.log(`Welcome to the File Manager, ${username}!`);
console.log(`You are currently in ${currentDir}`);


const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  rl.on('line', (input) => {
    const [command, ...args] = input.trim().split(' ');
  
    switch (command) {
      case 'up':
        up();
        break;
      case 'cd':
        if (args.length !== 1) {
          console.log('Invalid input');
        } else {
          cd(args[0]);
        }
        break;
      case 'ls':
        ls();
        break;
      case 'cat':
      if (args.length !== 1) {
        console.log('Invalid input');
      } else {
        cat(args[0]);
      }
      break;
      case 'add':
        if (args.length !== 1) {
          console.log('Invalid input');
        } else {
          add(args[0]);
        }
        break;
      case 'rn':
        if (args.length !== 2) {
          console.log('Invalid input');
        } else {
          rn(args[0], args[1]);
        }
        break;
      case 'cp':
        if (args.length !== 2) {
          console.log('Invalid input');
        } else {
          cp(args[0], args[1]);
        }
        break;
      case 'mv':
        if (args.length !== 2) {
          console.log('Invalid input');
        } else {
          mv(args[0], args[1]);
        }
        break;
      case 'rm':
        if (args.length !== 1) {
          console.log('Invalid input');
        } else {
          rm(args[0]);
        }
        break;
      case 'os':
        if (args.length !== 1) {
          console.log('Invalid input');
        } else {
          osInfo(args[0]);
        }
        break;
      case 'hash':
        if (args.length !== 1) {
          console.log('Invalid input');
        } else {
          hash(args[0]);
        }
        break;
      case 'compress':
        if (args.length !== 2) {
          console.log('Invalid input');
        } else {
          compress(args[0], args[1]);
        }
        break;
      case 'decompress':
        if (args.length !== 2) {
          console.log('Invalid input');
        } else {
          decompress(args[0], args[1]);
        }
        break;
      case '.exit':
        rl.close();
        break;
      default:
        console.log('Invalid input');
    }
  
    console.log(`You are currently in ${currentDir}`);
  });

rl.on('close', () => {
  console.log(`Thank you for using File Manager, ${username}, goodbye!`);
  console.log(`You are currently in ${currentDir}`);
  process.exit(0);
});


function up() {
    const parentDir = path.dirname(currentDir);
    if (parentDir !== currentDir && parentDir.length >= homeDir.length) {
      currentDir = parentDir;
    } else {
      console.log('You are already in the root directory.');
    }
  };
  

  function cd(dir) {
    const newDir = path.resolve(currentDir, dir);
    if (fs.existsSync(newDir) && fs.lstatSync(newDir).isDirectory()) {
      currentDir = newDir;
    } else {
      console.log('Operation failed');
    }
  };

  function ls() {
    fs.readdir(currentDir, { withFileTypes: true }, (err, files) => {
      if (err) {
        console.log('Operation failed');
        return;
      };
      console.log(`${'Index   '}${'    Name     '}${'       Type'}`);

       const filesOnly = files.filter(file => file.isFile()).sort((a, b) => a.name.replace(/\./g, '').localeCompare(b.name.replace(/\./g, '')));
       const directoriesOnly = files.filter(file => file.isDirectory()).sort((a, b) => a.name.replace(/\./g, '').localeCompare(b.name.replace(/\./g, '')));
       const sortedFiles = [...directoriesOnly, ...filesOnly];
   
        sortedFiles.forEach((file, index) => {
        const type = file.isDirectory() ? 'directory' : 'file';
        console.log(`${index}\t'${file.name}'\t'${type}'`);
      });
      console.log(`You are currently in ${currentDir}`);
    });
    
  };
  
  function cat(filePath) {
    const absolutePath = path.resolve(currentDir, filePath);
    const readableStream = fs.createReadStream(absolutePath, { encoding: 'utf-8' });
  
    readableStream.on('data', (chunk) => {
      console.log(chunk);
    });
  
    readableStream.on('error', (err) => {
      console.error('Error reading file:', err);
    });
  };
  
  function add(newFileName) {
    const filePath = path.join(currentDir, newFileName);
    fs.writeFile(filePath, '', (err) => {
      if (err) {
        console.error('Operation failed:', err);
      } else {
        console.log(`File ${newFileName} created successfully.`);
      }
    });
  };

  function rn(oldPath, newFileName) {
    const oldFilePath = path.resolve(currentDir, oldPath);
    const newFilePath = path.resolve(currentDir, newFileName);
  
    fs.rename(oldFilePath, newFilePath, (err) => {
      if (err) {
        console.error('Operation failed:', err);
      } else {
        console.log(`File renamed to ${newFileName} successfully.`);
      }
    });
  };

  function cp(sourcePath, destinationPath) {
    const sourceFilePath = path.resolve(currentDir, sourcePath);
    let destinationFilePath = path.resolve(currentDir, destinationPath);
  
    if (fs.existsSync(destinationFilePath) && fs.lstatSync(destinationFilePath).isDirectory()) {
      const fileName = path.basename(sourceFilePath);
      destinationFilePath = path.join(destinationFilePath, fileName);
    }
  
    const readableStream = fs.createReadStream(sourceFilePath);
    const writableStream = fs.createWriteStream(destinationFilePath);
  
    readableStream.on('error', (err) => {
      console.error('Error reading file:', err);
    });
  
    writableStream.on('error', (err) => {
      console.error('Error writing file:', err);
    });
  
    readableStream.pipe(writableStream);
  
    writableStream.on('finish', () => {
      console.log(`File copied to ${destinationFilePath} successfully.`);
    });
  };

  function mv(sourcePath, destinationPath) {
    const sourceFilePath = path.resolve(currentDir, sourcePath.replace(/^"|"$/g, ''));
    let destinationFilePath = path.resolve(currentDir, destinationPath.replace(/^"|"$/g, ''));
  
    if (fs.existsSync(destinationFilePath) && fs.lstatSync(destinationFilePath).isDirectory()) {
      const fileName = path.basename(sourceFilePath);
      destinationFilePath = path.join(destinationFilePath, fileName);
    }
  
    const readableStream = fs.createReadStream(sourceFilePath);
    const writableStream = fs.createWriteStream(destinationFilePath);
  
    readableStream.on('error', (err) => {
      console.error('Error reading file:', err);
    });
  
    writableStream.on('error', (err) => {
      console.error('Error writing file:', err);
    });
  
    readableStream.pipe(writableStream);
  
    writableStream.on('finish', () => {
      fs.unlink(sourceFilePath, (err) => {
        if (err) {
          console.error('Error deleting original file:', err);
        } else {
          console.log(`File moved to ${destinationFilePath} successfully.`);
        }
      });
    });
  };

  function rm(filePath) {
   
    const fixedFilePath = filePath.replace(/^"|"$/g, '').replace(/\\/g, '/');
    const fileToDelete = path.resolve(currentDir, fixedFilePath);
  
    fs.unlink(fileToDelete, (err) => {
      if (err) {
        console.error('Error deleting file:', err);
      } else {
        console.log(`File ${filePath} deleted successfully.`);
      }
    });
  };


  function osInfo(infoType) {
    switch(infoType) {
      case '--EOL':
        console.log(`EOL: ${JSON.stringify(os.EOL)}`);
        break;
      case '--cpus':
        const cpus = os.cpus();
        console.log(`Total CPUs: ${cpus.length}`);
        cpus.forEach((cpu, index) => {
          console.log(`CPU ${index + 1}: ${cpu.model} @ ${cpu.speed / 1000} GHz`);
        });
        break;
      case '--homedir':
        console.log(`Home Directory: ${os.homedir()}`);
        break;
      case '--username':
        const userInfo = os.userInfo();
        console.log(`Username: ${userInfo.username}`);
        break;
      case '--architecture':
        console.log(`Architecture: ${os.arch()}`);
        break;
      default:
        console.log('Invalid input for os command.');
    }
  };

  function hash(filePath) {
    const absolutePath = path.resolve(currentDir, filePath.replace(/^"|"$/g, ''));
    
    const hash = crypto.createHash('sha256');
    const readableStream = fs.createReadStream(absolutePath);
  
    readableStream.on('data', (chunk) => {
      hash.update(chunk);
    });
  
    readableStream.on('end', () => {
      const fileHash = hash.digest('hex');
      console.log(`Hash of ${filePath}: ${fileHash}`);
    });
  
    readableStream.on('error', (err) => {
      console.error('Error reading file:', err);
    });
  };


function compress(sourcePath, destinationPath) {
  const sourceFilePath = path.resolve(currentDir, sourcePath.replace(/^"|"$/g, ''));
  const destinationFilePath = path.resolve(currentDir, destinationPath.replace(/^"|"$/g, ''));

  const readableStream = fs.createReadStream(sourceFilePath);
  const writableStream = fs.createWriteStream(destinationFilePath);
  const brotliCompress = createBrotliCompress();

  readableStream.on('error', (err) => {
    console.error('Error reading file:', err);
  });

  writableStream.on('error', (err) => {
    console.error('Error writing file:', err);
  });

  writableStream.on('finish', () => {
    console.log(`File compressed to ${destinationPath} successfully.`);
  });

  readableStream.pipe(brotliCompress).pipe(writableStream);
};


function decompress(sourcePath, destinationPath) {
  const sourceFilePath = path.resolve(currentDir, sourcePath.replace(/^"|"$/g, ''));
  const destinationFilePath = path.resolve(currentDir, destinationPath.replace(/^"|"$/g, ''));

  const readableStream = fs.createReadStream(sourceFilePath);
  const writableStream = fs.createWriteStream(destinationFilePath);
  const brotliDecompress = createBrotliDecompress();

  readableStream.on('error', (err) => {
    console.error('Error reading file:', err);
  });

  writableStream.on('error', (err) => {
    console.error('Error writing file:', err);
  });

  writableStream.on('finish', () => {
    console.log(`File decompressed to ${destinationPath} successfully.`);
  });

  readableStream.pipe(brotliDecompress).pipe(writableStream);
};


  
  
  
  
  
  