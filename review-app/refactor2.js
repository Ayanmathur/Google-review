const fs = require('fs');
const path = require('path');

const files = [
  path.join(__dirname, 'app', 'activate', 'page.tsx'),
  path.join(__dirname, 'app', 'dashboard', 'page.tsx'),
];

const replacements = [
  // Boxy corners
  { pattern: /rounded-2xl/g, replace: 'rounded-md' },
  { pattern: /rounded-xl/g, replace: 'rounded-md' },
  // Keep rounded-full only for status badges and small circular elements
  // Replace blue with rose/amber palette
  { pattern: /from-blue-500\/20 to-indigo-500\/20/g, replace: 'from-rose-100 to-amber-100 dark:from-rose-500/20 dark:to-amber-500/20' },
  { pattern: /border border-blue-500\/20/g, replace: 'border border-rose-200 dark:border-rose-500/20' },
  { pattern: /text-blue-400/g, replace: 'text-rose-500' },
  { pattern: /from-indigo-500\/20 to-violet-500\/20/g, replace: 'from-rose-100 to-amber-100 dark:from-rose-500/20 dark:to-amber-500/20' },
  { pattern: /border border-indigo-500\/20/g, replace: 'border border-rose-200 dark:border-rose-500/20' },
  { pattern: /text-indigo-400/g, replace: 'text-rose-500' },
  { pattern: /bg-blue-600 hover:bg-blue-500/g, replace: 'bg-rose-500 hover:bg-rose-600' },
  { pattern: /bg-indigo-600 hover:bg-indigo-500/g, replace: 'bg-rose-500 hover:bg-rose-600' },
  { pattern: /focus:ring-blue-500\/40 focus:border-blue-500\/40/g, replace: 'focus:ring-rose-400/40 focus:border-rose-400/40' },
  { pattern: /focus:ring-indigo-500\/40 focus:border-indigo-500\/40/g, replace: 'focus:ring-rose-400/40 focus:border-rose-400/40' },
  { pattern: /shadow-\[0_0_20px_rgba\(37,99,235,0\.15\)\]/g, replace: 'shadow-lg shadow-rose-500/15' },
  { pattern: /shadow-\[0_0_25px_rgba\(37,99,235,0\.3\)\]/g, replace: 'shadow-rose-500/25' },
  { pattern: /shadow-\[0_0_20px_rgba\(99,102,241,0\.15\)\]/g, replace: 'shadow-lg shadow-rose-500/15' },
  { pattern: /shadow-\[0_0_25px_rgba\(99,102,241,0\.3\)\]/g, replace: 'shadow-rose-500/25' },
  // Background
  { pattern: /bg-white dark:bg-gray-950 /g, replace: 'bg-gray-50 dark:bg-gray-950 ' },
  { pattern: /bg-blue-950\/40/g, replace: 'bg-rose-50 dark:bg-rose-950/40' },
  { pattern: /border-blue-900\/50/g, replace: 'border-rose-200 dark:border-rose-800/50' },
  { pattern: /bg-blue-500\/20/g, replace: 'bg-rose-100 dark:bg-rose-500/20' },
];

files.forEach(file => {
  if (!fs.existsSync(file)) {
    console.log(`Skipped (not found): ${file}`);
    return;
  }
  let content = fs.readFileSync(file, 'utf8');
  let original = content;
  
  replacements.forEach(({ pattern, replace }) => {
    content = content.replace(pattern, replace);
  });
  
  if (content !== original) {
    fs.writeFileSync(file, content);
    console.log(`Updated ${file}`);
  } else {
    console.log(`No changes: ${file}`);
  }
});
