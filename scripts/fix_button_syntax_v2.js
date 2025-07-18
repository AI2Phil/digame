#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Script to fix specific Button onClick syntax errors
function fixButtonSyntaxV2() {
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
    
    // Fix pattern: onClick={() => {} disabled={false}} 
    // Should be: onClick={() => {}} disabled={false}
    const pattern1 = /onClick=\{\(\) => \{\} disabled=\{false\}\}/g;
    content = content.replace(pattern1, () => {
      modified = true;
      console.log(`  ✓ Fixed onClick={() => {} disabled={false}}`);
      return `onClick={() => {}} disabled={false}`;
    });
    
    // Fix pattern: onClick={() => createNote({} disabled={false})}
    // Should be: onClick={() => createNote({})} disabled={false}
    const pattern2 = /onClick=\{\(\) => ([^(]+)\(\{\} disabled=\{false\}\)\}/g;
    content = content.replace(pattern2, (match, functionName) => {
      modified = true;
      console.log(`  ✓ Fixed onClick with function call: ${functionName}`);
      return `onClick={() => ${functionName}({})} disabled={false}`;
    });
    
    // Fix pattern: } disabled={false} else {
    // Should be: } else {
    const pattern3 = /\} disabled=\{false\} else \{/g;
    content = content.replace(pattern3, () => {
      modified = true;
      console.log(`  ✓ Fixed } disabled={false} else {`);
      return `} else {`;
    });
    
    if (modified) {
      fs.writeFileSync(filePath, content);
      console.log(`  ✅ File updated: ${path.relative(process.cwd(), filePath)}`);
    }
  }
  
  console.log('🔧 Starting Button syntax fixes v2...\n');
  processDirectory(frontendDir);
  console.log('\n✅ Button syntax fixes v2 completed!');
}

// Run the script
fixButtonSyntaxV2();