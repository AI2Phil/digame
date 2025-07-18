const fs = require('fs');
const path = require('path');

// Workflow & Automation pages to restore from archived directory
const workflowPages = [
  'advanced.js',
  'automation.js',
  'calendar.js',
  'index.js',
  'marketplace.js',
  'notes.js',
  'optimization.js',
  'prioritization.js'
];

const archivedDir = 'frontend/pages_archived_20250717_193641/workflow';
const targetDir = 'frontend/src/pages/workflow';

// Ensure target directory exists
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
  console.log(`✅ Created directory: ${targetDir}`);
}

let successCount = 0;
let errorCount = 0;

workflowPages.forEach(filename => {
  try {
    const archivedPath = path.join(archivedDir, filename);
    const targetFilename = filename.replace('.js', '.tsx');
    const targetPath = path.join(targetDir, targetFilename);
    
    if (!fs.existsSync(archivedPath)) {
      console.log(`⚠️  Archived file not found: ${archivedPath}`);
      errorCount++;
      return;
    }
    
    // Read archived content
    let content = fs.readFileSync(archivedPath, 'utf8');
    
    // Apply Next.js/TypeScript conversions
    content = content
      // Update import paths for Next.js structure
      .replace(/from ['"]\.\.\/\.\.\/src\//g, "from '../../")
      .replace(/from ['"]\.\.\/src\//g, "from '../")
      .replace(/from ['"]src\//g, "from '../")
      
      // Fix component imports that might be missing the components path
      .replace(/from ['"]\.\.\/components\//g, "from '../../components/")
      
      // Convert to TypeScript patterns
      .replace(/export default function (\w+)\(\)/g, 'const $1: React.FC = ()')
      .replace(/export default function (\w+)\(\s*\{[^}]*\}\s*\)/g, 'const $1: React.FC<any> = ($1)')
      
      // Add React import if missing
      .replace(/^(?!.*import.*React)/, "import React from 'react';\n")
      
      // Add TypeScript export at end if needed
      .replace(/export default (\w+);?$/, 'export default $1;')
      
      // Ensure proper TypeScript component export
      .replace(/^(const \w+: React\.FC.*?= .*?\n)([\s\S]*?)$/m, '$1$2\n\nexport default $1;')
      .replace(/export default const (\w+): React\.FC.*?;[\s\S]*?export default \1;/g, 'const $1: React.FC = () => {\n  // Component implementation\n};\n\nexport default $1;');
    
    // Handle cases where we need to extract component name and add proper export
    if (!content.includes('export default') && content.includes('function ')) {
      const functionMatch = content.match(/function (\w+)/);
      if (functionMatch) {
        content += `\n\nexport default ${functionMatch[1]};`;
      }
    }
    
    // Write to target location
    fs.writeFileSync(targetPath, content);
    console.log(`✅ Restored: ${filename} → ${targetFilename}`);
    successCount++;
    
  } catch (error) {
    console.error(`❌ Error restoring ${filename}:`, error.message);
    errorCount++;
  }
});

console.log(`\n📊 Workflow & Automation Restoration Summary:`);
console.log(`✅ Successfully restored: ${successCount} pages`);
console.log(`❌ Errors: ${errorCount} pages`);
console.log(`📁 Target directory: ${targetDir}`);

if (successCount > 0) {
  console.log(`\n🎉 Workflow & Automation section restoration complete!`);
  console.log(`All ${successCount} pages are now available at /workflow/* routes`);
}