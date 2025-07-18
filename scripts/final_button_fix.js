#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Final comprehensive script to fix Button onClick syntax issues
function finalButtonFix() {
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
    
    // Fix the specific malformed pattern: onClick={() => {} disabled={false}}
    // Should be: onClick={() => {}} disabled={false}
    const pattern1 = /onClick=\{\(\) => \{\} disabled=\{false\}\}/g;
    content = content.replace(pattern1, () => {
      modified = true;
      console.log(`  ✓ Fixed malformed onClick pattern`);
      return `onClick={() => {}} disabled={false}`;
    });
    
    // Fix pattern: onClick={() => functionCall() disabled={false}}
    // Should be: onClick={() => functionCall()} disabled={false}
    const pattern2 = /onClick=\{\(\) => ([^}]+\([^)]*\)) disabled=\{false\}\}/g;
    content = content.replace(pattern2, (match, functionCall) => {
      modified = true;
      console.log(`  ✓ Fixed onClick with function call: ${functionCall}`);
      return `onClick={() => ${functionCall}} disabled={false}`;
    });
    
    // Fix pattern: onClick={() => createNote({} disabled={false})}
    // Should be: onClick={() => createNote({})} disabled={false}
    const pattern3 = /onClick=\{\(\) => ([^(]+)\(\{\} disabled=\{false\}\)\}/g;
    content = content.replace(pattern3, (match, functionName) => {
      modified = true;
      console.log(`  ✓ Fixed onClick with object parameter: ${functionName}`);
      return `onClick={() => ${functionName}({})} disabled={false}`;
    });
    
    if (modified) {
      fs.writeFileSync(filePath, content);
      console.log(`  ✅ File updated: ${path.relative(process.cwd(), filePath)}`);
    }
  }
  
  console.log('🔧 Starting final Button fixes...\n');
  processDirectory(frontendDir);
  console.log('\n✅ Final Button fixes completed!');
}

// Run the script
finalButtonFix();