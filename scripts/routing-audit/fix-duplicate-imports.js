#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function findAllJsxFiles(dir) {
  const files = [];
  
  function traverse(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        traverse(fullPath);
      } else if (stat.isFile() && (item.endsWith('.jsx') || item.endsWith('.tsx'))) {
        files.push(fullPath);
      }
    }
  }
  
  traverse(dir);
  return files;
}

function fixDuplicateImports() {
  let totalFixed = 0;
  
  console.log('🔧 Fixing duplicate import statements...\n');
  
  // Find all JSX/TSX files in frontend/src
  const allFiles = findAllJsxFiles('frontend/src');
  
  allFiles.forEach(filePath => {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n');
      let fixed = false;
      let fixedLines = [];
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmedLine = line.trim();
        
        // Look for duplicate "import {" statements
        if (trimmedLine === 'import {' && 
            lines[i + 1] && 
            lines[i + 1].trim() !== '' &&
            !lines[i + 1].trim().startsWith('import {') &&
            lines.slice(i + 1).some((l, idx) => l.trim() === 'import {' && idx < 10)) {
          
          // Find the next "import {" and remove this duplicate
          console.log(`🔧 Removing duplicate import opening in: ${filePath}`);
          
          // Skip this duplicate import line
          fixed = true;
          continue;
        }
        
        // Look for missing opening "import {" before icon lists
        if (!trimmedLine.startsWith('import {') && 
            (trimmedLine.includes('User, Mail, Calendar') ||
             trimmedLine.includes('UserCheck, TrendingUp') ||
             trimmedLine.includes('Brain, Zap, TrendingUp') ||
             trimmedLine.includes('Box,') ||
             trimmedLine.includes('Smartphone, Tablet'))) {
          
          console.log(`🔧 Adding missing import opening before: ${trimmedLine.substring(0, 30)}... in ${filePath}`);
          
          fixedLines.push('import {');
          fixedLines.push(line);
          fixed = true;
          continue;
        }
        
        fixedLines.push(line);
      }
      
      if (fixed) {
        fs.writeFileSync(filePath, fixedLines.join('\n'));
        console.log(`✅ Fixed: ${filePath}\n`);
        totalFixed++;
      }
      
    } catch (error) {
      console.error(`❌ Error processing ${filePath}:`, error.message);
    }
  });
  
  console.log(`\n🎉 Fixed ${totalFixed} files with duplicate import issues!`);
}

// Run the fix
fixDuplicateImports();