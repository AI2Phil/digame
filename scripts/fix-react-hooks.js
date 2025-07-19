#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const babel = require('@babel/core');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const generate = require('@babel/generator').default;
const t = require('@babel/types');

// Conservative list of valid React dependencies (no keywords or built-ins)
const VALID_DEPENDENCIES = new Set([
  // React hooks
  'useState', 'useEffect', 'useCallback', 'useMemo', 'useRef', 'useContext',
  'useReducer', 'useImperativeHandle', 'useLayoutEffect', 'useDebugValue',
  
  // Common state setters (pattern: set + PascalCase)
  // Will be validated dynamically
  
  // Common function names
  'fetch', 'load', 'save', 'update', 'delete', 'create', 'get', 'post', 'put',
  'handleClick', 'handleChange', 'handleSubmit', 'handleClose', 'handleOpen',
  'onSubmit', 'onChange', 'onClick', 'onClose', 'onOpen', 'onSave', 'onCancel',
  
  // Router and navigation
  'router', 'navigate', 'push', 'replace', 'back', 'forward',
  
  // Common props and variables
  'id', 'data', 'items', 'user', 'config', 'settings', 'options', 'params',
  'query', 'pathname', 'search', 'hash', 'state', 'props', 'children',
  
  // API and async
  'api', 'client', 'service', 'request', 'response', 'error', 'loading',
  'success', 'failure', 'pending', 'resolved', 'rejected',
  
  // Toast and notifications
  'toast', 'success', 'error', 'warning', 'info',
  
  // Common utilities
  'debounce', 'throttle', 'delay', 'timeout', 'interval'
]);

// JavaScript keywords and built-ins that should NEVER be dependencies
const INVALID_DEPENDENCIES = new Set([
  // JavaScript keywords
  'if', 'else', 'for', 'while', 'do', 'switch', 'case', 'default', 'break', 'continue',
  'function', 'return', 'var', 'let', 'const', 'class', 'extends', 'import', 'export',
  'try', 'catch', 'finally', 'throw', 'new', 'this', 'super', 'typeof', 'instanceof',
  'in', 'of', 'delete', 'void', 'null', 'undefined', 'true', 'false',
  
  // Built-in objects and functions
  'Object', 'Array', 'String', 'Number', 'Boolean', 'Date', 'RegExp', 'Error',
  'Math', 'JSON', 'console', 'window', 'document', 'localStorage', 'sessionStorage',
  'setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', 'Promise',
  'fetch', 'XMLHttpRequest', 'FormData', 'URLSearchParams', 'URL', 'Blob',
  
  // DOM methods and properties
  'getElementById', 'querySelector', 'addEventListener', 'removeEventListener',
  'createElement', 'appendChild', 'removeChild', 'setAttribute', 'getAttribute',
  'classList', 'className', 'innerHTML', 'textContent', 'value', 'checked',
  'focus', 'blur', 'click', 'submit', 'reset', 'scrollIntoView', 'scrollToBottom',
  'getBoundingClientRect', 'getComputedStyle', 'matchMedia',
  
  // Array methods
  'push', 'pop', 'shift', 'unshift', 'splice', 'slice', 'concat', 'join',
  'reverse', 'sort', 'filter', 'map', 'reduce', 'forEach', 'find', 'findIndex',
  'includes', 'indexOf', 'lastIndexOf', 'some', 'every',
  
  // String methods
  'charAt', 'charCodeAt', 'concat', 'indexOf', 'lastIndexOf', 'slice', 'substring',
  'substr', 'toLowerCase', 'toUpperCase', 'trim', 'split', 'replace', 'match',
  'search', 'includes', 'startsWith', 'endsWith', 'repeat', 'padStart', 'padEnd',
  
  // Object methods
  'keys', 'values', 'entries', 'assign', 'create', 'defineProperty', 'freeze',
  'seal', 'hasOwnProperty', 'isPrototypeOf', 'propertyIsEnumerable',
  
  // Number methods
  'toString', 'toFixed', 'toPrecision', 'toExponential', 'parseInt', 'parseFloat',
  'isNaN', 'isFinite', 'isInteger', 'isSafeInteger',
  
  // Date methods
  'getTime', 'getFullYear', 'getMonth', 'getDate', 'getDay', 'getHours',
  'getMinutes', 'getSeconds', 'getMilliseconds', 'toISOString', 'toDateString',
  'toTimeString', 'toLocaleString', 'toLocaleDateString', 'toLocaleTimeString',
  
  // Common browser APIs
  'alert', 'confirm', 'prompt', 'open', 'close', 'print', 'history', 'location',
  'navigator', 'screen', 'performance', 'crypto', 'atob', 'btoa',
  
  // Event-related
  'preventDefault', 'stopPropagation', 'stopImmediatePropagation', 'target',
  'currentTarget', 'type', 'bubbles', 'cancelable', 'defaultPrevented',
  
  // React-specific but not dependencies
  'render', 'componentDidMount', 'componentDidUpdate', 'componentWillUnmount',
  'shouldComponentUpdate', 'getSnapshotBeforeUpdate', 'componentDidCatch',
  
  // Common utilities that are not dependencies
  'min', 'max', 'abs', 'floor', 'ceil', 'round', 'random', 'sqrt', 'pow',
  'sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'atan2', 'log', 'exp',
  
  // Browser storage and networking
  'getItem', 'setItem', 'removeItem', 'clear', 'key', 'length',
  'send', 'open', 'close', 'abort', 'getAllResponseHeaders', 'getResponseHeader',
  
  // Misc
  'parse', 'stringify', 'now', 'disconnect', 'observe', 'unobserve'
]);

