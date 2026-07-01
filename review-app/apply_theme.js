const fs = require('fs');
const path = require('path');

const walkSync = (dir, filelist = []) => {
  fs.readdirSync(dir).forEach(file => {
    const dirFile = path.join(dir, file);
    if (fs.statSync(dirFile).isDirectory()) {
      filelist = walkSync(dirFile, filelist);
    } else {
      if (dirFile.endsWith('.tsx') || dirFile.endsWith('.ts')) {
        filelist.push(dirFile);
      }
    }
  });
  return filelist;
};

const files = walkSync(path.join(__dirname, 'app'));
files.push(path.join(__dirname, 'components', 'theme-toggle.tsx'));

const replacements = [
  // Primary red/amber to blue/sky
  { pattern: /rose-500/g, replace: 'blue-600' },
  { pattern: /rose-600/g, replace: 'blue-700' },
  { pattern: /rose-400/g, replace: 'blue-500' },
  { pattern: /rose-200/g, replace: 'blue-200' },
  { pattern: /rose-100/g, replace: 'blue-100' },
  { pattern: /rose-50/g, replace: 'blue-50' },
  { pattern: /rose-950/g, replace: 'blue-950' },
  { pattern: /rose-900/g, replace: 'blue-900' },
  { pattern: /rose-800/g, replace: 'blue-800' },
  
  { pattern: /amber-500/g, replace: 'sky-600' },
  { pattern: /amber-600/g, replace: 'sky-700' },
  { pattern: /amber-400/g, replace: 'sky-500' },
  { pattern: /amber-200/g, replace: 'sky-200' },
  { pattern: /amber-100/g, replace: 'sky-100' },
  { pattern: /amber-50/g, replace: 'sky-50' },
  { pattern: /amber-950/g, replace: 'sky-950' },
  { pattern: /amber-900/g, replace: 'sky-900' },
  { pattern: /amber-800/g, replace: 'sky-800' },

  { pattern: /text-rose-500/g, replace: 'text-blue-600' },
  { pattern: /text-amber-500/g, replace: 'text-sky-600' },
  { pattern: /bg-rose-500/g, replace: 'bg-blue-600' },
  { pattern: /bg-amber-500/g, replace: 'bg-sky-600' },

  // Change generic teal to blue as well to maintain theme
  { pattern: /teal-500/g, replace: 'blue-600' },
  { pattern: /teal-600/g, replace: 'blue-700' },
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;
  
  replacements.forEach(({ pattern, replace }) => {
    content = content.replace(pattern, replace);
  });
  
  if (content !== original) {
    fs.writeFileSync(file, content);
    console.log(`Updated theme in ${file}`);
  }
});
