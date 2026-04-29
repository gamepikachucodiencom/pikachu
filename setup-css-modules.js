/**
 * setup-css-modules.js
 * Scans 'app', 'components', and 'lib' directories.
 * Creates a matching .module.css file for every .tsx file found.
 * * Updates:
 * - Now includes page.tsx and layout.tsx
 * - recursive directory scanning
 */
const fs = require('fs');
const path = require('path');

// Directories to scan
const DIRS_TO_SCAN = ['app', 'components', 'lib'];

// Files to completely ignore (e.g., strict config files)
const IGNORE_FILES = ['registry.tsx', 'route.ts', 'middleware.ts'];

function walkDir(dir) {
  try {
    const files = fs.readdirSync(dir);

    files.forEach((file) => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        // Recursively scan subdirectories (excluding node_modules or .next)
        if (file !== 'node_modules' && file !== '.next') {
          walkDir(filePath);
        }
      } else if (
        (file.endsWith('.tsx') || file.endsWith('.jsx')) &&
        !IGNORE_FILES.includes(file)
      ) {
        createCssModule(dir, file);
      }
    });
  } catch (err) {
    console.error(`Error processing directory ${dir}:`, err.message);
  }
}

function createCssModule(dir, file) {
  const componentName = file.replace(/\.(tsx|jsx)$/, '');
  const cssFileName = `${componentName}.module.css`;
  const cssFilePath = path.join(dir, cssFileName);

  // Skip if file already exists (don't overwrite your work)
  if (fs.existsSync(cssFilePath)) {
    return;
  }

  console.log(`[Created] ${cssFilePath}`);

  // Smart template: specific comment for 'page' vs 'component'
  let content = `/* Styles for ${componentName} */\n`;

  if (componentName === 'page') {
    content += `.main {\n  padding: var(--spacing-md);\n  min-height: 100vh;\n}\n`;
  } else if (componentName === 'layout') {
    content += `.container {\n  max-width: 1200px;\n  margin: 0 auto;\n}\n`;
  } else {
    content += `.container {\n  display: flex;\n  /* Add styles here */\n}\n`;
  }

  fs.writeFileSync(cssFilePath, content);
}

console.log('--- 🚀 Starting CSS Module Scaffolding ---');
DIRS_TO_SCAN.forEach((dir) => {
  if (fs.existsSync(dir)) walkDir(dir);
  else console.warn(`Warning: Directory '${dir}' not found.`);
});
console.log('--- ✅ Complete. Ready for Cursor Refactor. ---');
