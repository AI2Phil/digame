#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Script to fix specific onClick syntax pattern
function fixOnClickSyntax() {
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
    
    // Fix pattern: onClick={() = disabled={false}> function()} 
    // Should be: onClick={() => function()} disabled={false}
    const pattern1 = /onClick=\{\(\) = disabled=\{false\}> ([^}]+)\}/g;
    content = content.replace(pattern1, (match, functionCall) => {
      modified = true;
      console.log(`  ✓ Fixed onClick syntax: ${functionCall}`);
      return `onClick={() => ${functionCall}} disabled={false}`;
    });
    
    // Fix pattern: onClick={() = disabled={false}> {}} 
    // Should be: onClick={() => {}} disabled={false}
    const pattern2 = /onClick=\{\(\) = disabled=\{false\}> \{\}\}/g;
    content = content.replace(pattern2, () => {
      modified = true;
      console.log(`  ✓ Fixed onClick empty function`);
      return `onClick={() => {}} disabled={false}`;
    });
    
    // Fix pattern: onClick={(e) = disabled={false}> { ... }}
    // Should be: onClick={(e) => { ... }} disabled={false}
    const pattern3 = /onClick=\{\(e\) = disabled=\{false\}> \{([^}]*)\}\}/g;
    content = content.replace(pattern3, (match, functionBody) => {
      modified = true;
      console.log(`  ✓ Fixed onClick with event parameter`);
      return `onClick={(e) => { ${functionBody} }} disabled={false}`;
    });
    
    if (modified) {
      fs.writeFileSync(filePath, content);
      console.log(`  ✅ File updated: ${path.relative(process.cwd(), filePath)}`);
    }
  }
  
  console.log('🔧 Starting onClick syntax fixes...\n');
  processDirectory(frontendDir);
  console.log('\n✅ onClick syntax fixes completed!');
}

// Run the script
fixOnClickSyntax();