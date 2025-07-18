#!/usr/bin/env node

/**
 * Prettier Formatting Script for Restored Pages
 * Applies consistent code formatting to all restored TypeScript/JavaScript pages
 * 
 * Features:
 * - Prettier formatting for all .tsx, .ts, .jsx, .js files
 * - Backup creation before formatting
 * - Detailed logging and progress tracking
 * - Error handling and rollback capability
 * - Configurable formatting options
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const TARGET_DIR = 'frontend/src/pages';
const BACKUP_DIR = 'scripts/backups/prettier_formatting';
const LOG_FILE = 'scripts/prettier_formatting.log';

// Prettier configuration
const PRETTIER_CONFIG = {
  semi: true,
  singleQuote: true,
  tabWidth: 2,
  trailingComma: 'es5',
  printWidth: 100,
  bracketSpacing: true,
  arrowParens: 'avoid',
  endOfLine: 'lf',
  parser: 'typescript'
};

// Enhanced logging system
class Logger {
  constructor(logFile) {
    this.logFile = logFile;
    this.ensureLogDirectory();
  }

  ensureLogDirectory() {
    const logDir = path.dirname(this.logFile);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
  }

  log(level, message, data = null) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      data
    };
    
    const logLine = `[${timestamp}] ${level.toUpperCase()}: ${message}${data ? ` | Data: ${JSON.stringify(data)}` : ''}\n`;
    
    // Console output
    console.log(logLine.trim());
    
    // File output
    try {
      fs.appendFileSync(this.logFile, logLine);
    } catch (error) {
      console.error('Failed to write to log file:', error.message);
    }
  }

  info(message, data) { this.log('info', message, data); }
  warn(message, data) { this.log('warn', message, data); }
  error(message, data) { this.log('error', message, data); }
  success(message, data) { this.log('success', message, data); }
}

// Backup management system
class BackupManager {
  constructor(backupDir, logger) {
    this.backupDir = backupDir;
    this.logger = logger;
    this.ensureBackupDirectory();
  }

  ensureBackupDirectory() {
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }
  }

  createBackup(filePath) {
    try {
      if (fs.existsSync(filePath)) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const relativePath = path.relative(TARGET_DIR, filePath);
        const backupFileName = `${relativePath.replace(/[/\\]/g, '_')}.${timestamp}.backup`;
        const backupPath = path.join(this.backupDir, backupFileName);
        
        // Ensure backup subdirectory exists
        const backupSubDir = path.dirname(backupPath);
        if (!fs.existsSync(backupSubDir)) {
          fs.mkdirSync(backupSubDir, { recursive: true });
        }
        
        fs.copyFileSync(filePath, backupPath);
        this.logger.info(`Created backup: ${backupPath}`);
        return backupPath;
      }
      return null;
    } catch (error) {
      this.logger.error(`Failed to create backup for ${filePath}:`, error.message);
      return null;
    }
  }

  rollback(backupPath, originalPath) {
    try {
      if (fs.existsSync(backupPath)) {
        fs.copyFileSync(backupPath, originalPath);
        this.logger.info(`Rolled back: ${originalPath} from ${backupPath}`);
        return true;
      }
      return false;
    } catch (error) {
      this.logger.error(`Failed to rollback ${originalPath}:`, error.message);
      return false;
    }
  }
}

// File discovery and filtering
function findFilesToFormat(directory) {
  const files = [];
  const extensions = ['.tsx', '.ts', '.jsx', '.js'];
  
  function scanDirectory(dir) {
    try {
      const items = fs.readdirSync(dir);
      
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          scanDirectory(fullPath);
        } else if (stat.isFile()) {
          const ext = path.extname(item);
          if (extensions.includes(ext)) {
            files.push(fullPath);
          }
        }
      }
    } catch (error) {
      console.error(`Error scanning directory ${dir}:`, error.message);
    }
  }
  
  scanDirectory(directory);
  return files;
}

// Prettier formatting function
function formatFileWithPrettier(filePath, config) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Create temporary prettier config file
    const tempConfigPath = path.join(__dirname, '.prettierrc.temp.json');
    fs.writeFileSync(tempConfigPath, JSON.stringify(config, null, 2));
    
    try {
      // Use prettier CLI to format the content
      const formattedContent = execSync(
        `npx prettier --config "${tempConfigPath}" --parser typescript`,
        {
          input: content,
          encoding: 'utf8',
          stdio: ['pipe', 'pipe', 'pipe']
        }
      );
      
      // Clean up temp config
      fs.unlinkSync(tempConfigPath);
      
      return {
        success: true,
        content: formattedContent,
        originalLength: content.length,
        formattedLength: formattedContent.length
      };
    } catch (prettierError) {
      // Clean up temp config on error
      if (fs.existsSync(tempConfigPath)) {
        fs.unlinkSync(tempConfigPath);
      }
      throw prettierError;
    }
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

// Main formatting function
async function formatRestoredPages() {
  const logger = new Logger(LOG_FILE);
  const backupManager = new BackupManager(BACKUP_DIR, logger);

  logger.info('🎨 Starting Prettier Formatting for Restored Pages');
  logger.info('📁 Target Directory:', TARGET_DIR);
  logger.info('⚙️  Prettier Configuration:', PRETTIER_CONFIG);

  // Find all files to format
  const filesToFormat = findFilesToFormat(TARGET_DIR);
  logger.info(`📄 Found ${filesToFormat.length} files to format`);

  let successCount = 0;
  let errorCount = 0;
  let skippedCount = 0;
  let totalCharactersSaved = 0;
  const processedFiles = [];
  const failedFiles = [];

  for (let i = 0; i < filesToFormat.length; i++) {
    const filePath = filesToFormat[i];
    const relativePath = path.relative(TARGET_DIR, filePath);
    let backupPath = null;

    try {
      logger.info(`🎨 Formatting (${i + 1}/${filesToFormat.length}): ${relativePath}`);

      // Create backup
      backupPath = backupManager.createBackup(filePath);

      // Read original content
      const originalContent = fs.readFileSync(filePath, 'utf8');
      const originalSize = originalContent.length;

      // Format with Prettier
      const formatResult = formatFileWithPrettier(filePath, PRETTIER_CONFIG);

      if (!formatResult.success) {
        throw new Error(formatResult.error);
      }

      // Check if formatting made changes
      if (originalContent === formatResult.content) {
        logger.info(`   ⏭️  No changes needed - already formatted`);
        skippedCount++;
        continue;
      }

      // Write formatted content
      fs.writeFileSync(filePath, formatResult.content);

      // Calculate savings
      const sizeDifference = originalSize - formatResult.formattedLength;
      totalCharactersSaved += Math.abs(sizeDifference);

      logger.success(`   ✅ Formatted successfully`);
      logger.info(`   📊 Size: ${originalSize} → ${formatResult.formattedLength} chars (${sizeDifference > 0 ? '-' : '+'}${Math.abs(sizeDifference)})`);

      processedFiles.push({
        path: relativePath,
        originalSize,
        formattedSize: formatResult.formattedLength,
        sizeDifference,
        backupPath
      });

      successCount++;

    } catch (error) {
      logger.error(`   ❌ Error formatting ${relativePath}:`, error.message);

      // Attempt rollback if backup exists
      if (backupPath) {
        const rollbackSuccess = backupManager.rollback(backupPath, filePath);
        if (rollbackSuccess) {
          logger.info(`   🔄 Successfully rolled back changes`);
        }
      }

      failedFiles.push({
        path: relativePath,
        error: error.message,
        backupPath
      });

      errorCount++;
    }

    // Small delay to prevent overwhelming the file system
    await new Promise(resolve => setTimeout(resolve, 50));
  }

  // Summary
  logger.info('📋 PRETTIER FORMATTING SUMMARY');
  logger.info('=' .repeat(60));
  logger.success(`✅ Successfully formatted: ${successCount} files`);
  logger.info(`⏭️  Already formatted (skipped): ${skippedCount} files`);
  logger.error(`❌ Errors encountered: ${errorCount} files`);
  logger.info(`📊 Total files processed: ${filesToFormat.length} files`);
  logger.info(`💾 Total character changes: ${totalCharactersSaved.toLocaleString()} chars`);
  logger.info(`🎯 Success rate: ${((successCount / filesToFormat.length) * 100).toFixed(1)}%`);

  if (successCount === filesToFormat.length - skippedCount) {
    logger.success('\n🎉 ALL FILES FORMATTED SUCCESSFULLY!');
    logger.success('🎨 Code formatting is now consistent across all restored pages');
    logger.info('\n📝 Next steps:');
    logger.info('   1. Review formatted files for any issues');
    logger.info('   2. Test application functionality');
    logger.info('   3. Commit the formatting improvements');
  } else {
    logger.warn('\n⚠️  Some files had formatting issues. Please review the errors above.');
    
    if (failedFiles.length > 0) {
      logger.error('\n❌ Failed files:');
      failedFiles.forEach(file => {
        logger.error(`   - ${file.path}: ${file.error}`);
      });
    }
  }

  // Generate formatting report
  const report = {
    timestamp: new Date().toISOString(),
    totalFiles: filesToFormat.length,
    successCount,
    errorCount,
    skippedCount,
    totalCharactersSaved,
    successRate: ((successCount / filesToFormat.length) * 100).toFixed(1),
    prettierConfig: PRETTIER_CONFIG,
    processedFiles,
    failedFiles
  };

  const reportPath = 'scripts/prettier_formatting_report.json';
  try {
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    logger.info(`📊 Detailed formatting report saved: ${reportPath}`);
  } catch (error) {
    logger.error('Failed to save formatting report:', error.message);
  }
}

// Check if prettier is available
function checkPrettierAvailability() {
  try {
    execSync('npx prettier --version', { stdio: 'pipe' });
    return true;
  } catch (error) {
    console.error('❌ Prettier is not available. Please install it first:');
    console.error('   npm install --save-dev prettier');
    console.error('   or');
    console.error('   npm install -g prettier');
    return false;
  }
}

// Run the formatting with error handling
if (checkPrettierAvailability()) {
  formatRestoredPages().catch(error => {
    console.error('Fatal error in formatting process:', error);
    process.exit(1);
  });
} else {
  process.exit(1);
}