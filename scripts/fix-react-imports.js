#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Script to automatically add missing React imports to JSX/TSX files
 * Addresses the specific issue where files use React hooks but lack import statements
 */

function needsReactImport(content) {
  // Check if file uses React features but lacks React import
  const hasReactUsage = /\b(useState|useEffect|useCallback|useMemo|useRef|useContext|useReducer|JSX\.Element|React\.FC|React\.Component)\b/.test(content);
  const hasReactImport = /import\s+.*React.*from\s+['"]react['"]/.test(content);
  const hasReactRequire = /const\s+.*React.*=\s+require\(['"]react['"]\)/.test(content);
  
  return hasReactUsage && !hasReactImport && !hasReactRequire;
}

function addReactImport(content) {
  // Check if there are already imports
  const importMatch = content.match(/^import\s+.*from\s+['"][^'"]+['"];?\s*$/m);
  
  if (importMatch) {
    // Add React import after the first import
    const firstImportIndex = content.indexOf(importMatch[0]);
    const afterFirstImport = firstImportIndex + importMatch[0].length;
    return content.slice(0, afterFirstImport) + '\nimport React from \'react\';' + content.slice(afterFirstImport);
  } else {
    // Add React import at the beginning
    return 'import React from \'react\';\n\n' + content;
  }
}

function fixReactImportsInFile(filePath) {
  console.log(`🔍 Checking React imports in: ${path.relative(process.cwd(), filePath)}`);
  
  const content = fs.readFileSync(filePath, 'utf8');
  
  if (needsReactImport(content)) {
    console.log(`📝 Adding React import to: ${filePath}`);
    
    // Add React import
    const updatedContent = addReactImport(content);
    fs.writeFileSync(filePath, updatedContent);
    
    console.log(`✅ React import added to: ${filePath}`);
    console.log(`📁 Changes tracked by git - no backup files needed`);
    
    return { fixed: true, backup: null };
  } else {
    console.log(`✅ React import already present or not needed: ${filePath}`);
    return { fixed: false, backup: null };
  }
}

function scanDirectory(dir, extensions = ['.jsx', '.tsx']) {
  const results = [];
  
  function scan(currentDir) {
    if (!fs.existsSync(currentDir)) {
      return;
    }
    
    const files = fs.readdirSync(currentDir);
    
    files.forEach(file => {
      const filePath = path.join(currentDir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        scan(filePath);
      } else if (extensions.some(ext => file.endsWith(ext))) {
        const result = fixReactImportsInFile(filePath);
        if (result.fixed) {
          results.push({ file: filePath, ...result });
        }
      }
    });
  }
  
  scan(dir);
  return results;
}

function generateReport(results) {
  const report = [];
  
  report.push('=== React Import Fix Report ===');
  report.push(`Generated: ${new Date().toISOString()}`);
  report.push('');
  
  if (results.length === 0) {
    report.push('✅ No missing React imports found');
  } else {
    report.push(`📊 Fixed ${results.length} files with missing React imports:`);
    report.push('');
    
    results.forEach(({ file }) => {
      report.push(`✅ Fixed: ${file}`);
      report.push(`   Changes tracked by git`);
      report.push('');
    });
  }
  
  report.push('=== Summary ===');
  report.push(`Files processed: ${results.length}`);
  report.push(`React imports added: ${results.length}`);
  
  return report.join('\n');
}

function main() {
  const args = process.argv.slice(2);
  const directories = args.length > 0 ? args : ['src', 'components'];
  
  console.log('🔧 Fixing missing React imports...');
  
  let allResults = [];
  
  directories.forEach(dir => {
    if (fs.existsSync(dir)) {
      console.log(`📁 Scanning directory: ${dir}`);
      const results = scanDirectory(dir);
      allResults = allResults.concat(results);
    } else {
      console.log(`⚠️  Directory not found: ${dir}`);
    }
  });
  
  // Generate report
  const report = generateReport(allResults);
  const reportPath = 'react-imports-report.txt';
  fs.writeFileSync(reportPath, report);
  
  console.log(`📊 Report saved to ${reportPath}`);
  console.log(`✅ Fixed ${allResults.length} files with missing React imports`);
  
  if (allResults.length > 0) {
    console.log('\n📋 Files fixed:');
    allResults.forEach(({ file }) => {
      console.log(`   - ${path.relative(process.cwd(), file)}`);
    });
  }
}

if (require.main === module) {
  main();
}

module.exports = { fixReactImportsInFile, needsReactImport, addReactImport };