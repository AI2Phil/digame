#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Remaining files that need fixing based on Prettier errors
const MALFORMED_FILES = [
  'digital-twin/interaction.tsx',
  'digital-twin/overview.tsx',
  'digital-twin/patterns.tsx',
  'digital-twin/predictions.tsx',
  'digital-twin/real-time.tsx',
  'digital-twin/settings.tsx',
  'digital-twin/simulation.tsx',
  'digital-twin/team-coordination.tsx',
  'digital-twin/workspace.tsx',
  'social/index.tsx'
];

const PAGES_DIR = 'frontend/src/pages';
const BACKUP_DIR = 'scripts/backups/batch_component_fixes';

// Ensure backup directory exists
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

function logChange(filePath, description) {
  console.log(`[${new Date().toISOString()}] INFO: ${description} for ${filePath}`);
  console.log(`[${new Date().toISOString()}] INFO: Changes tracked by git - no backup files needed`);
}

function fixMalformedComponent(content) {
  let fixed = content;
  let changes = [];

  // Pattern 1: Fix duplicate function declarations with malformed structure
  // Look for pattern: const ComponentName: React.FC = () => { return ( // Fixed malformed component <div>...</div> ); }; const ComponentName: React.FC = () => { <JSX> ); }
  const duplicatePattern = /const\s+(\w+):\s*React\.FC\s*=\s*\(\)\s*=>\s*\{\s*return\s*\(\s*\/\/\s*Fixed\s+malformed\s+component[\s\S]*?\);\s*\};\s*const\s+\1:\s*React\.FC\s*=\s*\(\)\s*=>\s*\{\s*([\s\S]*?)\s*\);\s*\}/;
  
  const duplicateMatch = fixed.match(duplicatePattern);
  if (duplicateMatch) {
    const componentName = duplicateMatch[1];
    const jsxContent = duplicateMatch[2].trim();
    
    // Create proper component structure
    const properComponent = `const ${componentName}: React.FC = () => {
  return (
    ${jsxContent}
  );
};`;
    
    fixed = fixed.replace(duplicatePattern, properComponent);
    changes.push('Fixed duplicate function declarations and malformed structure');
  }

  // Pattern 2: Fix missing return statement
  const missingReturnPattern = /const\s+(\w+):\s*React\.FC\s*=\s*\(\)\s*=>\s*\{\s*(<[\s\S]*?>[\s\S]*?<\/[\s\S]*?>)\s*\);\s*\}/;
  const missingReturnMatch = fixed.match(missingReturnPattern);
  if (missingReturnMatch) {
    const componentName = missingReturnMatch[1];
    const jsxContent = missingReturnMatch[2];
    
    const properComponent = `const ${componentName}: React.FC = () => {
  return (
    ${jsxContent}
  );
};`;
    
    fixed = fixed.replace(missingReturnPattern, properComponent);
    changes.push('Added missing return statement');
  }

  // Pattern 3: Fix malformed JSX structure
  const malformedJSXPattern = /const\s+(\w+):\s*React\.FC\s*=\s*\(\)\s*=>\s*\{\s*\n\s*(<[\s\S]*?)\s*\);\s*\}/;
  const malformedJSXMatch = fixed.match(malformedJSXPattern);
  if (malformedJSXMatch) {
    const componentName = malformedJSXMatch[1];
    const jsxContent = malformedJSXMatch[2];
    
    const properComponent = `const ${componentName}: React.FC = () => {
  return (
    ${jsxContent}
  );
};`;
    
    fixed = fixed.replace(malformedJSXPattern, properComponent);
    changes.push('Fixed malformed JSX structure');
  }

  return { content: fixed, changes };
}

