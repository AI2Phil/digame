#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Script to remove duplicate disabled attributes
function removeDuplicateDisabled() {
  const frontendDir = path.join(__dirname, '..', 'frontend', 'src', 'pages');
  
  function processDirectory(dir) {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        processDirectory(fullPath);
      } else if (item.endsWith('.tsx')) {
        processFile(fullPath);
      }
    }
  }
  
  function processFile(filePath) {
    console.log(`Processing: ${filePath}`);
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Remove duplicate disabled={false} disabled={false}
    const duplicateDisabledPattern = /disabled=\{false\}\s+disabled=\{false\}/g;
    content = content.replace(duplicateDisabledPattern, () => {
      modified = true;
      console.log(`  ✓ Removed duplicate disabled attributes`);
      return `disabled={false}`;
    });
    
    // Remove duplicate disabled with different values: disabled={something} disabled={false}
    const duplicateDisabledPattern2 = /disabled=\{[^}]+\}\s+disabled=\{false\}/g;
    content = content.replace(duplicateDisabledPattern2, (match) => {
      const firstDisabled = match.split(' ')[0];
      modified = true;
      console.log(`  ✓ Removed duplicate disabled with different values`);
      return firstDisabled;
    });
    
    if (modified) {
      fs.writeFileSync(filePath, content);
      console.log(`  ✅ File updated: ${path.relative(process.cwd(), filePath)}`);
    }
  }
  
  console.log('🔧 Starting duplicate disabled removal...\n');
  processDirectory(frontendDir);
  console.log('\n✅ Duplicate disabled removal completed!');
}

// Run the script
removeDuplicateDisabled();