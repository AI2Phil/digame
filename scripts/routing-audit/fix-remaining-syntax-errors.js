#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Files with remaining syntax errors identified from the build output
const filesToFix = [
  'frontend/src/components/admin/OnboardingAnalyticsSection.jsx',
  'frontend/src/components/admin/SystemAnalyticsSection.jsx', 
  'frontend/src/components/admin/UserDetailsDialog.jsx',
  'frontend/src/components/admin/UserManagementSection.jsx',
  'frontend/src/components/ai/AIPoweredAutomation.jsx'
];

function fixSyntaxErrors() {
  let totalFixed = 0;
  
  console.log('🔧 Fixing remaining syntax errors...\n');
  
  filesToFix.forEach(filePath => {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  File not found: ${filePath}`);
      return;
    }
    
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      let lines = content.split('\n');
      let fixed = false;
      
      // Fix specific issues found in each file
      if (filePath.includes('OnboardingAnalyticsSection.jsx')) {
        // Fix missing import statement for lucide-react icons
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].trim() === 'UserCheck, TrendingUp, Clock, Target,') {
            // Add the missing import statement
            lines.splice(i, 0, 'import {');
            fixed = true;
            console.log(`🔧 Fixed missing import opening in: ${filePath}`);
            break;
          }
        }
      }
      
      if (filePath.includes('SystemAnalyticsSection.jsx')) {
        // Fix missing import statement for lucide-react icons
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].trim() === 'BarChart3, TrendingUp, Activity, Database,') {
            // Add the missing import statement
            lines.splice(i, 0, 'import {');
            fixed = true;
            console.log(`🔧 Fixed missing import opening in: ${filePath}`);
            break;
          }
        }
      }
      
      if (filePath.includes('UserDetailsDialog.jsx')) {
        // Fix the malformed import statement
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].trim() === 'import { ' && 
              lines[i + 1] && 
              lines[i + 1].includes('import { apiClient, replaceApiUrl }')) {
            // Remove the incomplete import line
            lines.splice(i, 1);
            fixed = true;
            console.log(`🔧 Fixed malformed import in: ${filePath}`);
            break;
          }
        }
      }
      
      if (filePath.includes('UserManagementSection.jsx')) {
        // Fix missing import statement for lucide-react icons
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].trim() === 'Search, Filter, Download, MoreHorizontal,') {
            // Add the missing import statement
            lines.splice(i, 0, 'import {');
            fixed = true;
            console.log(`🔧 Fixed missing import opening in: ${filePath}`);
            break;
          }
        }
      }
      
      if (filePath.includes('AIPoweredAutomation.jsx')) {
        // Fix missing import statement for Card components
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].trim() === 'Card,') {
            // Add the missing import statement
            lines.splice(i, 0, 'import {');
            fixed = true;
            console.log(`🔧 Fixed missing import opening in: ${filePath}`);
            break;
          }
        }
      }
      
      if (fixed) {
        fs.writeFileSync(filePath, lines.join('\n'));
        console.log(`✅ Fixed: ${filePath}\n`);
        totalFixed++;
      }
      
    } catch (error) {
      console.error(`❌ Error processing ${filePath}:`, error.message);
    }
  });
  
  console.log(`\n🎉 Fixed ${totalFixed} syntax errors!`);
  
  if (totalFixed > 0) {
    console.log('\n📋 Summary of fixes:');
    console.log('- Added missing import statement openings');
    console.log('- Removed malformed import lines');
    console.log('- Fixed syntax errors causing build failures');
  }
}

// Run the fix
fixSyntaxErrors();