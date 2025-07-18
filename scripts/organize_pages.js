#!/usr/bin/env node

/**
 * Page Organization Script
 * 
 * This script organizes loose pages into proper directory structures
 * to match the expected routing architecture.
 */

const fs = require('fs');
const path = require('path');

const PAGES_DIR = 'frontend/src/pages';

// Define the reorganization mapping
const PAGE_MOVES = [
  // AI Tools & Digital Twin
  { from: 'AiInsightsDashboard.jsx', to: 'ai/insights.jsx' },
  { from: 'AIMLDashboardPage.jsx', to: 'ai/ml-dashboard.jsx' },
  { from: 'AiToolsPage.jsx', to: 'ai-tools/index.jsx' },
  
  // Admin
  { from: 'AdminDashboardPage.jsx', to: 'admin/dashboard.jsx' },
  { from: 'SystemConfigurationPage.jsx', to: 'admin/config.jsx' },
  
  // Tasks
  { from: 'TaskManagementPage.jsx', to: 'tasks/index.jsx' },
  
  // Workflow
  { from: 'WorkflowOptimizationPage.jsx', to: 'workflow/optimization.jsx' },
  
  // Social
  { from: 'EnhancedSocialCollaborationDashboard.jsx', to: 'social/collaboration-enhanced.jsx' },
  { from: 'FindPeersPage.jsx', to: 'social/find-peers.jsx' },
  
  // Team (additional pages)
  { from: 'TeamDashboardPage.jsx', to: 'team/dashboard.jsx' },
  { from: 'TeamsPage.jsx', to: 'team/teams.jsx' },
  { from: 'SkillGapAnalysisPage.jsx', to: 'team/skills.jsx' },
  
  // Enterprise
  { from: 'EnterpriseDashboardPage.jsx', to: 'enterprise/dashboard.jsx' },
  { from: 'MultiTenantConsolePage.jsx', to: 'enterprise/multi-tenant.jsx' },
  
  // Platform Owner (additional pages)
  { from: 'PlatformOwnerConsolePage.jsx', to: 'platform-owner/console.jsx' },
  { from: 'PlatformOwnerRevenuePage.jsx', to: 'platform-owner/revenue.jsx' },
  { from: 'PlatformOwnerTenantsPage.jsx', to: 'platform-owner/tenants.jsx' },
  
  // Onboarding
  { from: 'OnboardingPage.jsx', to: 'onboarding/index.jsx' },
  
  // Learning (if we create the directory)
  { from: 'UserProfileOverviewPage.jsx', to: 'learning/profile-overview.jsx' },
];

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
  
  // Ensure target directory exists
  ensureDir(path.dirname(toPath));
  
  // Move the file
  fs.renameSync(fromPath, toPath);
  console.log(`✅ Moved: ${fromFile} → ${toFile}`);
  return true;
}

/**
 * Main organization function
 */
function organizePages() {
  console.log('🚀 Starting Page Organization...\n');
  
  let successCount = 0;
  let totalCount = PAGE_MOVES.length;
  
  for (const move of PAGE_MOVES) {
    if (movePage(move.from, move.to)) {
      successCount++;
    }
  }
  
  console.log(`\n🎉 Organization Complete!`);
  console.log(`✅ Successfully moved: ${successCount}/${totalCount} pages`);
  
  if (successCount < totalCount) {
    console.log(`⚠️  ${totalCount - successCount} pages had issues - check logs above`);
  }
  
  return successCount === totalCount;
}

// Run the script
if (require.main === module) {
  const success = organizePages();
  process.exit(success ? 0 : 1);
}

module.exports = { organizePages };