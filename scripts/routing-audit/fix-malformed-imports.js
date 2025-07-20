#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Files with malformed import statements identified from the search
const malformedFiles = [
  'frontend/src/components/analytics/ApiAnalyticsSection.jsx',
  'frontend/src/components/analytics/MobileAnalyticsSection.jsx',
  'frontend/src/components/reports/PredictiveAnalyticsEngine.jsx',
  'frontend/src/components/reports/DataVisualizationEngine.jsx',
  'frontend/src/components/reports/CustomReportBuilder.jsx',
  'frontend/src/components/workflow/AdvancedWorkflowAnalytics.jsx',
  'frontend/src/components/workflow/WorkflowMarketplace.jsx',
  'frontend/src/components/ai/AIPoweredAutomation.jsx',
  'frontend/src/components/ai/NLPEnhancement.jsx',
  'frontend/src/components/ai/PredictiveModeling.jsx',
  'frontend/src/components/ai/AdvancedBehavioralAnalysis.jsx',
  'frontend/src/components/admin/SystemAnalyticsSection.jsx',
  'frontend/src/components/admin/UserManagementSection.jsx',
  'frontend/src/components/admin/OnboardingAnalyticsSection.jsx',
  'frontend/src/components/security/RiskAssessmentEngine.jsx',
  'frontend/src/components/security/ComplianceManagementSystem.jsx',
  'frontend/src/components/security/AuditTrailAnalytics.jsx',
  'frontend/src/components/enterprise/MultiTenancyDashboard.jsx',
  'frontend/src/components/settings/UserApiKeyManagement.jsx'
];

function fixMalformedImports() {
  let totalFixed = 0;
  
  console.log('🔧 Fixing malformed import statements...\n');
  
  malformedFiles.forEach(filePath => {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  File not found: ${filePath}`);
      return;
    }
    
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n');
      
      // Look for the pattern: "import {" followed by "import { apiClient, replaceApiUrl } from '../../lib/api-config';"
      let fixed = false;
      const fixedLines = [];
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const nextLine = lines[i + 1];
        
        // Check for malformed import pattern
        if (line.trim() === 'import {' && 
            nextLine && 
            nextLine.includes("import { apiClient, replaceApiUrl } from")) {
          
          // Remove the incomplete "import {" line and keep the complete import
          console.log(`🔧 Fixed malformed import in: ${filePath}`);
          console.log(`   Removed: "${line}"`);
          console.log(`   Kept: "${nextLine}"`);
          
          fixedLines.push(nextLine); // Keep the complete import
          i++; // Skip the next line since we already processed it
          fixed = true;
          totalFixed++;
        } else {
          fixedLines.push(line);
        }
      }
      
      if (fixed) {
        fs.writeFileSync(filePath, fixedLines.join('\n'));
        console.log(`✅ Fixed: ${filePath}\n`);
      }
      
    } catch (error) {
      console.error(`❌ Error processing ${filePath}:`, error.message);
    }
  });
  
  console.log(`\n🎉 Fixed ${totalFixed} malformed import statements!`);
  
  if (totalFixed > 0) {
    console.log('\n📋 Summary of fixes:');
    console.log('- Removed incomplete "import {" lines');
    console.log('- Kept complete import statements for api-config');
    console.log('- Fixed syntax errors that were causing build failures');
  }
}

// Run the fix
fixMalformedImports();