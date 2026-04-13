import fs from 'fs';
import path from 'path';

const OLD_NAMES = [
  /habibaminhas\.com/gi,
  /habibaminhas/gi,
  /Habiba Minhas/g,
  /Habiba Minhas/g,
  /habibaminhas/g,
  /Habiba Minhas/g,
  /Habiba Minhas/g
];

const NEW_NAMES = [
  'habibaminhas.com',
  'habibaminhas',
  'Habiba Minhas',
  'Habiba Minhas',
  'HabibaMinhas', // for components/vars
  'Habiba Minhas',
  'Habiba Minhas'
];

const walkSync = (dir, filelist = []) => {
  if (!fs.existsSync(dir)) return filelist;
  fs.readdirSync(dir).forEach(file => {
    const dirFile = path.join(dir, file);
    try {
      if (fs.statSync(dirFile).isDirectory()) {
        if (!['node_modules', '.next', '.git'].includes(file)) {
          filelist = walkSync(dirFile, filelist);
        }
      } else {
        if (dirFile.match(/\.(tsx|ts|js|jsx|json|md|html|css)$/)) {
          filelist.push(dirFile);
        }
      }
    } catch (e) {}
  });
  return filelist;
};

// Start searching in the src and public directories, and root files
const dirsToSearch = ['./src', './public', './'];
let files = [];

dirsToSearch.forEach(dir => {
  if (dir === './') {
    // Only add root files
    fs.readdirSync(dir).forEach(file => {
      const dirFile = path.join(dir, file);
      try {
        if (fs.statSync(dirFile).isFile() && dirFile.match(/\.(tsx|ts|js|jsx|json|md|html|css)$/)) {
          files.push(dirFile);
        }
      } catch(e) {}
    });
  } else {
    files = files.concat(walkSync(dir));
  }
});

let changedFiles = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  const og = content;
  
  OLD_NAMES.forEach((regex, index) => {
    content = content.replace(regex, NEW_NAMES[index]);
  });

  if (og !== content) {
    fs.writeFileSync(file, content);
    changedFiles++;
    console.log(`Modified: ${file}`);
  }
});

console.log(`Total files modified: ${changedFiles}`);
console.log('Done! All instances of habibaminhas have been replaced with Habiba Minhas and habibaminhas.com');
