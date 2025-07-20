#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// List of files with remaining syntax errors from Prettier output
const FAILED_FILES = [
  'ai-tools/email.tsx',
  'ai-tools/meetings.tsx',
  'digital-twin/insights.tsx',
  'digital-twin/interaction.tsx',
  'digital-twin/overview.tsx',
  'digital-twin/patterns.tsx',
  'digital-twin/predictions.tsx',
  'digital-twin/real-time.tsx',
  'digital-twin/settings.tsx',
  'digital-twin/simulation.tsx',
  'digital-twin/team-coordination.tsx',
  'digital-twin/workspace.tsx',
  'enterprise/multi-tenancy.tsx',
  'enterprise/multi-tenant.tsx',
  'social/index.tsx'
];

const PAGES_DIR = 'frontend/src/pages';
const BACKUP_DIR = 'scripts/backups/syntax_fixes_final';

// Ensure backup directory exists
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

function logChange(filePath, description) {
  console.log(`[${new Date().toISOString()}] INFO: ${description} for ${filePath}`);
  console.log(`[${new Date().toISOString()}] INFO: Changes tracked by git - no backup files needed`);
}

function fixSyntaxErrors(content, filePath) {
  let fixed = content;
  let changes = [];

  // Fix 1: Invalid component names with hyphens (enterprise files)
  if (filePath.includes('multi-tenancy.tsx') || filePath.includes('multi-tenant.tsx')) {
    // Fix component name with hyphens
    const oldPattern = /const Multi-(\w+)/g;
    const newPattern = 'const Multi$1';
    if (oldPattern.test(fixed)) {
      fixed = fixed.replace(oldPattern, newPattern);
      changes.push('Fixed component name with hyphens');
    }

    // Fix interface name with hyphens
    const oldInterfacePattern = /Multi-(\w+)PageProps/g;
    const newInterfacePattern = 'Multi$1PageProps';
    if (oldInterfacePattern.test(fixed)) {
      fixed = fixed.replace(oldInterfacePattern, newInterfacePattern);
      changes.push('Fixed interface name with hyphens');
    }
  }

  // Fix 2: Missing function declaration for components
  const componentExportPattern = /export default (\w+);/;
  const componentMatch = fixed.match(componentExportPattern);
  
  if (componentMatch) {
    const componentName = componentMatch[1];
    
    // Check if component is properly declared
    const componentDeclarationPattern = new RegExp(`const ${componentName}[\\s]*[:=]`);
    const functionDeclarationPattern = new RegExp(`function ${componentName}\\s*\\(`);
    
    if (!componentDeclarationPattern.test(fixed) && !functionDeclarationPattern.test(fixed)) {
      // Find the JSX return statement and wrap it in a proper function
      const jsxReturnPattern = /return\s*\(\s*<[^>]+>[\s\S]*?<\/[^>]+>\s*\);/;
      const jsxMatch = fixed.match(jsxReturnPattern);
      
      if (jsxMatch) {
        const jsxContent = jsxMatch[0];
        const functionDeclaration = `const ${componentName}: React.FC = () => {\n  ${jsxContent}\n};\n`;
        
        // Replace the standalone return statement with proper function
        fixed = fixed.replace(jsxReturnPattern, functionDeclaration);
        changes.push('Added proper function declaration');
      }
    }
  }

  // Fix 3: Malformed JSX structure - ensure proper closing
  const jsxOpenTags = (fixed.match(/<[^/][^>]*>/g) || []).length;
  const jsxCloseTags = (fixed.match(/<\/[^>]*>/g) || []).length;
  const selfClosingTags = (fixed.match(/<[^>]*\/>/g) || []).length;
  
  if (jsxOpenTags !== jsxCloseTags + selfClosingTags) {
    // Try to fix common missing closing tags
    const commonTags = ['div', 'QueryClientProvider', 'ToastProvider', 'DashboardLayout'];
    
    for (const tag of commonTags) {
      const openCount = (fixed.match(new RegExp(`<${tag}[^>]*>`, 'g')) || []).length;
      const closeCount = (fixed.match(new RegExp(`</${tag}>`, 'g')) || []).length;
      
      if (openCount > closeCount) {
        // Add missing closing tags before the return statement end
        const returnEndPattern = /(\s*\);\s*}?\s*export)/;
        if (returnEndPattern.test(fixed)) {
          const missingCloseTags = Array(openCount - closeCount).fill(`</${tag}>`).join('\n    ');
          fixed = fixed.replace(returnEndPattern, `\n    ${missingCloseTags}$1`);
          changes.push(`Added missing </${tag}> closing tags`);
        }
      }
    }
  }

  // Fix 4: Ensure proper React import
  if (!fixed.includes('import React') && fixed.includes('React.FC')) {
    fixed = `import React from 'react';\n${fixed}`;
    changes.push('Added React import');
  }

  // Fix 5: Fix malformed return statements
  const malformedReturnPattern = /return\s*\(\s*<[\s\S]*?\s*\);\s*}\s*export/;
  if (malformedReturnPattern.test(fixed)) {
    // Ensure proper structure
    fixed = fixed.replace(/(\s*\);\s*)(}\s*export)/, '$1\n$2');
    changes.push('Fixed malformed return statement structure');
  }

  return { content: fixed, changes };
}

