#!/usr/bin/env node

/**
 * Report Aggregation Utility
 * Reads and reconstructs data from segmented audit reports
 */

const fs = require('fs');
const path = require('path');

class ReportAggregator {
  constructor() {
    this.reportsDir = path.join(process.cwd(), 'reports');
  }

  /**
   * Get the latest report directory for a given type
   */
  getLatestReportDir(type) {
    if (!fs.existsSync(this.reportsDir)) {
      throw new Error('Reports directory not found');
    }

    const dirs = fs.readdirSync(this.reportsDir)
      .filter(item => {
        const fullPath = path.join(this.reportsDir, item);
        return fs.statSync(fullPath).isDirectory() && item.startsWith(type);
      })
      .sort()
      .reverse();

    if (dirs.length === 0) {
      throw new Error(`No ${type} reports found`);
    }

    return path.join(this.reportsDir, dirs[0]);
  }

  /**
   * Load summary from a segmented report
   */
  loadSummary(reportDir) {
    const summaryPath = path.join(reportDir, 'summary.json');
    if (!fs.existsSync(summaryPath)) {
      throw new Error(`Summary not found in ${reportDir}`);
    }
    return JSON.parse(fs.readFileSync(summaryPath, 'utf8'));
  }

  /**
   * Reconstruct chunked data from a directory
   */
  reconstructChunkedData(chunkDir) {
    if (!fs.existsSync(chunkDir)) {
      return [];
    }

    const indexPath = path.join(chunkDir, 'index.json');
    if (!fs.existsSync(indexPath)) {
      // Fallback: read all chunk files
      const files = fs.readdirSync(chunkDir)
        .filter(f => f.startsWith('chunk-') && f.endsWith('.json'))
        .sort();
      
      const data = [];
      for (const file of files) {
        const chunk = JSON.parse(fs.readFileSync(path.join(chunkDir, file), 'utf8'));
        data.push(...chunk);
      }
      return data;
    }

    const index = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
    const data = [];

    for (const filename of index.files) {
      const chunkPath = path.join(chunkDir, filename);
      if (fs.existsSync(chunkPath)) {
        const chunk = JSON.parse(fs.readFileSync(chunkPath, 'utf8'));
        data.push(...chunk);
      }
    }

    return data;
  }

  /**
   * Load complete route mapping data
   */
  loadRouteMappingData(reportDir = null) {
    if (!reportDir) {
      reportDir = this.getLatestReportDir('route-map-');
    }

    const summary = this.loadSummary(reportDir);
    
    // Reconstruct frontend data
    const frontendDir = path.join(reportDir, 'frontend');
    const frontend = {
      active: this.reconstructChunkedData(path.join(frontendDir, 'active')),
      archived: this.reconstructChunkedData(path.join(frontendDir, 'archived')),
      api: this.loadJsonFile(path.join(frontendDir, 'api.json')),
      conflicts: this.loadJsonFile(path.join(frontendDir, 'conflicts.json'))
    };

    // Reconstruct backend data
    const backendDir = path.join(reportDir, 'backend');
    const backend = {
      endpoints: this.reconstructChunkedData(path.join(backendDir, 'endpoints')),
      prefixes: this.loadJsonFile(path.join(backendDir, 'prefixes.json')),
      websockets: this.loadJsonFile(path.join(backendDir, 'websockets.json'))
    };

    return {
      ...summary,
      frontend,
      backend
    };
  }

  /**
   * Load complete link analysis data
   */
  loadLinkAnalysisData(reportDir = null) {
    if (!reportDir) {
      reportDir = this.getLatestReportDir('link-analysis-');
    }

    const summary = this.loadSummary(reportDir);

    // Reconstruct navigation data
    const navDir = path.join(reportDir, 'navigation');
    const navigation = {
      links: this.reconstructChunkedData(path.join(navDir, 'links')),
      broken: this.loadJsonFile(path.join(navDir, 'broken.json')),
      external: this.reconstructChunkedData(path.join(navDir, 'external')),
      dynamic: this.loadJsonFile(path.join(navDir, 'dynamic.json'))
    };

    // Reconstruct API calls data
    const apiDir = path.join(reportDir, 'api-calls');
    const apiCalls = {
      endpoints: this.reconstructChunkedData(path.join(apiDir, 'endpoints')),
      broken: this.loadJsonFile(path.join(apiDir, 'broken.json')),
      mismatched: this.loadJsonFile(path.join(apiDir, 'mismatched.json'))
    };

    // Reconstruct imports data
    const importsDir = path.join(reportDir, 'imports');
    const imports = {
      components: this.reconstructChunkedData(path.join(importsDir, 'components')),
      broken: this.loadJsonFile(path.join(importsDir, 'broken.json')),
      circular: this.loadJsonFile(path.join(importsDir, 'circular.json'))
    };

    return {
      ...summary,
      navigation,
      apiCalls,
      imports
    };
  }

  /**
   * Load complete route testing data
   */
  loadRouteTestingData(reportDir = null) {
    if (!reportDir) {
      reportDir = this.getLatestReportDir('route-test-');
    }

    const summary = this.loadSummary(reportDir);

    // Reconstruct frontend test results
    const frontendDir = path.join(reportDir, 'frontend');
    const frontend = {
      results: this.reconstructChunkedData(path.join(frontendDir, 'results')),
      ...this.loadJsonFile(path.join(frontendDir, 'stats.json'))
    };

    // Reconstruct backend test results
    const backendDir = path.join(reportDir, 'backend');
    const backend = {
      results: this.reconstructChunkedData(path.join(backendDir, 'results')),
      ...this.loadJsonFile(path.join(backendDir, 'stats.json'))
    };

    // Load static assets
    const staticAssets = this.loadJsonFile(path.join(reportDir, 'static-assets.json'));

    return {
      ...summary,
      frontend,
      backend,
      staticAssets
    };
  }

