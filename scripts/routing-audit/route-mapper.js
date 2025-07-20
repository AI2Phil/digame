#!/usr/bin/env node

/**
 * Comprehensive Route Mapping Tool
 * Maps all frontend Next.js routes and backend FastAPI endpoints
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class RouteMapper {
  constructor() {
    this.frontendRoutes = [];
    this.backendRoutes = [];
    this.archivedRoutes = [];
    this.conflicts = [];
    this.results = {
      timestamp: new Date().toISOString(),
      frontend: {
        active: [],
        archived: [],
        api: [],
        dynamic: [],
        conflicts: []
      },
      backend: {
        endpoints: [],
        prefixes: new Set(),
        websockets: [],
        protected: [],
        public: []
      },
      issues: []
    };
  }

  /**
   * Map all frontend Next.js routes
   */
  mapFrontendRoutes() {
    console.log('🔍 Mapping frontend routes...');
    
    // Map active routes
    this.mapActiveRoutes();
    
    // Map archived routes
    this.mapArchivedRoutes();
    
    // Map API routes
    this.mapApiRoutes();
    
    // Detect conflicts
    this.detectRouteConflicts();
  }

  /**
   * Map active Next.js pages
   */
  mapActiveRoutes() {
    // Get project root directory (go up two levels from scripts/routing-audit)
    const projectRoot = path.resolve(process.cwd(), '../..');
    const pagesDir = path.join(projectRoot, 'frontend/src/pages');
    if (!fs.existsSync(pagesDir)) {
      this.results.issues.push('Active pages directory not found: frontend/src/pages');
      console.log('ℹ️  Active pages directory not found, checking for alternative structure...');
      return;
    }

    const routes = this.scanDirectory(pagesDir, pagesDir);
    this.results.frontend.active = routes.map(route => ({
      file: route,
      route: this.fileToRoute(route, pagesDir),
      type: this.getRouteType(route),
      dynamic: this.isDynamicRoute(route)
    }));

    console.log(`✅ Found ${this.results.frontend.active.length} active routes`);
  }

  /**
   * Map archived Next.js pages
   */
  mapArchivedRoutes() {
    // Get project root directory (go up two levels from scripts/routing-audit)
    const projectRoot = path.resolve(process.cwd(), '../..');
    const archivedDir = path.join(projectRoot, 'frontend/pages_archived_20250717_193641');
    if (!fs.existsSync(archivedDir)) {
      console.log('ℹ️  Archived pages directory not found, skipping archived route mapping');
      return;
    }

    const routes = this.scanDirectory(archivedDir, archivedDir);
    this.results.frontend.archived = routes.map(route => ({
      file: route,
      route: this.fileToRoute(route, archivedDir),
      type: this.getRouteType(route),
      dynamic: this.isDynamicRoute(route)
    }));

    console.log(`✅ Found ${this.results.frontend.archived.length} archived routes`);
  }

  /**
   * Map API routes in frontend
   */
  mapApiRoutes() {
    // Get project root directory (go up two levels from scripts/routing-audit)
    const projectRoot = path.resolve(process.cwd(), '../..');
    const apiDir = path.join(projectRoot, 'frontend/src/pages/api');
    if (!fs.existsSync(apiDir)) {
      console.log('ℹ️  No frontend API routes found');
      return;
    }

    const routes = this.scanDirectory(apiDir, apiDir);
    this.results.frontend.api = routes.map(route => ({
      file: route,
      route: '/api' + this.fileToRoute(route, apiDir),
      type: 'api'
    }));

    console.log(`✅ Found ${this.results.frontend.api.length} frontend API routes`);
  }

  /**
   * Scan directory recursively for route files
   */
  scanDirectory(dir, baseDir) {
    const routes = [];
    
    if (!fs.existsSync(dir)) return routes;

    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        routes.push(...this.scanDirectory(fullPath, baseDir));
      } else if (this.isRouteFile(item)) {
        routes.push(path.relative(baseDir, fullPath));
      }
    }
    
    return routes;
  }

  /**
   * Check if file is a valid route file
   */
  isRouteFile(filename) {
    const routeExtensions = ['.js', '.jsx', '.ts', '.tsx'];
    const ext = path.extname(filename);
    return routeExtensions.includes(ext) && !filename.startsWith('_') && !filename.includes('.test.');
  }

  /**
   * Convert file path to Next.js route
   */
  fileToRoute(filePath, baseDir) {
    let route = '/' + filePath.replace(/\\/g, '/');
    
    // Remove file extension
    route = route.replace(/\.(js|jsx|ts|tsx)$/, '');
    
    // Handle index files
    route = route.replace(/\/index$/, '') || '/';
    
    return route;
  }

  /**
   * Determine route type
   */
  getRouteType(filePath) {
    if (filePath.includes('[') && filePath.includes(']')) {
      if (filePath.includes('[...')) return 'catch-all';
      if (filePath.includes('[[...')) return 'optional-catch-all';
      return 'dynamic';
    }
    if (filePath.startsWith('api/')) return 'api';
    return 'static';
  }

  /**
   * Check if route is dynamic
   */
  isDynamicRoute(filePath) {
    return filePath.includes('[') && filePath.includes(']');
  }

  /**
   * Detect route conflicts between active and archived
   */
  detectRouteConflicts() {
    const activeRoutes = new Set(this.results.frontend.active.map(r => r.route));
    const archivedRoutes = new Set(this.results.frontend.archived.map(r => r.route));
    
    for (const route of activeRoutes) {
      if (archivedRoutes.has(route)) {
        this.results.frontend.conflicts.push({
          route,
          type: 'active-archived-conflict',
          description: `Route exists in both active and archived pages`
        });
      }
    }

    console.log(`⚠️  Found ${this.results.frontend.conflicts.length} route conflicts`);
  }

  /**
   * Map backend FastAPI endpoints
   */
  mapBackendRoutes() {
    console.log('🔍 Mapping backend routes...');
    
    try {
      // Find all Python router files
      const routerFiles = this.findRouterFiles();
      
      for (const file of routerFiles) {
        this.extractEndpointsFromFile(file);
      }
      
      // Extract unique prefixes
      this.results.backend.prefixes = Array.from(this.results.backend.prefixes);
      
      console.log(`✅ Found ${this.results.backend.endpoints.length} backend endpoints`);
      console.log(`✅ Found ${this.results.backend.prefixes.length} unique prefixes`);
      
    } catch (error) {
      this.results.issues.push(`Backend route mapping failed: ${error.message}`);
    }
  }

  /**
   * Find all router files in the backend
   */
  findRouterFiles() {
    // Get project root directory (go up two levels from scripts/routing-audit)
    const projectRoot = path.resolve(process.cwd(), '../..');
    const appDir = path.join(projectRoot, 'app');
    const routerFiles = [];
    
    const scanForRouters = (dir) => {
      if (!fs.existsSync(dir)) return;
      
      const items = fs.readdirSync(dir);
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          scanForRouters(fullPath);
        } else if (item.endsWith('.py') && (item.includes('router') || item.includes('api') || item === 'main.py')) {
          routerFiles.push(fullPath);
        }
      }
    };
    
    scanForRouters(appDir);
    console.log(`🔍 Found ${routerFiles.length} Python files to scan for routes`);
    return routerFiles;
  }

  /**
   * Extract endpoints from a Python file
   */
  extractEndpointsFromFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const projectRoot = path.resolve(process.cwd(), '../..');
      const relativePath = path.relative(projectRoot, filePath);
      
      // Extract router prefix
      const prefixMatch = content.match(/APIRouter\([^)]*prefix=["']([^"']+)["']/);
      const prefix = prefixMatch ? prefixMatch[1] : '';
      
      if (prefix) {
        this.results.backend.prefixes.add(prefix);
      }
      
      // Extract route decorators - more comprehensive patterns
      const patterns = [
        /@router\.(get|post|put|delete|patch|websocket)\(["']([^"']+)["']/g,
        /@app\.(get|post|put|delete|patch|websocket)\(["']([^"']+)["']/g,
        /router\.(get|post|put|delete|patch|websocket)\(["']([^"']+)["']/g
      ];
      
      for (const routePattern of patterns) {
        let match;
        while ((match = routePattern.exec(content)) !== null) {
          const [, method, path] = match;
          const fullPath = prefix + path;
          
          const endpoint = {
            method: method.toUpperCase(),
            path: fullPath,
            file: relativePath,
            prefix,
            isWebSocket: method === 'websocket'
          };
          
          this.results.backend.endpoints.push(endpoint);
          
          if (method === 'websocket') {
            this.results.backend.websockets.push(endpoint);
          }
        }
      }
      
    } catch (error) {
      this.results.issues.push(`Failed to parse ${filePath}: ${error.message}`);
    }
  }

  /**
   * Generate comprehensive report
   */
  generateReport() {
    const report = {
      ...this.results,
      summary: {
        frontend: {
          totalActive: this.results.frontend.active.length,
          totalArchived: this.results.frontend.archived.length,
          totalApi: this.results.frontend.api.length,
          dynamicRoutes: this.results.frontend.active.filter(r => r.dynamic).length,
          conflicts: this.results.frontend.conflicts.length
        },
        backend: {
          totalEndpoints: this.results.backend.endpoints.length,
          totalPrefixes: this.results.backend.prefixes.length,
          websocketEndpoints: this.results.backend.websockets.length,
          httpMethods: this.getHttpMethodStats()
        },
        issues: this.results.issues.length
      }
    };

    return report;
  }

  /**
   * Get HTTP method statistics
   */
  getHttpMethodStats() {
    const stats = {};
    for (const endpoint of this.results.backend.endpoints) {
      if (!endpoint.isWebSocket) {
        stats[endpoint.method] = (stats[endpoint.method] || 0) + 1;
      }
    }
    return stats;
  }

  /**
   * Save report to segmented files
   */
  saveReport(report) {
    const outputDir = path.join(process.cwd(), 'reports');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const baseDir = path.join(outputDir, `route-map-${timestamp}`);
    
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

    // Save frontend routes in chunks
    this.saveFrontendRoutes(baseDir, report.frontend);

    // Save backend routes in chunks
    this.saveBackendRoutes(baseDir, report.backend);

    console.log(`📊 Segmented reports saved to: ${baseDir}`);
    
    return baseDir;
  }

  /**
   * Save frontend routes in manageable chunks
   */
  saveFrontendRoutes(baseDir, frontend) {
    const frontendDir = path.join(baseDir, 'frontend');
    if (!fs.existsSync(frontendDir)) {
      fs.mkdirSync(frontendDir, { recursive: true });
    }

    // Save active routes in chunks of 50
    this.saveRoutesInChunks(path.join(frontendDir, 'active'), frontend.active, 50);
    
    // Save archived routes in chunks of 50
    this.saveRoutesInChunks(path.join(frontendDir, 'archived'), frontend.archived, 50);
    
    // Save API routes (usually small)
    fs.writeFileSync(path.join(frontendDir, 'api.json'), JSON.stringify(frontend.api, null, 2));
    
    // Save conflicts (usually small)
    fs.writeFileSync(path.join(frontendDir, 'conflicts.json'), JSON.stringify(frontend.conflicts, null, 2));
  }

  /**
   * Save backend routes in manageable chunks
   */
  saveBackendRoutes(baseDir, backend) {
    const backendDir = path.join(baseDir, 'backend');
    if (!fs.existsSync(backendDir)) {
      fs.mkdirSync(backendDir, { recursive: true });
    }

    // Save endpoints in chunks of 100
    this.saveRoutesInChunks(path.join(backendDir, 'endpoints'), backend.endpoints, 100);
    
    // Save prefixes (small)
    fs.writeFileSync(path.join(backendDir, 'prefixes.json'), JSON.stringify(backend.prefixes, null, 2));
    
    // Save websockets (usually small)
    fs.writeFileSync(path.join(backendDir, 'websockets.json'), JSON.stringify(backend.websockets, null, 2));
  }

  /**
   * Save routes in chunks to separate files
   */
  saveRoutesInChunks(baseDir, routes, chunkSize) {
    if (!fs.existsSync(baseDir)) {
      fs.mkdirSync(baseDir, { recursive: true });
    }

    for (let i = 0; i < routes.length; i += chunkSize) {
      const chunk = routes.slice(i, i + chunkSize);
      const chunkNumber = Math.floor(i / chunkSize) + 1;
      const filename = `chunk-${chunkNumber.toString().padStart(3, '0')}.json`;
      
      fs.writeFileSync(path.join(baseDir, filename), JSON.stringify(chunk, null, 2));
    }

    // Save index file for easy reconstruction
    const index = {
      totalItems: routes.length,
      chunkSize,
      totalChunks: Math.ceil(routes.length / chunkSize),
      files: []
    };

    for (let i = 1; i <= index.totalChunks; i++) {
      index.files.push(`chunk-${i.toString().padStart(3, '0')}.json`);
    }

    fs.writeFileSync(path.join(baseDir, 'index.json'), JSON.stringify(index, null, 2));
  }

  /**
   * Run complete route mapping
   */
  async run() {
    console.log('🚀 Starting comprehensive route mapping...\n');
    
    this.mapFrontendRoutes();
    this.mapBackendRoutes();
    
    const report = this.generateReport();
    const reportPath = this.saveReport(report);
    
    console.log('\n📋 Route Mapping Summary:');
    console.log(`Frontend Active Routes: ${report.summary.frontend.totalActive}`);
    console.log(`Frontend Archived Routes: ${report.summary.frontend.totalArchived}`);
    console.log(`Frontend API Routes: ${report.summary.frontend.totalApi}`);
    console.log(`Backend Endpoints: ${report.summary.backend.totalEndpoints}`);
    console.log(`WebSocket Endpoints: ${report.summary.backend.websocketEndpoints}`);
    console.log(`Route Conflicts: ${report.summary.frontend.conflicts}`);
    console.log(`Issues Found: ${report.summary.issues}`);
    
    if (report.summary.issues > 0) {
      console.log('\n⚠️  Issues found:');
      report.issues.forEach(issue => console.log(`  - ${issue}`));
    }
    
    return report;
  }
}

// Run if called directly
if (require.main === module) {
  const mapper = new RouteMapper();
  mapper.run().catch(console.error);
}

module.exports = RouteMapper;