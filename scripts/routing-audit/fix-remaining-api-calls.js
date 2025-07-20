#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Fix the remaining 6 API calls
const fixes = [
  {
    file: 'frontend/src/components/platform-owner/PlatformDashboard.tsx',
    find: 'http://localhost:8000/service-info',
    replace: '${replaceApiUrl("/service-info")}'
  },
  {
    file: 'frontend/src/components/reports/CustomReportBuilder.jsx',
    find: 'http://localhost:3001/advanced-reporting/report-builder',
    replace: '${replaceApiUrl("/api/advanced-reporting/report-builder")}'
  },
  {
    file: 'frontend/src/components/reports/DataVisualizationEngine.jsx',
    find: 'http://localhost:3001/advanced-reporting/visualization-engine',
    replace: '${replaceApiUrl("/api/advanced-reporting/visualization-engine")}'
  },
  {
    file: 'frontend/src/components/reports/PredictiveAnalyticsEngine.jsx',
    find: 'http://localhost:3001/advanced-reporting/predictive-analytics',
    replace: '${replaceApiUrl("/api/advanced-reporting/predictive-analytics")}'
  },
  {
    file: 'frontend/src/services/apiService.js',
    find: 'http://localhost:${port}/service-info',
    replace: '${replaceApiUrl("/service-info")}'
  },
  {
    file: 'frontend/src/services/dashboardService.js',
    find: 'http://localhost:8000',
    replace: '${replaceApiUrl("")}'
  }
];

const projectRoot = path.resolve(process.cwd(), '../..');
let totalFixed = 0;

console.log('🔧 Fixing remaining 6 API calls...\n');

fixes.forEach(fix => {
  const fullPath = path.resolve(projectRoot, fix.file);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    if (content.includes(fix.find)) {
      content = content.replace(fix.find, fix.replace);
      fs.writeFileSync(fullPath, content);
      console.log(`✅ Fixed: ${fix.file}`);
      totalFixed++;
    } else {
      console.log(`⚠️  Pattern not found in: ${fix.file}`);
    }
  } else {
    console.log(`❌ File not found: ${fix.file}`);
  }
});

console.log(`\n🎉 Fixed ${totalFixed} remaining API calls!`);