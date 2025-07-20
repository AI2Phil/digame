#!/usr/bin/env node

/**
 * Navigation Link and API Reference Analyzer
 * Scans frontend code for internal links and API calls to detect broken references
 */

const fs = require('fs');
const path = require('path');

class LinkAnalyzer {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      navigation: {
        links: [],
        broken: [],
        external: [],
        dynamic: []
      },
      apiCalls: {
        endpoints: [],
        broken: [],
        mismatched: []
      },
      imports: {
        components: [],
        broken: [],
        circular: []
      },
      issues: [],
      summary: {}
    };
    
    this.knownRoutes = new Set();
    this.knownApiEndpoints = new Set();
  }

  /**
   * Load known routes from route map using aggregator
   */
  loadKnownRoutes() {
    try {
      const ReportAggregator = require('./report-aggregator');
      const aggregator = new ReportAggregator();
      
      const routeMap = aggregator.loadRouteMappingData();
      
      // Load frontend routes
      routeMap.frontend.active.forEach(route => this.knownRoutes.add(route.route));
      routeMap.frontend.api.forEach(route => this.knownRoutes.add(route.route));
      
      // Load backend endpoints
      routeMap.backend.endpoints.forEach(endpoint => {
        this.knownApiEndpoints.add(endpoint.path);
      });
      
      console.log(`📖 Loaded ${this.knownRoutes.size} known routes and ${this.knownApiEndpoints.size} API endpoints`);
    } catch (error) {
      console.log('⚠️  Could not load route map, proceeding without known routes validation');
      console.log(`    Error: ${error.message}`);
    }
  }

  /**
   * Analyze all frontend files
   */
  async analyzeFrontend() {
    console.log('🔍 Analyzing frontend navigation and API calls...');
    
    // Get project root directory (go up two levels from scripts/routing-audit)
    const projectRoot = path.resolve(process.cwd(), '../..');
    const frontendDir = path.join(projectRoot, 'frontend/src');
    await this.scanDirectory(frontendDir);
    
    console.log(`✅ Analyzed frontend files`);
  }

  /**
   * Scan directory recursively
   */
  async scanDirectory(dir) {
    if (!fs.existsSync(dir)) return;

    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        // Skip node_modules and other irrelevant directories
        if (!['node_modules', '.next', 'dist', 'build', '.git'].includes(item)) {
          await this.scanDirectory(fullPath);
        }
      } else if (this.isAnalyzableFile(item)) {
        await this.analyzeFile(fullPath);
      }
    }
  }

  /**
   * Check if file should be analyzed
   */
  isAnalyzableFile(filename) {
    const extensions = ['.js', '.jsx', '.ts', '.tsx'];
    const ext = path.extname(filename);
    return extensions.includes(ext) && !filename.includes('.test.') && !filename.includes('.spec.');
  }

  /**
   * Analyze individual file
   */
  async analyzeFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const projectRoot = path.resolve(process.cwd(), '../..');
      const relativePath = path.relative(projectRoot, filePath);
      
      // Analyze navigation links
      this.analyzeNavigationLinks(content, relativePath);
      
      // Analyze API calls
      this.analyzeApiCalls(content, relativePath);
      
      // Analyze imports
      this.analyzeImports(content, relativePath);
      
    } catch (error) {
      this.results.issues.push(`Failed to analyze ${filePath}: ${error.message}`);
    }
  }

  /**
   * Analyze navigation links in file
   */
  analyzeNavigationLinks(content, filePath) {
    // Patterns for different types of navigation
    const patterns = [
      // Next.js Link component
      {
        name: 'Next.js Link',
        regex: /<Link[^>]+href=["']([^"']+)["']/g,
        type: 'link'
      },
      // Router push/replace
      {
        name: 'Router navigation',
        regex: /router\.(push|replace)\(["']([^"']+)["']/g,
        type: 'router',
        pathIndex: 2
      },
      // useRouter hook navigation
      {
        name: 'useRouter navigation',
        regex: /\.push\(["']([^"']+)["']/g,
        type: 'router'
      },
      // Regular anchor tags
      {
        name: 'Anchor tag',
        regex: /<a[^>]+href=["']([^"']+)["']/g,
        type: 'anchor'
      },
      // window.location
      {
        name: 'Window location',
        regex: /window\.location\.href\s*=\s*["']([^"']+)["']/g,
        type: 'location'
      }
    ];

    for (const pattern of patterns) {
      let match;
      while ((match = pattern.regex.exec(content)) !== null) {
        const url = match[pattern.pathIndex || 1];
        
        if (this.isInternalLink(url)) {
          const linkInfo = {
            file: filePath,
            type: pattern.name,
            url,
            line: this.getLineNumber(content, match.index),
            isExternal: false,
            isDynamic: this.isDynamicLink(url),
            isBroken: this.knownRoutes.size > 0 ? !this.isKnownRoute(url) : null
          };
          
          this.results.navigation.links.push(linkInfo);
          
          if (linkInfo.isBroken) {
            this.results.navigation.broken.push(linkInfo);
          }
          
          if (linkInfo.isDynamic) {
            this.results.navigation.dynamic.push(linkInfo);
          }
        } else {
          this.results.navigation.external.push({
            file: filePath,
            type: pattern.name,
            url,
            line: this.getLineNumber(content, match.index)
          });
        }
      }
    }
  }

  /**
   * Analyze API calls in file
   */
  analyzeApiCalls(content, filePath) {
    const patterns = [
      // Axios calls
      {
        name: 'Axios',
        regex: /axios\.(get|post|put|delete|patch)\(["']([^"']+)["']/g,
        pathIndex: 2
      },
      // Fetch calls
      {
        name: 'Fetch',
        regex: /fetch\(["']([^"']+)["']/g
      },
      // API endpoint constants/variables
      {
        name: 'API endpoint',
        regex: /(?:API_|ENDPOINT_|api)[A-Z_]*\s*=\s*["']([^"']+)["']/g
      },
      // Template literals with API calls
      {
        name: 'Template API call',
        regex: /(?:axios\.|fetch\()`([^`]+)`/g
      }
    ];

    for (const pattern of patterns) {
      let match;
      while ((match = pattern.regex.exec(content)) !== null) {
        const endpoint = match[pattern.pathIndex || 1];
        
        if (this.isApiEndpoint(endpoint)) {
          const apiInfo = {
            file: filePath,
            type: pattern.name,
            endpoint,
            line: this.getLineNumber(content, match.index),
            isBroken: this.knownApiEndpoints.size > 0 ? !this.isKnownApiEndpoint(endpoint) : null,
            isDynamic: this.isDynamicEndpoint(endpoint)
          };
          
          this.results.apiCalls.endpoints.push(apiInfo);
          
          if (apiInfo.isBroken) {
            this.results.apiCalls.broken.push(apiInfo);
          }
        }
      }
    }
  }

  /**
   * Analyze imports in file
   */
  analyzeImports(content, filePath) {
    const patterns = [
      // ES6 imports
      {
        name: 'ES6 import',
        regex: /import\s+(?:{[^}]+}|\w+|\*\s+as\s+\w+)\s+from\s+["']([^"']+)["']/g
      },
      // Dynamic imports
      {
        name: 'Dynamic import',
        regex: /import\(["']([^"']+)["']\)/g
      },
      // Require statements
      {
        name: 'Require',
        regex: /require\(["']([^"']+)["']\)/g
      }
    ];

    for (const pattern of patterns) {
      let match;
      while ((match = pattern.regex.exec(content)) !== null) {
        const importPath = match[1];
        
        if (this.isRelativeImport(importPath)) {
          const importInfo = {
            file: filePath,
            type: pattern.name,
            path: importPath,
            line: this.getLineNumber(content, match.index),
            resolvedPath: this.resolveImportPath(filePath, importPath),
            exists: null
          };
          
          // Check if imported file exists
          if (importInfo.resolvedPath) {
            importInfo.exists = fs.existsSync(importInfo.resolvedPath);
            if (!importInfo.exists) {
              this.results.imports.broken.push(importInfo);
            }
          }
          
          this.results.imports.components.push(importInfo);
        }
      }
    }
  }

  /**
   * Check if URL is internal link
   */
  isInternalLink(url) {
    return url.startsWith('/') && !url.startsWith('//') && !url.startsWith('http');
  }

  /**
   * Check if URL is API endpoint
   */
  isApiEndpoint(url) {
    return url.startsWith('/api') || url.includes('localhost') || url.includes('127.0.0.1');
  }

  /**
   * Check if link is dynamic (contains parameters)
   */
  isDynamicLink(url) {
    return url.includes('${') || url.includes('[') || url.includes('{');
  }

  /**
   * Check if endpoint is dynamic
   */
  isDynamicEndpoint(endpoint) {
    return endpoint.includes('${') || endpoint.includes('[') || endpoint.includes('{');
  }

  /**
   * Check if route is known
   */
  isKnownRoute(url) {
    // Remove query parameters and fragments
    const cleanUrl = url.split('?')[0].split('#')[0];
    return this.knownRoutes.has(cleanUrl);
  }

  /**
   * Check if API endpoint is known
   */
  isKnownApiEndpoint(endpoint) {
    // Remove query parameters and clean up
    const cleanEndpoint = endpoint.split('?')[0];
    return Array.from(this.knownApiEndpoints).some(known => 
      cleanEndpoint === known || cleanEndpoint.startsWith(known)
    );
  }

  /**
   * Check if import is relative
   */
  isRelativeImport(importPath) {
    return importPath.startsWith('./') || importPath.startsWith('../') || importPath.startsWith('@/');
  }

  /**
   * Resolve import path to absolute path
   */
  resolveImportPath(currentFile, importPath) {
    try {
      // Get the project root directory (go up two levels from scripts/routing-audit)
      const projectRoot = path.resolve(process.cwd(), '../..');
      
      // Convert the current file path to be relative to project root
      const currentFileAbsolute = path.resolve(projectRoot, currentFile);
      const currentDir = path.dirname(currentFileAbsolute);
      
      if (importPath.startsWith('@/')) {
        // Handle alias imports (assuming @/ maps to src/)
        const srcPath = path.join(projectRoot, 'frontend/src');
        return path.resolve(srcPath, importPath.substring(2));
      }
      
      const resolved = path.resolve(currentDir, importPath);
      
      // Try different extensions
      const extensions = ['', '.js', '.jsx', '.ts', '.tsx', '/index.js', '/index.jsx', '/index.ts', '/index.tsx'];
      
      for (const ext of extensions) {
        const fullPath = resolved + ext;
        if (fs.existsSync(fullPath)) {
          return fullPath;
        }
      }
      
      return resolved;
    } catch (error) {
      return null;
    }
  }

  /**
   * Get line number for a match index
   */
  getLineNumber(content, index) {
    return content.substring(0, index).split('\n').length;
  }

  /**
   * Generate comprehensive analysis report
   */
  generateReport() {
    this.results.summary = {
      navigation: {
        totalLinks: this.results.navigation.links.length,
        brokenLinks: this.results.navigation.broken.length,
        externalLinks: this.results.navigation.external.length,
        dynamicLinks: this.results.navigation.dynamic.length
      },
      apiCalls: {
        totalCalls: this.results.apiCalls.endpoints.length,
        brokenCalls: this.results.apiCalls.broken.length,
        dynamicCalls: this.results.apiCalls.endpoints.filter(api => api.isDynamic).length
      },
      imports: {
        totalImports: this.results.imports.components.length,
        brokenImports: this.results.imports.broken.length
      },
      criticalIssues: this.results.navigation.broken.length + 
                     this.results.apiCalls.broken.length + 
                     this.results.imports.broken.length
    };

    return this.results;
  }

  /**
   * Save analysis report in segmented files
   */
  saveReport(report) {
    const outputDir = path.join(process.cwd(), 'reports');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const baseDir = path.join(outputDir, `link-analysis-${timestamp}`);
    
    // Create segmented directory
    if (!fs.existsSync(baseDir)) {
      fs.mkdirSync(baseDir, { recursive: true });
    }

    // Save summary and metadata
    const summary = {
      timestamp: report.timestamp,
      summary: report.summary,
      issues: report.issues
    };
    fs.writeFileSync(path.join(baseDir, 'summary.json'), JSON.stringify(summary, null, 2));

    // Save navigation data in chunks
    this.saveNavigationData(baseDir, report.navigation);

    // Save API calls data in chunks
    this.saveApiCallsData(baseDir, report.apiCalls);

    // Save imports data in chunks
    this.saveImportsData(baseDir, report.imports);

    console.log(`📊 Segmented link analysis reports saved to: ${baseDir}`);
    
    return baseDir;
  }

  /**
   * Save navigation data in manageable chunks
   */
  saveNavigationData(baseDir, navigation) {
    const navDir = path.join(baseDir, 'navigation');
    if (!fs.existsSync(navDir)) {
      fs.mkdirSync(navDir, { recursive: true });
    }

    // Save all links in chunks of 100
    this.saveDataInChunks(path.join(navDir, 'links'), navigation.links, 100);
    
    // Save broken links (usually smaller)
    fs.writeFileSync(path.join(navDir, 'broken.json'), JSON.stringify(navigation.broken, null, 2));
    
    // Save external links in chunks of 50
    this.saveDataInChunks(path.join(navDir, 'external'), navigation.external, 50);
    
    // Save dynamic links (usually smaller)
    fs.writeFileSync(path.join(navDir, 'dynamic.json'), JSON.stringify(navigation.dynamic, null, 2));
  }

  /**
   * Save API calls data in manageable chunks
   */
  saveApiCallsData(baseDir, apiCalls) {
    const apiDir = path.join(baseDir, 'api-calls');
    if (!fs.existsSync(apiDir)) {
      fs.mkdirSync(apiDir, { recursive: true });
    }

    // Save all endpoints in chunks of 100
    this.saveDataInChunks(path.join(apiDir, 'endpoints'), apiCalls.endpoints, 100);
    
    // Save broken calls (usually smaller)
    fs.writeFileSync(path.join(apiDir, 'broken.json'), JSON.stringify(apiCalls.broken, null, 2));
    
    // Save mismatched calls (usually smaller)
    fs.writeFileSync(path.join(apiDir, 'mismatched.json'), JSON.stringify(apiCalls.mismatched, null, 2));
  }

  /**
   * Save imports data in manageable chunks
   */
  saveImportsData(baseDir, imports) {
    const importsDir = path.join(baseDir, 'imports');
    if (!fs.existsSync(importsDir)) {
      fs.mkdirSync(importsDir, { recursive: true });
    }

    // Save all components in chunks of 100
    this.saveDataInChunks(path.join(importsDir, 'components'), imports.components, 100);
    
    // Save broken imports (usually smaller)
    fs.writeFileSync(path.join(importsDir, 'broken.json'), JSON.stringify(imports.broken, null, 2));
    
    // Save circular imports (usually smaller)
    fs.writeFileSync(path.join(importsDir, 'circular.json'), JSON.stringify(imports.circular, null, 2));
  }

  /**
   * Save data in chunks to separate files
   */
  saveDataInChunks(baseDir, data, chunkSize) {
    if (!fs.existsSync(baseDir)) {
      fs.mkdirSync(baseDir, { recursive: true });
    }

    for (let i = 0; i < data.length; i += chunkSize) {
      const chunk = data.slice(i, i + chunkSize);
      const chunkNumber = Math.floor(i / chunkSize) + 1;
      const filename = `chunk-${chunkNumber.toString().padStart(3, '0')}.json`;
      
      fs.writeFileSync(path.join(baseDir, filename), JSON.stringify(chunk, null, 2));
    }

    // Save index file for easy reconstruction
    const index = {
      totalItems: data.length,
      chunkSize,
      totalChunks: Math.ceil(data.length / chunkSize),
      files: []
    };

    for (let i = 1; i <= index.totalChunks; i++) {
      index.files.push(`chunk-${i.toString().padStart(3, '0')}.json`);
    }

    fs.writeFileSync(path.join(baseDir, 'index.json'), JSON.stringify(index, null, 2));
  }

  /**
   * Run comprehensive link analysis
   */
  async run() {
    console.log('🚀 Starting comprehensive link and API analysis...\n');
    
    this.loadKnownRoutes();
    await this.analyzeFrontend();
    
    const report = this.generateReport();
    const reportPath = this.saveReport(report);
    
    console.log('\n📋 Link Analysis Summary:');
    console.log(`Navigation Links: ${report.summary.navigation.totalLinks} (${report.summary.navigation.brokenLinks} broken)`);
    console.log(`API Calls: ${report.summary.apiCalls.totalCalls} (${report.summary.apiCalls.brokenCalls} broken)`);
    console.log(`Imports: ${report.summary.imports.totalImports} (${report.summary.imports.brokenImports} broken)`);
    console.log(`Critical Issues: ${report.summary.criticalIssues}`);
    
    if (report.summary.criticalIssues > 0) {
      console.log('\n⚠️  Critical Issues Found:');
      if (report.summary.navigation.brokenLinks > 0) {
        console.log(`  - ${report.summary.navigation.brokenLinks} broken navigation links`);
      }
      if (report.summary.apiCalls.brokenCalls > 0) {
        console.log(`  - ${report.summary.apiCalls.brokenCalls} broken API calls`);
      }
      if (report.summary.imports.brokenImports > 0) {
        console.log(`  - ${report.summary.imports.brokenImports} broken imports`);
      }
    }
    
    return report;
  }
}

// Run if called directly
if (require.main === module) {
  const analyzer = new LinkAnalyzer();
  analyzer.run().catch(console.error);
}

module.exports = LinkAnalyzer;