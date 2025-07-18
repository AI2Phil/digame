const fs = require('fs');
const path = require('path');

// Define the career development pages to restore
const careerPages = [
  {
    source: 'frontend/pages_archived_20250717_193641/career/index.js',
    target: 'frontend/src/pages/career/index.tsx',
    route: '/career',
    title: 'Career Dashboard'
  },
  {
    source: 'frontend/pages_archived_20250717_193641/career/jobs.js',
    target: 'frontend/src/pages/career/jobs.tsx',
    route: '/career/jobs',
    title: 'Job Opportunities'
  },
  {
    source: 'frontend/pages_archived_20250717_193641/career/learning.js',
    target: 'frontend/src/pages/career/learning.tsx',
    route: '/career/learning',
    title: 'Learning Paths'
  },
  {
    source: 'frontend/pages_archived_20250717_193641/career/modeling.js',
    target: 'frontend/src/pages/career/modeling.tsx',
    route: '/career/modeling',
    title: 'Career Modeling'
  },
  {
    source: 'frontend/pages_archived_20250717_193641/career/network.js',
    target: 'frontend/src/pages/career/network.tsx',
    route: '/career/network',
    title: 'Professional Network'
  },
  {
    source: 'frontend/pages_archived_20250717_193641/career/skills.js',
    target: 'frontend/src/pages/career/skills.tsx',
    route: '/career/skills',
    title: 'Skills Assessment'
  }
];

