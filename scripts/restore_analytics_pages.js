#!/usr/bin/env node

/**
 * Batch Analytics Pages Restoration Script
 * 
 * This script automates the restoration of analytics pages from the archived directory
 * to the new Next.js structure with TypeScript conversion and SSR compatibility.
 */

const fs = require('fs');
const path = require('path');

// Configuration
const ARCHIVE_DIR = 'frontend/pages_archived_20250717_193641';
const TARGET_DIR = 'frontend/src/pages';
const ANALYTICS_PAGES = [
  'mobile.js',
  'revenue.js',
  'kpi-test.js',
  'user-behavior.js',
  'behavioral.js',
  'predictive.js',
  'patterns.js',
  'anomalies.js',
  'performance.js',
  'dashboard-builder.js'
];

const PERFORMANCE_PAGES = [
  'monitoring-dashboard.js',
  'user-experience.js',
  'query-optimization.js',
  'bundle-analyzer.js'
];

/**
 * Convert JS file to TypeScript with Next.js compatibility
 */
function convertToTypeScript(content, filename) {
  let converted = content;
  
  // Add TypeScript export default if missing
  if (!converted.includes('export default')) {
    // Find the component name from the file
    const componentName = filename.replace('.js', '').split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join('');
    
    converted = converted.replace(
      /const\s+(\w+)\s*=\s*\(\)\s*=>\s*{/,
      `const ${componentName}: React.FC = () => {`
    );
  }
  
  // Update import paths for Next.js structure
  converted = converted.replace(
    /from\s+['"]\.\.\/components\//g,
    "from '../../../components/"
  );
  
  converted = converted.replace(
    /from\s+['"]\.\.\/src\/components\//g,
    "from '../../../components/"
  );
  
  // Add React import if missing
  if (!converted.includes("import React")) {
    converted = "import React from 'react';\n" + converted;
  }
  
  // Add Head import if using Head component
  if (converted.includes('<Head>') && !converted.includes("import Head")) {
    converted = converted.replace(
      "import React from 'react';",
      "import React from 'react';\nimport Head from 'next/head';"
    );
  }
  
  return converted;
}

/**
 * Create directory if it doesn't exist
 */
function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`✅ Created directory: ${dirPath}`);
  }
}

/**
 * Restore a single page
 */
function restorePage(sourceFile, targetFile, category) {
  try {
    const sourcePath = path.join(ARCHIVE_DIR, category, sourceFile);
    const targetPath = path.join(TARGET_DIR, category, targetFile);
    
    if (!fs.existsSync(sourcePath)) {
      console.log(`⚠️  Source file not found: ${sourcePath}`);
      return false;
    }
    
    const content = fs.readFileSync(sourcePath, 'utf8');
    const convertedContent = convertToTypeScript(content, sourceFile);
    
    ensureDir(path.dirname(targetPath));
    fs.writeFileSync(targetPath, convertedContent);
    
    console.log(`✅ Restored: ${sourceFile} → ${targetFile}`);
    return true;
  } catch (error) {
    console.error(`❌ Error restoring ${sourceFile}:`, error.message);
    return false;
  }
}

/**
 * Main restoration function
 */
function restoreAnalyticsPages() {
  console.log('🚀 Starting Analytics Pages Restoration...\n');
  
  let successCount = 0;
  let totalCount = 0;
  
  // Restore analytics pages
  console.log('📊 Restoring Analytics Pages:');
  for (const page of ANALYTICS_PAGES) {
    const targetFile = page.replace('.js', '.tsx');
    if (restorePage(page, targetFile, 'analytics')) {
      successCount++;
    }
    totalCount++;
  }
  
  // Restore performance pages
  console.log('\n⚡ Restoring Performance Pages:');
  for (const page of PERFORMANCE_PAGES) {
    const targetFile = page.replace('.js', '.tsx');
    if (restorePage(page, targetFile, 'performance')) {
      successCount++;
    }
    totalCount++;
  }
  
  console.log(`\n🎉 Restoration Complete!`);
  console.log(`✅ Successfully restored: ${successCount}/${totalCount} pages`);
  
  if (successCount < totalCount) {
    console.log(`⚠️  ${totalCount - successCount} pages had issues - check logs above`);
  }
  
  return successCount === totalCount;
}

// Run the script
if (require.main === module) {
  const success = restoreAnalyticsPages();
  process.exit(success ? 0 : 1);
}

module.exports = { restoreAnalyticsPages, convertToTypeScript };