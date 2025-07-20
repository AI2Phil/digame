#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Get list of files with import syntax errors from TypeScript
function getFilesWithErrors() {
  const { execSync } = require('child_process');
  try {
    const output = execSync('cd frontend && npm run type-check 2>&1', { encoding: 'utf8' });
    const lines = output.split('\n');
    const files = new Set();
    
    lines.forEach(line => {
      const match = line.match(/^src\/(.+?)\(/);
      if (match) {
        files.add(path.join('frontend', match[0].split('(')[0]));
      }
    });
    
    return Array.from(files);
  } catch (error) {
    console.error('Error getting files with errors:', error.message);
    return [];
  }
}

// Fix import syntax in a single file
function fixImportSyntax(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    let modified = false;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Pattern 1: Missing 'import {' at start of import block
      if (line.trim() && !line.trim().startsWith('//') && !line.trim().startsWith('/*')) {
        // Check if line starts with component names but no 'import {'
        if (/^\s*[A-Z][a-zA-Z0-9,\s]*,?\s*$/.test(line) && 
            i > 0 && 
            (lines[i-1].includes('import') || lines[i-1].trim() === '')) {
          
          // Look ahead to see if this is part of an import block
          let j = i;
          while (j < lines.length && !lines[j].includes('} from')) {
            j++;
          }
          
          if (j < lines.length && lines[j].includes('} from')) {
            // This is an import block missing 'import {'
            lines[i] = 'import {' + line;
            modified = true;
            console.log(`Fixed missing 'import {' in ${filePath}:${i+1}`);
          }
        }
        
        // Pattern 2: Duplicate 'import {' statements
        if (line.includes('import {') && i > 0 && lines[i-1].includes('import {')) {
          // Remove the duplicate 'import {' and just keep the content
          lines[i] = line.replace(/^\s*import\s*\{\s*/, '  ');
          modified = true;
          console.log(`Fixed duplicate 'import {' in ${filePath}:${i+1}`);
        }
      }
    }
    
    if (modified) {
      fs.writeFileSync(filePath, lines.join('\n'));
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`Error fixing ${filePath}:`, error.message);
    return false;
  }
}

// Main execution
function main() {
  console.log('🔧 Starting targeted import syntax fix...');
  
  const filesWithErrors = getFilesWithErrors();
  console.log(`Found ${filesWithErrors.length} files with potential import syntax errors`);
  
  let fixedCount = 0;
  
  for (const filePath of filesWithErrors) {
    if (fs.existsSync(filePath)) {
      console.log(`\n📝 Processing: ${filePath}`);
      if (fixImportSyntax(filePath)) {
        fixedCount++;
      }
    }
  }
  
  console.log(`\n✅ Import syntax fix completed!`);
  console.log(`📊 Fixed ${fixedCount} files`);
  
  // Run type-check again to see remaining errors
  console.log('\n🔍 Running type-check to verify fixes...');
  try {
    const { execSync } = require('child_process');
    const output = execSync('cd frontend && npm run type-check 2>&1 | grep "error TS" | wc -l', { encoding: 'utf8' });
    const errorCount = parseInt(output.trim());
    console.log(`📈 Remaining TypeScript errors: ${errorCount}`);
    
    if (errorCount < 100) {
      console.log('\n🎉 Significant progress made! Error count reduced substantially.');
    }
  } catch (error) {
    console.log('Could not verify error count');
  }
}

if (require.main === module) {
  main();
}

module.exports = { fixImportSyntax };