async function main() {
  console.log(`[${new Date().toISOString()}] INFO: 🔧 Starting Batch Component Fixes for ${MALFORMED_FILES.length} Files`);
  console.log(`[${new Date().toISOString()}] INFO: 📁 Target Directory: ${PAGES_DIR}`);
  
  let successCount = 0;
  let errorCount = 0;
  const results = [];

  for (let i = 0; i < MALFORMED_FILES.length; i++) {
    const relativePath = MALFORMED_FILES[i];
    const fullPath = path.join(PAGES_DIR, relativePath);
    
    console.log(`[${new Date().toISOString()}] INFO: 🔧 Fixing (${i + 1}/${MALFORMED_FILES.length}): ${relativePath}`);
    
    try {
      if (!fs.existsSync(fullPath)) {
        console.log(`[${new Date().toISOString()}] WARN:    ⚠️  File not found: ${fullPath}`);
        continue;
      }

      const originalContent = fs.readFileSync(fullPath, 'utf8');
      
      const { content: fixedContent, changes } = fixMalformedComponent(originalContent);
      
      if (changes.length > 0) {
        fs.writeFileSync(fullPath, fixedContent, 'utf8');
        logChange(relativePath, 'Fixed malformed component');
        console.log(`[${new Date().toISOString()}] SUCCESS:    ✅ Fixed successfully`);
        console.log(`[${new Date().toISOString()}] INFO:    📊 Size: ${originalContent.length} → ${fixedContent.length} chars (${fixedContent.length - originalContent.length >= 0 ? '+' : ''}${fixedContent.length - originalContent.length})`);
        console.log(`[${new Date().toISOString()}] INFO:    🔧 Changes: ${changes.join(', ')}`);
        successCount++;
        
        results.push({
          file: relativePath,
          status: 'success',
          changes: changes,
          originalSize: originalContent.length,
          newSize: fixedContent.length
        });
      } else {
        console.log(`[${new Date().toISOString()}] INFO:    ⏭️  No changes needed`);
        results.push({
          file: relativePath,
          status: 'no_changes',
          changes: [],
          originalSize: originalContent.length,
          newSize: originalContent.length
        });
      }
      
    } catch (error) {
      console.log(`[${new Date().toISOString()}] ERROR:    ❌ Error fixing ${relativePath}: ${error.message}`);
      errorCount++;
      
      results.push({
        file: relativePath,
        status: 'error',
        error: error.message,
        changes: []
      });
    }
  }

  // Generate summary
  console.log(`[${new Date().toISOString()}] INFO: 📋 BATCH COMPONENT FIXES SUMMARY`);
  console.log(`[${new Date().toISOString()}] INFO: ============================================================`);
  console.log(`[${new Date().toISOString()}] SUCCESS: ✅ Successfully fixed: ${successCount} files`);
  console.log(`[${new Date().toISOString()}] ERROR: ❌ Errors encountered: ${errorCount} files`);
  console.log(`[${new Date().toISOString()}] INFO: 📊 Total files processed: ${MALFORMED_FILES.length} files`);
  console.log(`[${new Date().toISOString()}] INFO: 🎯 Success rate: ${((successCount / MALFORMED_FILES.length) * 100).toFixed(1)}%`);

  if (successCount > 0) {
    console.log(`[${new Date().toISOString()}] SUCCESS: \n🎉 BATCH COMPONENT FIXES COMPLETED!`);
    console.log(`[${new Date().toISOString()}] SUCCESS: 🔧 ${successCount} files now have proper component structure`);
  }

  if (errorCount > 0) {
    console.log(`[${new Date().toISOString()}] WARN: \n⚠️  ${errorCount} files still need manual review`);
  }

  console.log(`[${new Date().toISOString()}] INFO: \n📝 Next steps:`);
  console.log(`[${new Date().toISOString()}] INFO:    1. Run Prettier formatting: node scripts/format_restored_pages.js`);
  console.log(`[${new Date().toISOString()}] INFO:    2. Test application functionality`);
  console.log(`[${new Date().toISOString()}] INFO:    3. Verify all pages load correctly`);

  // Save detailed report
  const reportPath = 'scripts/batch_component_fixes_report.json';
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalFiles: MALFORMED_FILES.length,
      successCount,
      errorCount,
      successRate: ((successCount / MALFORMED_FILES.length) * 100).toFixed(1) + '%'
    },
    results
  };

  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`[${new Date().toISOString()}] INFO: 📊 Detailed fix report saved: ${reportPath}`);
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { fixMalformedComponent };