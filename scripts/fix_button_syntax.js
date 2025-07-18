#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Script to fix malformed Button onClick syntax
function fixButtonSyntax() {
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
    
    // Fix malformed onClick syntax: onClick={() = disabled={false}> function()} 
    // Should be: onClick={() => function()} disabled={false}
    const malformedPattern = /onClick=\{\(\) = disabled=\{false\}> ([^}]+)\}/g;
    content = content.replace(malformedPattern, (match, functionCall) => {
      modified = true;
      console.log(`  ✓ Fixed malformed onClick: ${functionCall}`);
      return `onClick={() => ${functionCall}} disabled={false}`;
    });
    
    // Fix another pattern: onClick={e = disabled={false}> { ... }}
    const malformedPattern2 = /onClick=\{e = disabled=\{false\}> \{([^}]+)\}\}/g;
    content = content.replace(malformedPattern2, (match, functionBody) => {
      modified = true;
      console.log(`  ✓ Fixed malformed onClick with event: ${functionBody}`);
      return `onClick={(e) => { ${functionBody} }} disabled={false}`;
    });
    
    // Fix simple cases where onClick is missing the arrow function
    const simplePattern = /onClick=\{\(\) = disabled=\{false\}>/g;
    content = content.replace(simplePattern, () => {
      modified = true;
      console.log(`  ✓ Fixed simple malformed onClick`);
      return `onClick={() => {}} disabled={false}`;
    });
    
    if (modified) {
      fs.writeFileSync(filePath, content);
      console.log(`  ✅ File updated: ${path.relative(process.cwd(), filePath)}`);
    }
  }
  
  console.log('🔧 Starting Button syntax fixes...\n');
  processDirectory(frontendDir);
  console.log('\n✅ Button syntax fixes completed!');
}

// Run the script
fixButtonSyntax();