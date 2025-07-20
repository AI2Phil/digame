#!/usr/bin/env node

/**
 * API Call Fixer
 * Automatically fixes broken API calls by updating hardcoded URLs
 */

const fs = require('fs');
const path = require('path');

class ApiCallFixer {
  constructor() {
    this.fixedFiles = [];
    this.errors = [];
    this.stats = {
      filesProcessed: 0,
      callsFixed: 0,
      filesModified: 0
    };
  }

  /**
   * Load broken API calls from latest report
   */
  loadBrokenApiCalls() {
    try {
      const ReportAggregator = require('./report-aggregator');
      const aggregator = new ReportAggregator();
      const brokenLinks = aggregator.getBrokenLinksSummary();
      return brokenLinks.brokenApiCalls || [];
    } catch (error) {
      console.error('Failed to load broken API calls:', error.message);
      return [];
    }
  }

  /**
   * Fix API calls in a file
   */
  fixApiCallsInFile(filePath, brokenCalls) {
    try {
      const projectRoot = path.resolve(process.cwd(), '../..');
      const fullPath = path.resolve(projectRoot, filePath);
      
      if (!fs.existsSync(fullPath)) {
        console.log(`⚠️  File not found: ${filePath}`);
        return false;
      }

      let content = fs.readFileSync(fullPath, 'utf8');
      let modified = false;
      let fixCount = 0;

      // Get broken calls for this specific file
      const fileBrokenCalls = brokenCalls.filter(call => call.file === filePath);
      
      if (fileBrokenCalls.length === 0) {
        return false;
      }

      console.log(`🔧 Fixing ${fileBrokenCalls.length} API calls in ${filePath}`);

      // Add import for API config if not present
      if (!content.includes('api-config') && !content.includes('apiClient')) {
        const importStatement = "import { apiClient, replaceApiUrl } from '../lib/api-config';\n";
        
        // Find the best place to add the import
        const lines = content.split('\n');
        let insertIndex = 0;
        
        // Find last import statement
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].trim().startsWith('import ') || lines[i].trim().startsWith('const ')) {
            insertIndex = i + 1;
          } else if (lines[i].trim() === '' || lines[i].trim().startsWith('//')) {
            continue;
          } else {
            break;
          }
        }
        
        lines.splice(insertIndex, 0, importStatement);
        content = lines.join('\n');
        modified = true;
        console.log(`  ✅ Added API config import`);
      }

      // Fix each broken API call
      for (const call of fileBrokenCalls) {
        const originalEndpoint = call.endpoint;
        
        // Extract the path from the full URL
        let apiPath;
        try {
          const url = new URL(originalEndpoint);
          apiPath = url.pathname + url.search;
        } catch (error) {
          // If it's not a full URL, treat as path
          apiPath = originalEndpoint;
        }

        // Common URL patterns to fix
        const fixes = [
          // Fix port 8001 to dynamic port
          {
            pattern: /http:\/\/localhost:8001/g,
            replacement: '${replaceApiUrl("")}'.replace('""', '""')
          },
          // Fix hardcoded localhost:8001 URLs
          {
            pattern: new RegExp(`http://localhost:8001${apiPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'g'),
            replacement: `\${replaceApiUrl("${apiPath}")}`
          },
          // Fix axios calls with hardcoded URLs
          {
            pattern: new RegExp(`axios\\.(get|post|put|delete)\\(["'\`]http://localhost:8001([^"'\`]+)["'\`]`, 'g'),
            replacement: 'axios.$1(`${replaceApiUrl("$2")}`'
          },
          // Fix fetch calls with hardcoded URLs
          {
            pattern: new RegExp(`fetch\\(["'\`]http://localhost:8001([^"'\`]+)["'\`]`, 'g'),
            replacement: 'fetch(`${replaceApiUrl("$1")}`'
          }
        ];

        for (const fix of fixes) {
          const beforeContent = content;
          content = content.replace(fix.pattern, fix.replacement);
          
          if (content !== beforeContent) {
            modified = true;
            fixCount++;
            console.log(`  ✅ Fixed: ${originalEndpoint}`);
            break;
          }
        }
      }

      // Save the modified file
      if (modified) {
        fs.writeFileSync(fullPath, content);
        this.fixedFiles.push({
          file: filePath,
          fixCount
        });
        this.stats.filesModified++;
        this.stats.callsFixed += fixCount;
        console.log(`  💾 Saved ${filePath} with ${fixCount} fixes`);
        return true;
      }

      return false;
    } catch (error) {
      this.errors.push(`Failed to fix ${filePath}: ${error.message}`);
      console.error(`❌ Error fixing ${filePath}:`, error.message);
      return false;
    }
  }

  /**
   * Run the API call fixer
   */
  async run() {
    console.log('🚀 Starting API Call Fixer...\n');

    const brokenCalls = this.loadBrokenApiCalls();
    
    if (brokenCalls.length === 0) {
      console.log('✅ No broken API calls found!');
      return;
    }

    console.log(`📋 Found ${brokenCalls.length} broken API calls to fix\n`);

    // Group broken calls by file
    const fileGroups = {};
    brokenCalls.forEach(call => {
      if (!fileGroups[call.file]) {
        fileGroups[call.file] = [];
      }
      fileGroups[call.file].push(call);
    });

    // Fix each file
    for (const [filePath, calls] of Object.entries(fileGroups)) {
      this.stats.filesProcessed++;
      this.fixApiCallsInFile(filePath, calls);
    }

    // Print summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 API Call Fixer Summary');
    console.log('='.repeat(60));
    console.log(`Files Processed: ${this.stats.filesProcessed}`);
    console.log(`Files Modified: ${this.stats.filesModified}`);
    console.log(`API Calls Fixed: ${this.stats.callsFixed}`);
    
    if (this.errors.length > 0) {
      console.log(`\n❌ Errors: ${this.errors.length}`);
      this.errors.forEach(error => console.log(`  - ${error}`));
    }

    if (this.fixedFiles.length > 0) {
      console.log('\n✅ Fixed Files:');
      this.fixedFiles.forEach(({ file, fixCount }) => {
        console.log(`  - ${file} (${fixCount} fixes)`);
      });
    }

    console.log('\n🎉 API Call fixing complete!');
    console.log('💡 Run the routing audit again to verify fixes:');
    console.log('   node audit-runner.js --skip-testing');
  }
}

// Run if called directly
if (require.main === module) {
  const fixer = new ApiCallFixer();
  fixer.run().catch(console.error);
}

module.exports = ApiCallFixer;