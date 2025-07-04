#!/usr/bin/env node

/**
 * Next.js Routing Validation Script
 * Validates that all integration routes are properly configured for Next.js
 */

const fs = require('fs');
const path = require('path');

const FRONTEND_DIR = path.join(__dirname, '../frontend');
const PAGES_DIR = path.join(FRONTEND_DIR, 'src/pages');
const COMPONENTS_DIR = path.join(FRONTEND_DIR, 'src/components');

// Expected Next.js integration routes
const EXPECTED_ROUTES = [
  'integrations/index.tsx',
  'integrations/marketplace.tsx', 
  'integrations/management.tsx',
  'integrations/configure/[integrationId].tsx',
  'integrations/oauth/callback.tsx'
];

// Integration components that should use Next.js router
const INTEGRATION_COMPONENTS = [
  'components/integrations/IntegrationMarketplace.tsx',
  'components/integrations/IntegrationManagementDashboard.tsx',
  'components/integrations/IntegrationConfigurationWizard.tsx'
];

console.log('🔍 Validating Next.js Integration Routing...\n');

// Check if all expected routes exist
console.log('📁 Checking route files:');
let routeErrors = 0;

EXPECTED_ROUTES.forEach(route => {
  const filePath = path.join(PAGES_DIR, route);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${route}`);
  } else {
    console.log(`❌ ${route} - Missing!`);
    routeErrors++;
  }
});

// Check package.json for React Router dependency
console.log('\n📦 Checking package.json:');
const packageJsonPath = path.join(FRONTEND_DIR, 'package.json');
if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  if (packageJson.dependencies && packageJson.dependencies['react-router-dom']) {
    console.log('❌ react-router-dom dependency found - should be removed!');
    routeErrors++;
  } else {
    console.log('✅ No react-router-dom dependency found');
  }
} else {
  console.log('❌ package.json not found');
  routeErrors++;
}

// Check components for Next.js router usage
console.log('\n🧩 Checking component router usage:');
let componentErrors = 0;

INTEGRATION_COMPONENTS.forEach(component => {
  const filePath = path.join(FRONTEND_DIR, 'src', component);
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Check for Next.js router import
    const hasNextRouter = content.includes("import { useRouter } from 'next/router'");
    
    // Check for React Router imports (should not exist)
    const hasReactRouter = content.includes('react-router-dom') ||
                          content.includes('useNavigate(') ||
                          content.includes('from \'react-router') ||
                          content.includes('<Navigate');
    
    // Check for window.location usage (should be minimal)
    const hasWindowLocation = content.includes('window.location.href');
    
    if (hasNextRouter && !hasReactRouter) {
      console.log(`✅ ${component} - Using Next.js router`);
    } else if (hasReactRouter) {
      console.log(`❌ ${component} - Still using React Router!`);
      componentErrors++;
    } else if (hasWindowLocation) {
      console.log(`⚠️  ${component} - Using window.location (consider Next.js router)`);
    } else {
      console.log(`ℹ️  ${component} - No router usage detected`);
    }
  } else {
    console.log(`❌ ${component} - File not found!`);
    componentErrors++;
  }
});

// Check Next.js config for API rewrites
console.log('\n⚙️  Checking Next.js configuration:');
const nextConfigPath = path.join(FRONTEND_DIR, 'next.config.js');
if (fs.existsSync(nextConfigPath)) {
  const configContent = fs.readFileSync(nextConfigPath, 'utf8');
  
  if (configContent.includes('rewrites') && configContent.includes('/api/:path*')) {
    console.log('✅ API rewrites configured');
  } else {
    console.log('❌ API rewrites not properly configured');
    routeErrors++;
  }
} else {
  console.log('❌ next.config.js not found');
  routeErrors++;
}

// Summary
console.log('\n📊 Validation Summary:');
console.log(`Routes: ${EXPECTED_ROUTES.length - routeErrors}/${EXPECTED_ROUTES.length} ✅`);
console.log(`Components: ${INTEGRATION_COMPONENTS.length - componentErrors}/${INTEGRATION_COMPONENTS.length} ✅`);

const totalErrors = routeErrors + componentErrors;
if (totalErrors === 0) {
  console.log('\n🎉 All integration routing is Next.js compatible!');
  process.exit(0);
} else {
  console.log(`\n⚠️  Found ${totalErrors} issues that need to be addressed.`);
  process.exit(1);
}