function isValidDependency(name) {
  // Never allow invalid dependencies
  if (INVALID_DEPENDENCIES.has(name)) {
    return false;
  }
  
  // Allow explicitly valid dependencies
  if (VALID_DEPENDENCIES.has(name)) {
    return true;
  }
  
  // Allow state setters (set + PascalCase)
  if (/^set[A-Z][a-zA-Z0-9]*$/.test(name)) {
    return true;
  }
  
  // Allow event handlers (on + PascalCase or handle + PascalCase)
  if (/^(on|handle)[A-Z][a-zA-Z0-9]*$/.test(name)) {
    return true;
  }
  
  // Allow fetch/load functions (fetch/load + PascalCase)
  if (/^(fetch|load)[A-Z][a-zA-Z0-9]*$/.test(name)) {
    return true;
  }
  
  // Allow camelCase variables (but be conservative)
  if (/^[a-z][a-zA-Z0-9]*$/.test(name) && name.length > 2) {
    return true;
  }
  
  // Reject everything else
  return false;
}

function extractReferencedIdentifiers(node) {
  const identifiers = new Set();
  
  traverse(node, {
    Identifier(path) {
      // Skip if it's a property key or function declaration
      if (path.isReferencedIdentifier() && !path.isBindingIdentifier()) {
        const name = path.node.name;
        if (isValidDependency(name)) {
          identifiers.add(name);
        }
      }
    }
  }, node);
  
  return Array.from(identifiers);
}

function fixReactHooksInFile(filePath) {
  console.log(`🔧 Fixing React Hooks violations in: ${path.relative(process.cwd(), filePath)}`);
  
  try {
    const code = fs.readFileSync(filePath, 'utf8');
    
    // Parse the code
    const ast = parser.parse(code, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript', 'decorators-legacy', 'classProperties']
    });
    
    let hasChanges = false;
    const fixes = [];
    
    // Find and fix React Hooks violations
    traverse(ast, {
      CallExpression(path) {
        const { node } = path;
        
        // Check for useEffect, useCallback, useMemo
        if (t.isIdentifier(node.callee)) {
          const hookName = node.callee.name;
          
          if (['useEffect', 'useCallback', 'useMemo'].includes(hookName)) {
            const args = node.arguments;
            
            if (args.length >= 1) {
              const callback = args[0];
              let depsArray = args[1];
              
              // Extract referenced identifiers from the callback
              const referencedIds = extractReferencedIdentifiers(callback);
              
              if (referencedIds.length > 0) {
                if (!depsArray) {
                  // Add missing dependency array
                  const newDepsArray = t.arrayExpression(
                    referencedIds.map(id => t.identifier(id))
                  );
                  args.push(newDepsArray);
                  hasChanges = true;
                  fixes.push(`Added missing dependencies to ${hookName}: ${referencedIds.join(', ')}`);
                } else if (t.isArrayExpression(depsArray)) {
                  // Check existing dependencies
                  const existingDeps = new Set(
                    depsArray.elements
                      .filter(el => t.isIdentifier(el))
                      .map(el => el.name)
                  );
                  
                  const missingDeps = referencedIds.filter(id => !existingDeps.has(id));
                  
                  if (missingDeps.length > 0) {
                    // Add missing dependencies
                    missingDeps.forEach(dep => {
                      depsArray.elements.push(t.identifier(dep));
                    });
                    hasChanges = true;
                    fixes.push(`Added missing dependencies to ${hookName}: ${missingDeps.join(', ')}`);
                  }
                }
              }
            }
          }
        }
      }
    });
    
    if (hasChanges) {
      // Create backup
      const backupPath = filePath + '.backup';
      fs.writeFileSync(backupPath, code);
      
      // Generate and write the fixed code
      const output = generate(ast, {
        retainLines: true,
        compact: false
      });
      
      fs.writeFileSync(filePath, output.code);
      
      console.log(`✅ Fixed ${fixes.length} issues in ${path.relative(process.cwd(), filePath)}`);
      fixes.forEach(fix => console.log(`   - ${fix}`));
      console.log(`📁 Backup created: ${path.relative(process.cwd(), backupPath)}`);
      
      return true;
    } else {
      console.log(`ℹ️  No fixes needed for ${path.relative(process.cwd(), filePath)}`);
      return false;
    }
    
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage: node fix-react-hooks.js <file1> [file2] [file3] ...');
    console.log('Example: node fix-react-hooks.js src/components/MyComponent.jsx');
    process.exit(1);
  }
  
  let totalFixed = 0;
  
  args.forEach(filePath => {
    if (fs.existsSync(filePath)) {
      const fixed = fixReactHooksInFile(filePath);
      if (fixed) totalFixed++;
    } else {
      console.error(`❌ File not found: ${filePath}`);
    }
  });
  
  console.log(`\n🎉 Summary: Fixed ${totalFixed} out of ${args.length} files`);
}

if (require.main === module) {
  main();
}

module.exports = { fixReactHooksInFile, isValidDependency };