async function main() {
  console.log(`[${new Date().toISOString()}] INFO: 🔧 Starting Final Syntax Error Fixes for ${FAILED_FILES.length} Files`);
  console.log(`[${new Date().toISOString()}] INFO: 📁 Target Directory: ${PAGES_DIR}`);
  
  let successCount = 0;
  let errorCount = 0;
  const results = [];

  for (let i = 0; i < FAILED_FILES.length; i++) {
    const relativePath = FAILED_FILES[i];
    const fullPath = path.join(PAGES_DIR, relativePath);
    
    console.log(`[${new Date().toISOString()}] INFO: 🔧 Fixing (${i + 1}/${FAILED_FILES.length}): ${relativePath}`);
    
    try {
      if (!fs.existsSync(fullPath)) {
        console.log(`[${new Date().toISOString()}] WARN:    ⚠️  File not found: ${fullPath}`);
        continue;
      }

      const originalContent = fs.readFileSync(fullPath, 'utf8');
      
      const { content: fixedContent, changes } = fixSyntaxErrors(originalContent, relativePath);
      
      if (changes.length > 0) {
        fs.writeFileSync(fullPath, fixedContent, 'utf8');
        logChange(relativePath, 'Fixed syntax errors');
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
  console.log(`[${new Date().toISOString()}] INFO: 📋 FINAL SYNTAX FIXES SUMMARY`);
  console.log(`[${new Date().toISOString()}] INFO: ============================================================`);
  console.log(`[${new Date().toISOString()}] SUCCESS: ✅ Successfully fixed: ${successCount} files`);
  console.log(`[${new Date().toISOString()}] ERROR: ❌ Errors encountered: ${errorCount} files`);
  console.log(`[${new Date().toISOString()}] INFO: 📊 Total files processed: ${FAILED_FILES.length} files`);
  console.log(`[${new Date().toISOString()}] INFO: 🎯 Success rate: ${((successCount / FAILED_FILES.length) * 100).toFixed(1)}%`);

  if (successCount > 0) {
    console.log(`[${new Date().toISOString()}] SUCCESS: \n🎉 FINAL SYNTAX FIXES COMPLETED!`);
    console.log(`[${new Date().toISOString()}] SUCCESS: 🔧 ${successCount} files now have corrected syntax`);
  }

  if (errorCount > 0) {
    console.log(`[${new Date().toISOString()}] WARN: \n⚠️  ${errorCount} files still need manual review`);
  }

  console.log(`[${new Date().toISOString()}] INFO: \n📝 Next steps:`);
  console.log(`[${new Date().toISOString()}] INFO:    1. Run Prettier formatting again: node scripts/format_restored_pages.js`);
  console.log(`[${new Date().toISOString()}] INFO:    2. Test application functionality`);
  console.log(`[${new Date().toISOString()}] INFO:    3. Verify all pages load correctly`);

  // Save detailed report
  const reportPath = 'scripts/final_syntax_fixes_report.json';
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalFiles: FAILED_FILES.length,
      successCount,
      errorCount,
      successRate: ((successCount / FAILED_FILES.length) * 100).toFixed(1) + '%'
    },
    results
  };

  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`[${new Date().toISOString()}] INFO: 📊 Detailed fix report saved: ${reportPath}`);
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { fixSyntaxErrors };