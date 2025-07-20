#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

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

function fixImportSyntaxErrors() {
  let totalFixed = 0;
  
  console.log('🔧 Finding and fixing all import syntax errors...\n');
  
  // Find all JSX/TSX files in frontend/src
  const allFiles = findAllJsxFiles('frontend/src');
  console.log(`📁 Found ${allFiles.length} JSX/TSX files to check\n`);
  
  allFiles.forEach(filePath => {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n');
      let fixed = false;
      let fixedLines = [];
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmedLine = line.trim();
        
        // Pattern 1: Standalone "import { apiClient, replaceApiUrl } from '../../lib/api-config';" in wrong place
        if (trimmedLine.includes("import { apiClient, replaceApiUrl } from") && 
            i > 10 && // Not in the import section at top
            !lines.slice(0, i).some(l => l.trim() === "import { apiClient, replaceApiUrl } from '../../lib/api-config';")) {
          
          console.log(`🔧 Moving misplaced api-config import in: ${filePath}`);
          
          // Find the end of existing imports
          let importEndIndex = 0;
          for (let j = 0; j < lines.length; j++) {
            if (lines[j].trim().startsWith('import ') || 
                lines[j].trim().startsWith('} from ') ||
                (lines[j].trim() === '' && j > 0 && lines[j-1].trim().startsWith('import '))) {
              importEndIndex = j;
            } else if (lines[j].trim() !== '' && !lines[j].trim().startsWith('import ') && !lines[j].trim().startsWith('} from ')) {
              break;
            }
          }
          
          // Add the import at the correct location
          fixedLines = [
            ...lines.slice(0, importEndIndex + 1),
            "import { apiClient, replaceApiUrl } from '../../lib/api-config';",
            ...lines.slice(importEndIndex + 1, i),
            ...lines.slice(i + 1) // Skip the misplaced import
          ];
          
          fixed = true;
          break;
        }
        
        // Pattern 2: Incomplete "import {" followed by api-config import
        if (trimmedLine === 'import {' && 
            lines[i + 1] && 
            lines[i + 1].includes("import { apiClient, replaceApiUrl } from")) {
          
          console.log(`🔧 Fixing incomplete import + api-config in: ${filePath}`);
          
          // Remove the incomplete "import {" line and keep the api-config import
          fixedLines = [
            ...lines.slice(0, i),
            lines[i + 1], // Keep the api-config import
            ...lines.slice(i + 2)
          ];
          
          fixed = true;
          break;
        }
        
        // Pattern 3: Missing opening "import {" for icon imports
        if ((trimmedLine.startsWith('User, ') || 
             trimmedLine.startsWith('BarChart3, ') ||
             trimmedLine.startsWith('Search, ') ||
             trimmedLine.startsWith('Card,')) &&
            !lines[i - 1]?.trim().startsWith('import {')) {
          
          console.log(`🔧 Adding missing import opening in: ${filePath}`);
          
          fixedLines = [
            ...lines.slice(0, i),
            'import {',
            ...lines.slice(i)
          ];
          
          fixed = true;
          break;
        }
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
  
  console.log(`\n🎉 Fixed ${totalFixed} files with import syntax errors!`);
  
  if (totalFixed > 0) {
    console.log('\n📋 Summary of fixes:');
    console.log('- Moved misplaced api-config imports to proper location');
    console.log('- Removed incomplete import statements');
    console.log('- Added missing import statement openings');
    console.log('- Fixed syntax errors causing build failures');
  }
}

// Run the fix
fixImportSyntaxErrors();