const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    const dirPath = path.join(dir, f);
    const isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      walkDir(dirPath, callback);
    } else {
      if (f.endsWith('.tsx') || f.endsWith('.ts')) {
        callback(dirPath);
      }
    }
  });
}

function processFiles() {
  const srcDir = path.join(__dirname, 'src');
  let replacedCount = 0;

  walkDir(srcDir, (filePath) => {
    // Skip Container.tsx itself since we already updated it
    if (filePath.includes('Container.tsx')) return;
    
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Pattern to match common container classes:
    // e.g. "mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8"
    // e.g. "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
    
    // We will do a generic replacement for the max-w part if it's large:
    content = content.replace(/\bmax-w-(7xl|6xl|5xl|350|\[1200px\]|\[1100px\])\b/g, 'max-w-[1400px]');
    
    // Replace padding combos often used with these containers
    content = content.replace(/\bpx-4 sm:px-6 lg:px-8\b/g, 'px-4 md:px-8');

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      replacedCount++;
      console.log(`Updated ${filePath}`);
    }
  });

  console.log(`Total files updated: ${replacedCount}`);
}

processFiles();