// Function to convert JS to TypeScript and update imports
function convertToNextJS(content, title) {
  let converted = content;
  
  // Add TypeScript imports
  if (!converted.includes('import React')) {
    converted = `import React from 'react';\n${converted}`;
  }
  
  // Add Next.js Head import if title is used
  if (converted.includes('<title>') || converted.includes('document.title')) {
    converted = `import Head from 'next/head';\n${converted}`;
  }
  
  // Convert React Router imports to Next.js
  converted = converted.replace(/import.*from ['"]react-router-dom['"];?\n?/g, '');
  converted = converted.replace(/import.*useNavigate.*from ['"]react-router-dom['"];?\n?/g, '');
  converted = converted.replace(/import.*useLocation.*from ['"]react-router-dom['"];?\n?/g, '');
  converted = converted.replace(/import.*useParams.*from ['"]react-router-dom['"];?\n?/g, '');
  
  // Add Next.js router import if navigation is used
  if (converted.includes('navigate(') || converted.includes('useNavigate')) {
    converted = `import { useRouter } from 'next/router';\n${converted}`;
    converted = converted.replace(/const navigate = useNavigate\(\);?/g, 'const router = useRouter();');
    converted = converted.replace(/navigate\(/g, 'router.push(');
  }
  
  // Add Next.js router import if params are used
  if (converted.includes('useParams')) {
    if (!converted.includes('useRouter')) {
      converted = `import { useRouter } from 'next/router';\n${converted}`;
    }
    converted = converted.replace(/const.*= useParams\(\);?/g, 'const router = useRouter(); const params = router.query;');
  }
  
  // Convert component imports to use relative paths
  converted = converted.replace(/from ['"]\.\.\/components\//g, 'from \'../../components/');
  converted = converted.replace(/from ['"]\.\.\/\.\.\/components\//g, 'from \'../../../components/');
  converted = converted.replace(/from ['"]\.\.\/services\//g, 'from \'../../services/');
  converted = converted.replace(/from ['"]\.\.\/\.\.\/services\//g, 'from \'../../../services/');
  converted = converted.replace(/from ['"]\.\.\/contexts\//g, 'from \'../../contexts/');
  converted = converted.replace(/from ['"]\.\.\/\.\.\/contexts\//g, 'from \'../../../contexts/');
  converted = converted.replace(/from ['"]\.\.\/hooks\//g, 'from \'../../hooks/');
  converted = converted.replace(/from ['"]\.\.\/\.\.\/hooks\//g, 'from \'../../../hooks/');
  
  // Update document.title to use Next.js Head
  if (converted.includes('document.title')) {
    converted = converted.replace(/document\.title = ['"`]([^'"`]+)['"`];?/g, '// Title set via Head component');
    // Add Head component with title
    const headComponent = `
      <Head>
        <title>${title} - Digame</title>
        <meta name="description" content="${title} page for Digame platform" />
      </Head>`;
    
    // Insert Head component after the opening JSX element
    converted = converted.replace(/return \(\s*<([^>]+)>/g, `return (\n    <>\n      ${headComponent}\n      <$1>`);
    converted = converted.replace(/return \(\s*<>/g, `return (\n    <>\n      ${headComponent}`);
    
    // Ensure we close the fragment
    if (converted.includes('<>') && !converted.includes('</>')){
      converted = converted.replace(/\);?\s*$/, '\n    </>\n  );\n');
    }
  }
  
  // Add TypeScript export
  if (!converted.includes('export default')) {
    // Find the component name
    const componentMatch = converted.match(/(?:function|const)\s+(\w+)/);
    if (componentMatch) {
      converted += `\n\nexport default ${componentMatch[1]};`;
    }
  }
  
  // Add React.FC type if it's a functional component
  converted = converted.replace(/const (\w+) = \(\) => {/, 'const $1: React.FC = () => {');
  converted = converted.replace(/function (\w+)\(\) {/, 'const $1: React.FC = () => {');
  
  return converted;
}

// Function to ensure directory exists
function ensureDirectoryExists(filePath) {
  const dirname = path.dirname(filePath);
  if (!fs.existsSync(dirname)) {
    fs.mkdirSync(dirname, { recursive: true });
  }
}

// Main restoration function
function restoreCareerPages() {
  console.log('🚀 Starting Career Development pages restoration...\n');
  
  let successCount = 0;
  let errorCount = 0;
  
  careerPages.forEach((page, index) => {
    try {
      console.log(`📄 Processing ${index + 1}/${careerPages.length}: ${page.title}`);
      console.log(`   Source: ${page.source}`);
      console.log(`   Target: ${page.target}`);
      console.log(`   Route: ${page.route}`);
      
      // Check if source file exists
      if (!fs.existsSync(page.source)) {
        console.log(`   ❌ Source file not found: ${page.source}`);
        errorCount++;
        return;
      }
      
      // Read source file
      const sourceContent = fs.readFileSync(page.source, 'utf8');
      console.log(`   📖 Read source file (${sourceContent.length} characters)`);
      
      // Convert to Next.js TypeScript
      const convertedContent = convertToNextJS(sourceContent, page.title);
      console.log(`   🔄 Converted to TypeScript/Next.js`);
      
      // Ensure target directory exists
      ensureDirectoryExists(page.target);
      
      // Write target file
      fs.writeFileSync(page.target, convertedContent);
      console.log(`   ✅ Created: ${page.target}`);
      
      successCount++;
      
    } catch (error) {
      console.log(`   ❌ Error processing ${page.title}: ${error.message}`);
      errorCount++;
    }
    
    console.log(''); // Empty line for readability
  });
  
  // Summary
  console.log('📊 RESTORATION SUMMARY');
  console.log('========================');
  console.log(`✅ Successfully restored: ${successCount}/${careerPages.length} pages`);
  console.log(`❌ Errors encountered: ${errorCount}/${careerPages.length} pages`);
  console.log(`📁 Target directory: frontend/src/pages/career/`);
  console.log(`🎯 Routes created: /career, /career/jobs, /career/learning, /career/modeling, /career/network, /career/skills`);
  
  if (successCount === careerPages.length) {
    console.log('\n🎉 SUCCESS: All Career Development pages restored successfully!');
    console.log('📋 Next steps:');
    console.log('   1. Test the restored pages in the browser');
    console.log('   2. Update ROUTING_AUDIT.md to mark Section 10 as completed');
    console.log('   3. Proceed to Section 11: Reports & Publishing restoration');
  } else {
    console.log('\n⚠️  Some pages had errors. Please review the output above.');
  }
}

// Run the restoration
restoreCareerPages();