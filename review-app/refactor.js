const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'app');

function walk(directory) {
  let results = [];
  const list = fs.readdirSync(directory);
  list.forEach((file) => {
    const filePath = path.join(directory, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(filePath));
    } else if (filePath.endsWith('.tsx')) {
      results.push(filePath);
    }
  });
  return results;
}

const files = walk(dir);

const replacements = [
  // Backgrounds
  { pattern: /(?<!dark:)(?<![a-z:-])bg-gray-950(\/[0-9]+)?/g, replace: 'bg-white dark:bg-gray-950$1' },
  { pattern: /(?<!dark:)(?<![a-z:-])bg-gray-900(\/[0-9]+)?/g, replace: 'bg-gray-50 dark:bg-gray-900$1' },
  { pattern: /(?<!dark:)(?<![a-z:-])bg-gray-800(\/[0-9]+)?/g, replace: 'bg-gray-100 dark:bg-gray-800$1' },
  { pattern: /(?<!dark:)(?<![a-z:-])bg-gray-700(\/[0-9]+)?/g, replace: 'bg-gray-200 dark:bg-gray-700$1' },
  
  // Hover Backgrounds
  { pattern: /(?<!dark:)hover:bg-gray-800(\/[0-9]+)?/g, replace: 'hover:bg-gray-100 dark:hover:bg-gray-800$1' },
  { pattern: /(?<!dark:)hover:bg-gray-700(\/[0-9]+)?/g, replace: 'hover:bg-gray-200 dark:hover:bg-gray-700$1' },
  { pattern: /(?<!dark:)hover:bg-gray-600(\/[0-9]+)?/g, replace: 'hover:bg-gray-300 dark:hover:bg-gray-600$1' },

  // Text colors
  { pattern: /(?<!dark:)(?<![a-z:-])text-white(\/[0-9]+)?/g, replace: 'text-gray-900 dark:text-white$1' },
  { pattern: /(?<!dark:)(?<![a-z:-])text-gray-200(\/[0-9]+)?/g, replace: 'text-gray-800 dark:text-gray-200$1' },
  { pattern: /(?<!dark:)(?<![a-z:-])text-gray-300(\/[0-9]+)?/g, replace: 'text-gray-700 dark:text-gray-300$1' },
  { pattern: /(?<!dark:)(?<![a-z:-])text-gray-400(\/[0-9]+)?/g, replace: 'text-gray-600 dark:text-gray-400$1' },
  { pattern: /(?<!dark:)(?<![a-z:-])text-gray-500(\/[0-9]+)?/g, replace: 'text-gray-500 dark:text-gray-500$1' },
  
  // Hover Text colors
  { pattern: /(?<!dark:)hover:text-white(\/[0-9]+)?/g, replace: 'hover:text-gray-900 dark:hover:text-white$1' },
  { pattern: /(?<!dark:)hover:text-gray-200(\/[0-9]+)?/g, replace: 'hover:text-gray-800 dark:hover:text-gray-200$1' },
  { pattern: /(?<!dark:)hover:text-gray-300(\/[0-9]+)?/g, replace: 'hover:text-gray-700 dark:hover:text-gray-300$1' },

  // Borders
  { pattern: /(?<!dark:)(?<![a-z:-])border-gray-900(\/[0-9]+)?/g, replace: 'border-gray-200 dark:border-gray-900$1' },
  { pattern: /(?<!dark:)(?<![a-z:-])border-gray-800(\/[0-9]+)?/g, replace: 'border-gray-200 dark:border-gray-800$1' },
  { pattern: /(?<!dark:)(?<![a-z:-])border-gray-700(\/[0-9]+)?/g, replace: 'border-gray-300 dark:border-gray-700$1' },

  // Special cases for border in focus/hover
  { pattern: /(?<!dark:)hover:border-gray-700(\/[0-9]+)?/g, replace: 'hover:border-gray-300 dark:hover:border-gray-700$1' },
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;
  
  replacements.forEach(({ pattern, replace }) => {
    content = content.replace(pattern, replace);
  });
  
  if (content !== original) {
    fs.writeFileSync(file, content);
    console.log(`Updated ${file}`);
  }
});
