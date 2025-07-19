#!/usr/bin/env node

/**
 * React Hooks ESLint Violations Auto-Fixer
 * 
 * This script automatically fixes common react-hooks/exhaustive-deps violations:
 * 1. Missing function dependencies in useEffect/useCallback
 * 2. Objects causing re-renders (wraps with useMemo)
 * 3. Missing dependencies in dependency arrays
 */

const fs = require('fs');
const path = require('path');

class ReactHooksFixer {
  constructor() {
    this.fixes = [];
    this.imports = new Set();
  }

  /**
   * Fix a single file
   */
  fixFile(filePath) {
    console.log(`🔧 Fixing React Hooks violations in: ${filePath}`);
    
    if (!fs.existsSync(filePath)) {
      console.error(`❌ File not found: ${filePath}`);
      return false;
    }

    const content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    let fixedContent = content;
    this.fixes = [];
    this.imports = new Set();

    // Apply fixes in order
    fixedContent = this.fixMissingDependencies(fixedContent);
    fixedContent = this.fixObjectDependencies(fixedContent);
    fixedContent = this.fixFunctionDependencies(fixedContent);
    fixedContent = this.addMissingImports(fixedContent);

    if (fixedContent !== originalContent) {
      // Create backup
      const backupPath = `${filePath}.backup`;
      fs.writeFileSync(backupPath, originalContent);
      
      // Write fixed content
      fs.writeFileSync(filePath, fixedContent);
      
      console.log(`✅ Fixed ${this.fixes.length} issues in ${filePath}`);
      this.fixes.forEach(fix => console.log(`   - ${fix}`));
      console.log(`📁 Backup created: ${backupPath}`);
      return true;
    } else {
      console.log(`ℹ️  No fixes needed for ${filePath}`);
      return false;
    }
  }

