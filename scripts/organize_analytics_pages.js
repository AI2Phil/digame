#!/usr/bin/env node

/**
 * Analytics Pages Organization Script
 * 
 * This script moves remaining analytics pages to the analytics directory
 */

const fs = require('fs');
const path = require('path');

const PAGES_DIR = 'frontend/src/pages';

// Define the analytics page moves
const ANALYTICS_MOVES = [
  { from: 'AdvancedMobileAnalyticsDashboard.jsx', to: 'analytics/mobile-advanced.jsx' },
  { from: 'AdvancedWebAnalyticsDashboard.jsx', to: 'analytics/web-advanced.jsx' },
  { from: 'AnalyticsDashboardPage.jsx', to: 'analytics/dashboard.jsx' },
  { from: 'BehavioralAnalyticsPage.jsx', to: 'analytics/behavioral.jsx' },
  { from: 'BusinessIntelligenceDashboard.jsx', to: 'analytics/business-intelligence.jsx' },
  { from: 'MobileAnalyticsDashboard.jsx', to: 'analytics/mobile.jsx' },
  { from: 'PredictiveAnalyticsPage.jsx', to: 'analytics/predictive.jsx' },
];

// Other pages that should be moved to appropriate directories
const OTHER_MOVES = [
  { from: 'AdvancedPerformancePage.jsx', to: 'performance/advanced.jsx' },
  { from: 'ReportsPage.jsx', to: 'reports/index.jsx' },
  { from: 'IntegrationsPage.jsx', to: 'integrations/index.jsx' },
  { from: 'OAuthCallbackPage.jsx', to: 'auth/oauth-callback.jsx' },
];

/**
 * Move a page to its proper directory
 */
function movePage(fromFile, toFile) {
  const fromPath = path.join(PAGES_DIR, fromFile);
  const toPath = path.join(PAGES_DIR, toFile);
  
  if (!fs.existsSync(fromPath)) {
    console.log(`⚠️  Source file not found: ${fromPath}`);
    return false;
  }
  
  if (fs.existsSync(toPath)) {
    console.log(`⚠️  Target file already exists: ${toPath}`);
    return false;
  }
  
  // Move the file
  fs.renameSync(fromPath, toPath);
  console.log(`✅ Moved: ${fromFile} → ${toFile}`);
  return true;
}

/**
 * Main organization function
 */
function organizeAnalyticsPages() {
  console.log('🚀 Starting Analytics Pages Organization...\n');
  
  let successCount = 0;
  const allMoves = [...ANALYTICS_MOVES, ...OTHER_MOVES];
  
  for (const move of allMoves) {
    if (movePage(move.from, move.to)) {
      successCount++;
    }
  }
  
  console.log(`\n🎉 Analytics Organization Complete!`);
  console.log(`✅ Successfully moved: ${successCount}/${allMoves.length} pages`);
  
  return successCount === allMoves.length;
}

// Run the script
if (require.main === module) {
  const success = organizeAnalyticsPages();
  process.exit(success ? 0 : 1);
}

module.exports = { organizeAnalyticsPages };