const fs = require('fs');
const path = require('path');

// AI Tools & Automation pages to restore from archived directory
const aiToolsPages = [
  // AI Tools directory (10 pages)
  { source: 'ai-tools/communication.js', target: 'ai-tools/communication.tsx' },
  { source: 'ai-tools/documents.js', target: 'ai-tools/documents.tsx' },
  { source: 'ai-tools/email.js', target: 'ai-tools/email.tsx' },
  { source: 'ai-tools/index.js', target: 'ai-tools/index.tsx' },
  { source: 'ai-tools/language.js', target: 'ai-tools/language.tsx' },
  { source: 'ai-tools/meetings.js', target: 'ai-tools/meetings.tsx' },
  { source: 'ai-tools/mobile.js', target: 'ai-tools/mobile.tsx' },
  { source: 'ai-tools/nlp.js', target: 'ai-tools/nlp.tsx' },
  { source: 'ai-tools/voice.js', target: 'ai-tools/voice.tsx' },
  { source: 'ai-tools/writing.js', target: 'ai-tools/writing.tsx' },
  
  // AI directory (2 pages)
  { source: 'ai/ai-automation.js', target: 'ai/ai-automation.tsx' },
  { source: 'ai/index.js', target: 'ai/index.tsx' }
];

const archivedBaseDir = 'frontend/pages_archived_20250717_193641';
const targetBaseDir = 'frontend/src/pages';

let successCount = 0;
let errorCount = 0;

aiToolsPages.forEach(({ source, target }) => {
  try {
    const archivedPath = path.join(archivedBaseDir, source);
    const targetPath = path.join(targetBaseDir, target);
    const targetDir = path.dirname(targetPath);
    
    if (!fs.existsSync(archivedPath)) {
      console.log(`⚠️  Archived file not found: ${archivedPath}`);
      errorCount++;
      return;
    }
    
    // Ensure target directory exists
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
      console.log(`✅ Created directory: ${targetDir}`);
    }
    
    // Read archived content
    let content = fs.readFileSync(archivedPath, 'utf8');
    
    // Apply Next.js/TypeScript conversions
    content = content
      // Update import paths for Next.js structure
      .replace(/from ['"]\.\.\/\.\.\/src\//g, "from '../../")
      .replace(/from ['"]\.\.\/src\//g, "from '../")
      .replace(/from ['"]src\//g, "from '../")
      
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
    console.log(`✅ Restored: ${source} → ${target}`);
    successCount++;
    
  } catch (error) {
    console.error(`❌ Error restoring ${source}:`, error.message);
    errorCount++;
  }
});

console.log(`\n📊 AI Tools & Automation Restoration Summary:`);
console.log(`✅ Successfully restored: ${successCount} pages`);
console.log(`❌ Errors: ${errorCount} pages`);
console.log(`📁 Target directories: ${targetBaseDir}/ai-tools, ${targetBaseDir}/ai`);

if (successCount > 0) {
  console.log(`\n🎉 AI Tools & Automation section restoration complete!`);
  console.log(`All ${successCount} pages are now available at /ai-tools/* and /ai/* routes`);
}