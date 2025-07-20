#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Files with import path issues
const FILES_TO_FIX = [
  'performance/monitoring-dashboard.tsx',
  'performance/user-experience.tsx',
  'performance/query-optimization.tsx',
  'social/network.tsx',
  'performance/bundle-analyzer.tsx',
  'social/collaboration.tsx',
  'social/mentorship.tsx',
  'team/social.tsx',
  'team/skills.tsx',
  'team/dashboard.tsx',
  'social/learning-partners.tsx',
  'learning/ai-assistant.tsx',
  'learning/skill-tracking.tsx',
  'security/index.tsx',
  'tasks/ai-suggestions.tsx',
  'collaboration/real-time.tsx',
  'career/jobs.tsx',
  'career/skills.tsx',
  'career/modeling.tsx',
  'career/index.tsx',
  'tasks/analytics.tsx',
  'tasks/projects.tsx'
];

const PAGES_DIR = 'frontend/src/pages';
const BACKUP_DIR = 'scripts/backups/import_path_fixes';

// Ensure backup directory exists
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

function logChange(filePath, description) {
  console.log(`[${new Date().toISOString()}] INFO: ${description} for ${filePath}`);
  console.log(`[${new Date().toISOString()}] INFO: Changes tracked by git - no backup files needed`);
}

function fixImportPaths(content) {
  let fixed = content;
  let changes = [];

  // Fix ../../src/components to ../../components
  const oldPattern = /\.\.\/\.\.\/src\/components/g;
  if (oldPattern.test(fixed)) {
    fixed = fixed.replace(oldPattern, '../../components');
    changes.push('Fixed import paths from ../../src/components to ../../components');
  }

  return { content: fixed, changes };
}

async function main() {
  console.log(`[${new Date().toISOString()}] INFO: 🔧 Starting Import Path Fixes for ${FILES_TO_FIX.length} Files`);
  console.log(`[${new Date().toISOString()}] INFO: 📁 Target Directory: ${PAGES_DIR}`);
  
  let successCount = 0;
  let errorCount = 0;
  const results = [];

  for (let i = 0; i < FILES_TO_FIX.length; i++) {
    const relativePath = FILES_TO_FIX[i];
    const fullPath = path.join(PAGES_DIR, relativePath);
    
    console.log(`[${new Date().toISOString()}] INFO: 🔧 Fixing (${i + 1}/${FILES_TO_FIX.length}): ${relativePath}`);
    
    try {
      if (!fs.existsSync(fullPath)) {
        console.log(`[${new Date().toISOString()}] WARN:    ⚠️  File not found: ${fullPath}`);
        continue;
      }

      const originalContent = fs.readFileSync(fullPath, 'utf8');
      
      const { content: fixedContent, changes } = fixImportPaths(originalContent);
      
      if (changes.length > 0) {
        fs.writeFileSync(fullPath, fixedContent, 'utf8');
        logChange(relativePath, 'Fixed import paths');
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
  console.log(`[${new Date().toISOString()}] INFO: 📋 IMPORT PATH FIXES SUMMARY`);
  console.log(`[${new Date().toISOString()}] INFO: ============================================================`);
  console.log(`[${new Date().toISOString()}] SUCCESS: ✅ Successfully fixed: ${successCount} files`);
  console.log(`[${new Date().toISOString()}] ERROR: ❌ Errors encountered: ${errorCount} files`);
  console.log(`[${new Date().toISOString()}] INFO: 📊 Total files processed: ${FILES_TO_FIX.length} files`);
  console.log(`[${new Date().toISOString()}] INFO: 🎯 Success rate: ${((successCount / FILES_TO_FIX.length) * 100).toFixed(1)}%`);

  if (successCount > 0) {
    console.log(`[${new Date().toISOString()}] SUCCESS: \n🎉 IMPORT PATH FIXES COMPLETED!`);
    console.log(`[${new Date().toISOString()}] SUCCESS: 🔧 ${successCount} files now have correct import paths`);
  }

  if (errorCount > 0) {
    console.log(`[${new Date().toISOString()}] WARN: \n⚠️  ${errorCount} files still need manual review`);
  }

  console.log(`[${new Date().toISOString()}] INFO: \n📝 Next steps:`);
  console.log(`[${new Date().toISOString()}] INFO:    1. Run build test: cd frontend && npm run build`);
  console.log(`[${new Date().toISOString()}] INFO:    2. Test application functionality`);
  console.log(`[${new Date().toISOString()}] INFO:    3. Verify all pages load correctly`);

  // Save detailed report
  const reportPath = 'scripts/import_path_fixes_report.json';
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalFiles: FILES_TO_FIX.length,
      successCount,
      errorCount,
      successRate: ((successCount / FILES_TO_FIX.length) * 100).toFixed(1) + '%'
    },
    results
  };

  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`[${new Date().toISOString()}] INFO: 📊 Detailed fix report saved: ${reportPath}`);
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { fixImportPaths };