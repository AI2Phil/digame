#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const filesToFix = [
  'frontend/src/pages/onboarding/index.jsx',
  'frontend/src/pages/ai/insights.jsx',
  'frontend/src/pages/learning/profile-overview.jsx',
  'frontend/src/pages/social/collaboration-enhanced.jsx'
];

function fixToastUsage(filePath) {
  try {
    console.log(`Fixing Toast usage in: ${filePath}`);
    
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Check if file already imports useToastActions
    if (content.includes('useToastActions')) {
      console.log(`✅ ${filePath} already uses useToastActions`);
      return;
    }
    
    // Replace Toast import with useToastActions import
    content = content.replace(
      /import Toast from ['"]([^'"]+)\/Toast['"];?/g,
      "import { useToastActions } from '$1/Toast';"
    );
    
    // Add toast hook declaration after other hooks
    const componentMatch = content.match(/const\s+(\w+)\s*[=:]\s*\([^)]*\)\s*=>\s*{/);
    if (componentMatch) {
      const componentStart = componentMatch.index + componentMatch[0].length;
      
      // Find where to insert the toast hook (after other useState/useEffect declarations)
      const hookInsertPoint = content.indexOf('\n', componentStart);
      if (hookInsertPoint !== -1) {
        const beforeHook = content.substring(0, hookInsertPoint + 1);
        const afterHook = content.substring(hookInsertPoint + 1);
        
        // Only add if not already present
        if (!content.includes('const toast = useToastActions()')) {
          content = beforeHook + '  const toast = useToastActions();\n' + afterHook;
        }
      }
    }
    
    // Replace Toast.method() calls with toast.method() calls
    content = content.replace(/Toast\.(success|error|warning|info)\(/g, 'toast.$1(');
    
    fs.writeFileSync(filePath, content);
    console.log(`✅ Fixed Toast usage in: ${filePath}`);
    
  } catch (error) {
    console.error(`❌ Error fixing ${filePath}:`, error.message);
  }
}

console.log('🔧 Fixing Toast usage patterns...\n');

filesToFix.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    fixToastUsage(filePath);
  } else {
    console.log(`⚠️  File not found: ${filePath}`);
  }
});

console.log('\n✅ Toast usage fixes completed!');