  /**
   * Load comprehensive audit summary
   */
  loadComprehensiveAuditSummary(reportDir = null) {
    if (!reportDir) {
      reportDir = this.getLatestReportDir('comprehensive-audit-');
    }

    const summary = this.loadSummary(reportDir);
    const phases = this.loadJsonFile(path.join(reportDir, 'phases.json'));

    return {
      ...summary,
      phases
    };
  }

  /**
   * Get broken links summary (lightweight)
   */
  getBrokenLinksSummary() {
    try {
      const reportDir = this.getLatestReportDir('link-analysis-');
      const summary = this.loadSummary(reportDir);
      
      // Load only broken items (small files)
      const navDir = path.join(reportDir, 'navigation');
      const apiDir = path.join(reportDir, 'api-calls');
      const importsDir = path.join(reportDir, 'imports');

      return {
        timestamp: summary.timestamp,
        summary: summary.summary,
        brokenNavigation: this.loadJsonFile(path.join(navDir, 'broken.json')),
        brokenApiCalls: this.loadJsonFile(path.join(apiDir, 'broken.json')),
        brokenImports: this.loadJsonFile(path.join(importsDir, 'broken.json'))
      };
    } catch (error) {
      console.error('Failed to load broken links summary:', error.message);
      return null;
    }
  }

  /**
   * Get route conflicts summary (lightweight)
   */
  getRouteConflictsSummary() {
    try {
      const reportDir = this.getLatestReportDir('route-map-');
      const summary = this.loadSummary(reportDir);
      
      // Load only conflicts (small file)
      const frontendDir = path.join(reportDir, 'frontend');
      const conflicts = this.loadJsonFile(path.join(frontendDir, 'conflicts.json'));

      return {
        timestamp: summary.timestamp,
        summary: summary.summary,
        conflicts
      };
    } catch (error) {
      console.error('Failed to load route conflicts summary:', error.message);
      return null;
    }
  }

  /**
   * Get failed routes summary (lightweight)
   */
  getFailedRoutesSummary() {
    try {
      const reportDir = this.getLatestReportDir('route-test-');
      const summary = this.loadSummary(reportDir);
      
      // Load only failed results from chunks
      const frontendDir = path.join(reportDir, 'frontend');
      const backendDir = path.join(reportDir, 'backend');
      
      const frontendResults = this.reconstructChunkedData(path.join(frontendDir, 'results'));
      const backendResults = this.reconstructChunkedData(path.join(backendDir, 'results'));
      
      const failedFrontend = frontendResults.filter(r => r.status === 'failed');
      const failedBackend = backendResults.filter(r => r.status === 'failed');

      return {
        timestamp: summary.timestamp,
        summary: summary.summary,
        failedFrontend,
        failedBackend
      };
    } catch (error) {
      console.error('Failed to load failed routes summary:', error.message);
      return null;
    }
  }

  /**
   * Helper to load JSON file safely
   */
  loadJsonFile(filePath) {
    if (!fs.existsSync(filePath)) {
      return [];
    }
    try {
      return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (error) {
      console.warn(`Failed to load ${filePath}:`, error.message);
      return [];
    }
  }

  /**
   * List available reports
   */
  listAvailableReports() {
    if (!fs.existsSync(this.reportsDir)) {
      return {};
    }

    const reports = {
      routeMapping: [],
      linkAnalysis: [],
      routeTesting: [],
      comprehensiveAudit: []
    };

    const items = fs.readdirSync(this.reportsDir);
    
    for (const item of items) {
      const fullPath = path.join(this.reportsDir, item);
      if (fs.statSync(fullPath).isDirectory()) {
        if (item.startsWith('route-map-')) {
          reports.routeMapping.push(item);
        } else if (item.startsWith('link-analysis-')) {
          reports.linkAnalysis.push(item);
        } else if (item.startsWith('route-test-')) {
          reports.routeTesting.push(item);
        } else if (item.startsWith('comprehensive-audit-')) {
          reports.comprehensiveAudit.push(item);
        }
      }
    }

    // Sort by timestamp (newest first)
    Object.keys(reports).forEach(key => {
      reports[key].sort().reverse();
    });

    return reports;
  }
}

// CLI interface
if (require.main === module) {
  const aggregator = new ReportAggregator();
  const command = process.argv[2];

  try {
    switch (command) {
      case 'list':
        console.log('Available Reports:');
        console.log(JSON.stringify(aggregator.listAvailableReports(), null, 2));
        break;
        
      case 'broken-links':
        console.log('Broken Links Summary:');
        console.log(JSON.stringify(aggregator.getBrokenLinksSummary(), null, 2));
        break;
        
      case 'conflicts':
        console.log('Route Conflicts Summary:');
        console.log(JSON.stringify(aggregator.getRouteConflictsSummary(), null, 2));
        break;
        
      case 'failed-routes':
        console.log('Failed Routes Summary:');
        console.log(JSON.stringify(aggregator.getFailedRoutesSummary(), null, 2));
        break;
        
      case 'summary':
        console.log('Comprehensive Audit Summary:');
        console.log(JSON.stringify(aggregator.loadComprehensiveAuditSummary(), null, 2));
        break;
        
      default:
        console.log(`
Report Aggregator Utility

Usage: node report-aggregator.js <command>

Commands:
  list           List all available reports
  broken-links   Show broken links summary
  conflicts      Show route conflicts summary  
  failed-routes  Show failed routes summary
  summary        Show comprehensive audit summary

Examples:
  node report-aggregator.js list
  node report-aggregator.js broken-links
  node report-aggregator.js summary
        `);
    }
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

module.exports = ReportAggregator;