const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get all .tsx files that have syntax errors
const getProblematicFiles = () => {
  const directories = [
    'frontend/src/pages/ai',
    'frontend/src/pages/ai-tools',
    'frontend/src/pages/digital-twin',
    'frontend/src/pages/social',
    'frontend/src/pages/tasks',
    'frontend/src/pages/workflow'
  ];

  let files = [];
  directories.forEach(dir => {
    if (fs.existsSync(dir)) {
      const dirFiles = fs.readdirSync(dir)
        .filter(file => file.endsWith('.tsx'))
        .map(file => path.join(dir, file));
      files = files.concat(dirFiles);
    }
  });

  return files;
};

const fixTypeScriptSyntax = (filePath) => {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Fix the malformed function declarations
    // Pattern: const ComponentName: React.FC = () {
    // Should be: const ComponentName: React.FC = () => {
    const malformedFunctionRegex = /const (\w+): React\.FC = \(\) \{/g;
    if (malformedFunctionRegex.test(content)) {
      content = content.replace(malformedFunctionRegex, 'const $1: React.FC = () => {');
      modified = true;
    }

    // Fix duplicate export statements
    // Pattern: export default const ComponentName: React.FC = () => {
    // Should be: const ComponentName: React.FC = () => {
    const duplicateExportRegex = /export default const (\w+): React\.FC = \(\) => \{/g;
    if (duplicateExportRegex.test(content)) {
      content = content.replace(duplicateExportRegex, 'const $1: React.FC = () => {');
      modified = true;
    }

    // Remove orphaned semicolons and malformed lines
    content = content.replace(/^export default const \w+: React\.FC = \(\) =>\s*;\s*$/gm, '');
    content = content.replace(/^\s*;\s*$/gm, '');

    // Ensure proper export at the end
    const componentNameMatch = content.match(/const (\w+): React\.FC = \(\) => \{/);
    if (componentNameMatch) {
      const componentName = componentNameMatch[1];
      
      // Remove any existing export statements
      content = content.replace(/export default \w+;?\s*$/gm, '');
      
      // Add proper export at the end
      if (!content.includes(`export default ${componentName};`)) {
        content = content.trim() + `\n\nexport default ${componentName};\n`;
        modified = true;
      }
    }

    // Clean up multiple newlines
    content = content.replace(/\n{3,}/g, '\n\n');

    if (modified) {
      fs.writeFileSync(filePath, content);
      console.log(`✅ Fixed: ${filePath}`);
      return true;
    } else {
      console.log(`⚠️  No issues found: ${filePath}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error fixing ${filePath}:`, error.message);
    return false;
  }
};

// Main execution
console.log('🔧 Fixing TypeScript syntax errors...\n');

const problematicFiles = getProblematicFiles();
let fixedCount = 0;

problematicFiles.forEach(file => {
  if (fixTypeScriptSyntax(file)) {
    fixedCount++;
  }
});

console.log(`\n📊 TypeScript Syntax Fix Summary:`);
console.log(`✅ Files processed: ${problematicFiles.length}`);
console.log(`🔧 Files fixed: ${fixedCount}`);
console.log(`⚠️  Files unchanged: ${problematicFiles.length - fixedCount}`);

if (fixedCount > 0) {
  console.log(`\n🎉 TypeScript syntax errors have been fixed!`);
  console.log(`You can now run 'npm run build' to test the compilation.`);
}