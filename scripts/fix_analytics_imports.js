#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const analyticsFiles = [
  'frontend/src/pages/analytics/mobile-advanced.jsx',
  'frontend/src/pages/analytics/business-intelligence.jsx', 
  'frontend/src/pages/analytics/dashboard.jsx',
  'frontend/src/pages/analytics/web-advanced.jsx'
];

function fixImportPaths(filePath) {
  try {
    console.log(`Fixing import paths in: ${filePath}`);
    
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Fix component imports - change '../components' to '../../components'
    content = content.replace(/from '\.\.\//g, "from '../../");
    
    // More specific replacements
    content = content.replace(/from '\.\.\/components/g, "from '../../components");
    content = content.replace(/from '\.\.\/services/g, "from '../../services");
    
    fs.writeFileSync(filePath, content);
    console.log(`✅ Fixed import paths in: ${filePath}`);
    
  } catch (error) {
    console.error(`❌ Error fixing ${filePath}:`, error.message);
  }
}

console.log('🔧 Fixing analytics import paths...\n');

analyticsFiles.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    fixImportPaths(filePath);
  } else {
    console.log(`⚠️  File not found: ${filePath}`);
  }
});

console.log('\n✅ Analytics import path fixes completed!');