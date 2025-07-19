#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Script to detect and report hooks in utility files
 * These need manual refactoring as hooks cannot be used outside React components
 */

function analyzeUtilityFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const issues = [];
  
  // Detect hook usage patterns
  const hookPatterns = [
    /useState\s*\(/g,
    /useEffect\s*\(/g,
    /useCallback\s*\(/g,
    /useMemo\s*\(/g,
    /useRef\s*\(/g,
    /useContext\s*\(/g,
    /useReducer\s*\(/g,
    /use[A-Z][a-zA-Z]*\s*\(/g // Custom hooks
  ];
  
  const lines = content.split('\n');
  
  hookPatterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      const lineNumber = content.substring(0, match.index).split('\n').length;
      const line = lines[lineNumber - 1];
      
      issues.push({
        type: 'hook_in_utility',
        line: lineNumber,
        content: line.trim(),
        hook: match[0].replace(/\s*\(/, ''),
        suggestion: getRefactoringSuggestion(match[0])
      });
    }
  });
  
  return issues;
}

function getRefactoringSuggestion(hookName) {
  const suggestions = {
    'useState': 'Move to a custom hook or React component',
    'useEffect': 'Move to a custom hook or React component',
    'useCallback': 'Convert to regular function or move to custom hook',
    'useMemo': 'Convert to regular memoization or move to custom hook',
    'useRef': 'Move to React component or use regular variable',
    'useContext': 'Move to React component or custom hook'
  };
  
  const cleanHook = hookName.replace(/\s*\(/, '');
  return suggestions[cleanHook] || 'Move to a custom hook file (src/hooks/) or React component';
}

function generateRefactoringReport(utilityFiles) {
  const report = [];
  
  report.push('=== Utility Files Hook Refactoring Report ===');
  report.push(`Generated: ${new Date().toISOString()}`);
  report.push('');
  
  let totalIssues = 0;
  
  utilityFiles.forEach(({ file, issues }) => {
    if (issues.length > 0) {
      report.push(`📁 File: ${file}`);
      report.push(`   Issues: ${issues.length}`);
      
      issues.forEach(issue => {
        report.push(`   ❌ Line ${issue.line}: ${issue.hook}`);
        report.push(`      Code: ${issue.content}`);
        report.push(`      Fix: ${issue.suggestion}`);
        report.push('');
      });
      
      totalIssues += issues.length;
    }
  });
  
  if (totalIssues === 0) {
    report.push('✅ No hooks found in utility files');
  } else {
    report.push('=== Summary ===');
    report.push(`Total files with issues: ${utilityFiles.filter(f => f.issues.length > 0).length}`);
    report.push(`Total hook violations: ${totalIssues}`);
    report.push('');
    report.push('=== Recommended Actions ===');
    report.push('1. Create custom hooks in src/hooks/ directory');
    report.push('2. Move component-specific logic to React components');
    report.push('3. Convert hooks to regular functions where possible');
    report.push('4. Use React Context for shared state management');
  }
  
  return report.join('\n');
}

function main() {
  const args = process.argv.slice(2);
  const utilityDir = args[0] || 'utils';
  
  if (!fs.existsSync(utilityDir)) {
    console.log(`✅ No ${utilityDir} directory found - no utility hook issues`);
    return;
  }
  
  console.log(`🔍 Scanning ${utilityDir} for hook usage...`);
  
  const utilityFiles = [];
  
  // Find all JS/TS files in utils directory
  function scanDirectory(dir) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        scanDirectory(filePath);
      } else if (/\.(js|ts|jsx|tsx)$/.test(file)) {
        const issues = analyzeUtilityFile(filePath);
        utilityFiles.push({ file: filePath, issues });
        
        if (issues.length > 0) {
          console.log(`⚠️  Found ${issues.length} hook violations in ${filePath}`);
        }
      }
    });
  }
  
  scanDirectory(utilityDir);
  
  // Generate report
  const report = generateRefactoringReport(utilityFiles);
  
  // Write report to file
  const reportPath = 'utility-hooks-report.txt';
  fs.writeFileSync(reportPath, report);
  
  console.log(`📊 Report saved to ${reportPath}`);
  
  const totalIssues = utilityFiles.reduce((sum, f) => sum + f.issues.length, 0);
  
  if (totalIssues > 0) {
    console.log(`❌ Found ${totalIssues} hook violations in utility files`);
    console.log('These require manual refactoring - see report for details');
    process.exit(1);
  } else {
    console.log('✅ No hook violations found in utility files');
  }
}

if (require.main === module) {
  main();
}

module.exports = { analyzeUtilityFile, generateRefactoringReport };