  /**
   * Fix missing dependencies in useEffect/useCallback
   */
  fixMissingDependencies(content) {
    // Pattern: useEffect(() => { ... }, [])
    const useEffectPattern = /useEffect\(\s*\(\s*\)\s*=>\s*\{([^}]*(?:\{[^}]*\}[^}]*)*)\},\s*\[([^\]]*)\]\s*\)/g;
    
    return content.replace(useEffectPattern, (match, body, deps) => {
      const functionCalls = this.extractFunctionCalls(body);
      const currentDeps = this.parseDependencyArray(deps);
      const missingDeps = functionCalls.filter(fn => !currentDeps.includes(fn));
      
      if (missingDeps.length > 0) {
        const newDeps = [...currentDeps, ...missingDeps].join(', ');
        this.fixes.push(`Added missing dependencies to useEffect: ${missingDeps.join(', ')}`);
        return match.replace(`[${deps}]`, `[${newDeps}]`);
      }
      
      return match;
    });
  }

  /**
   * Fix object dependencies that cause re-renders
   */
  fixObjectDependencies(content) {
    // Find object declarations that are used in useEffect
    const objectPattern = /const\s+(\w+)\s*=\s*\{[^}]*\};/g;
    const useEffectWithObjectPattern = /useEffect\([^,]+,\s*\[([^\]]*)\]\)/g;
    
    let fixedContent = content;
    const objectMatches = [...content.matchAll(objectPattern)];
    const effectMatches = [...content.matchAll(useEffectWithObjectPattern)];
    
    objectMatches.forEach(objMatch => {
      const objectName = objMatch[1];
      
      // Check if this object is used in any useEffect dependency
      effectMatches.forEach(effectMatch => {
        if (effectMatch[1].includes(objectName)) {
          // Wrap object with useMemo
          const wrappedObject = objMatch[0].replace(
            `const ${objectName} = `,
            `const ${objectName} = useMemo(() => `
          ).replace(/;$/, ', []);');
          
          fixedContent = fixedContent.replace(objMatch[0], wrappedObject);
          this.fixes.push(`Wrapped ${objectName} with useMemo to prevent re-renders`);
          this.imports.add('useMemo');
        }
      });
    });
    
    return fixedContent;
  }

  /**
   * Fix function dependencies in useCallback
   */
  fixFunctionDependencies(content) {
    // Pattern: const functionName = useCallback(() => { ... }, [])
    const useCallbackPattern = /const\s+(\w+)\s*=\s*useCallback\(\s*\([^)]*\)\s*=>\s*\{([^}]*(?:\{[^}]*\}[^}]*)*)\},\s*\[([^\]]*)\]\s*\)/g;
    
    return content.replace(useCallbackPattern, (match, funcName, body, deps) => {
      const functionCalls = this.extractFunctionCalls(body);
      const currentDeps = this.parseDependencyArray(deps);
      const missingDeps = functionCalls.filter(fn => !currentDeps.includes(fn) && fn !== funcName);
      
      if (missingDeps.length > 0) {
        const newDeps = [...currentDeps, ...missingDeps].join(', ');
        this.fixes.push(`Added missing dependencies to useCallback ${funcName}: ${missingDeps.join(', ')}`);
        return match.replace(`[${deps}]`, `[${newDeps}]`);
      }
      
      return match;
    });
  }

  /**
   * Add missing React imports
   */
  addMissingImports(content) {
    if (this.imports.size === 0) return content;
    
    const reactImportPattern = /import\s+(?:React,\s*)?\{\s*([^}]+)\s*\}\s+from\s+['"]react['"];?/;
    const reactImportMatch = content.match(reactImportPattern);
    
    if (reactImportMatch) {
      const existingImports = reactImportMatch[1].split(',').map(imp => imp.trim());
      const newImports = [...this.imports].filter(imp => !existingImports.includes(imp));
      
      if (newImports.length > 0) {
        const allImports = [...existingImports, ...newImports].join(', ');
        const newImportLine = `import { ${allImports} } from 'react';`;
        content = content.replace(reactImportMatch[0], newImportLine);
        this.fixes.push(`Added React imports: ${newImports.join(', ')}`);
      }
    } else {
      // Add new import line
      const importLine = `import { ${[...this.imports].join(', ')} } from 'react';\n`;
      content = importLine + content;
      this.fixes.push(`Added React imports: ${[...this.imports].join(', ')}`);
    }
    
    return content;
  }

  /**
   * Extract function calls from code body
   */
  extractFunctionCalls(body) {
    const functionCallPattern = /(\w+)\s*\(/g;
    const matches = [...body.matchAll(functionCallPattern)];
    return [...new Set(matches.map(match => match[1]))].filter(fn => 
      // Filter out common non-dependency functions
      !['console', 'setTimeout', 'setInterval', 'fetch', 'JSON', 'Object', 'Array'].includes(fn)
    );
  }

  /**
   * Parse dependency array string
   */
  parseDependencyArray(deps) {
    if (!deps || deps.trim() === '') return [];
    return deps.split(',').map(dep => dep.trim()).filter(dep => dep !== '');
  }

  /**
   * Fix all files in a directory
   */
  fixDirectory(dirPath, pattern = /\.(jsx?|tsx?)$/) {
    console.log(`🔍 Scanning directory: ${dirPath}`);
    
    const files = this.getFilesRecursively(dirPath, pattern);
    let fixedCount = 0;
    
    files.forEach(file => {
      if (this.fixFile(file)) {
        fixedCount++;
      }
    });
    
    console.log(`\n📊 Summary: Fixed ${fixedCount} out of ${files.length} files`);
    return fixedCount;
  }

  /**
   * Get all files recursively
   */
  getFilesRecursively(dir, pattern) {
    const files = [];
    
    const scan = (currentDir) => {
      const items = fs.readdirSync(currentDir);
      
      items.forEach(item => {
        const fullPath = path.join(currentDir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
          scan(fullPath);
        } else if (stat.isFile() && pattern.test(item)) {
          files.push(fullPath);
        }
      });
    };
    
    scan(dir);
    return files;
  }

  /**
   * Restore from backup
   */
  restoreBackup(filePath) {
    const backupPath = `${filePath}.backup`;
    if (fs.existsSync(backupPath)) {
      fs.copyFileSync(backupPath, filePath);
      fs.unlinkSync(backupPath);
      console.log(`✅ Restored ${filePath} from backup`);
      return true;
    }
    console.log(`❌ No backup found for ${filePath}`);
    return false;
  }
}

// CLI Interface
function main() {
  const args = process.argv.slice(2);
  const fixer = new ReactHooksFixer();
  
  if (args.length === 0) {
    console.log(`
🔧 React Hooks ESLint Violations Auto-Fixer

Usage:
  node fix-react-hooks.js <file>           # Fix single file
  node fix-react-hooks.js <directory>      # Fix all files in directory
  node fix-react-hooks.js --restore <file> # Restore from backup

Examples:
  node fix-react-hooks.js src/components/MyComponent.jsx
  node fix-react-hooks.js src/components/
  node fix-react-hooks.js --restore src/components/MyComponent.jsx
`);
    process.exit(1);
  }
  
  if (args[0] === '--restore') {
    if (args.length < 2) {
      console.error('❌ Please specify a file to restore');
      process.exit(1);
    }
    fixer.restoreBackup(args[1]);
    return;
  }
  
  const target = args[0];
  const stat = fs.statSync(target);
  
  if (stat.isFile()) {
    fixer.fixFile(target);
  } else if (stat.isDirectory()) {
    fixer.fixDirectory(target);
  } else {
    console.error(`❌ Invalid target: ${target}`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = ReactHooksFixer;