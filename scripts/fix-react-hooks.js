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

function isValidDependency(name, declaredIdentifiers) {
  if (INVALID_DEPENDENCIES.has(name)) return false;
  if (!declaredIdentifiers.has(name)) return false;
  if (VALID_DEPENDENCIES.has(name)) return true;
  if (/^set[A-Z][a-zA-Z0-9]*$/.test(name)) return true;
  if (/^(on|handle)[A-Z][a-zA-Z0-9]*$/.test(name)) return true;
  if (/^(fetch|load)[A-Z][a-zA-Z0-9]*$/.test(name)) return true;
  if (/^[a-z][a-zA-Z0-9]{2,}$/.test(name)) return true;
  return false;
}

function extractIdentifiersInScope(path) {
  const declared = new Set();
  
  // Get the function scope (component scope)
  const functionScope = path.getFunctionParent();
  if (!functionScope) return declared;
  
  // Traverse only within the component function scope
  functionScope.traverse({
    VariableDeclarator(p) {
      if (t.isIdentifier(p.node.id)) {
        declared.add(p.node.id.name);
      }
      // Handle destructuring
      if (t.isObjectPattern(p.node.id)) {
        p.node.id.properties.forEach(prop => {
          if (t.isObjectProperty(prop) && t.isIdentifier(prop.value)) {
            declared.add(prop.value.name);
          }
        });
      }
      if (t.isArrayPattern(p.node.id)) {
        p.node.id.elements.forEach(element => {
          if (t.isIdentifier(element)) {
            declared.add(element.name);
          }
        });
      }
    },
    FunctionDeclaration(p) {
      if (t.isIdentifier(p.node.id)) declared.add(p.node.id.name);
    },
    // Include function parameters
    Function(p) {
      if (p === functionScope) { // Only for the current function
        p.node.params.forEach(param => {
          if (t.isIdentifier(param)) {
            declared.add(param.name);
          }
          // Handle destructured parameters
          if (t.isObjectPattern(param)) {
            param.properties.forEach(prop => {
              if (t.isObjectProperty(prop) && t.isIdentifier(prop.value)) {
                declared.add(prop.value.name);
              }
            });
          }
        });
      }
    }
  });
  
  // Also check for imports at the module level
  const program = path.findParent(p => p.isProgram());
  if (program) {
    program.traverse({
      ImportSpecifier(p) {
        declared.add(p.node.local.name);
      },
      ImportDefaultSpecifier(p) {
        declared.add(p.node.local.name);
      },
      ImportNamespaceSpecifier(p) {
        declared.add(p.node.local.name);
      }
    });
  }
  
  return declared;
}

function extractReferencedIdentifiers(callbackNode, declaredIdentifiers) {
  const identifiers = new Set();
  traverse(callbackNode, {
    Identifier(path) {
      if (path.isReferencedIdentifier() && !path.isBindingIdentifier()) {
        const name = path.node.name;
        if (isValidDependency(name, declaredIdentifiers)) {
          identifiers.add(name);
        }
      }
    }
  }, callbackNode);
  return Array.from(identifiers);
}

function isValidReactComponent(func) {
  if (!func) return false;
  if (t.isFunctionDeclaration(func.node) && func.node.id) return /^[A-Z]/.test(func.node.id.name);
  if (t.isArrowFunctionExpression(func.node) || t.isFunctionExpression(func.node)) {
    const parent = func.parent;
    if (t.isVariableDeclarator(parent) && t.isIdentifier(parent.id)) return /^[A-Z]/.test(parent.id.name);
    if (t.isAssignmentExpression(parent) && t.isIdentifier(parent.left)) return /^[A-Z]/.test(parent.left.name);
    if (t.isExportDefaultDeclaration(parent)) return true;
  }
  return false;
}

function fixReactHooksInFile(filePath) {
  console.log(`🔧 Fixing React Hooks violations in: ${path.relative(process.cwd(), filePath)}`);
  const code = fs.readFileSync(filePath, 'utf8');
  const ast = parser.parse(code, {
    sourceType: 'module',
    plugins: ['jsx', 'typescript', 'decorators-legacy', 'classProperties']
  });

  let hasChanges = false;
  const fixes = [];
  const warnings = [];

  const declaredIdentifiers = extractIdentifiersInScope({ traverse: traverse.bind(null, ast) });

  traverse(ast, {
    CallExpression(path) {
      const { node } = path;
      const hookName = t.isIdentifier(node.callee) ? node.callee.name : '';
      const isReactHook = /^use[A-Z]/.test(hookName);

      if (isReactHook) {
        const func = path.getFunctionParent();
        const isInsideComponent = isValidReactComponent(func);
        if (!func || !isInsideComponent) {
          const line = node.loc?.start.line || 'unknown';
          warnings.push(`❌ Invalid hook usage: ${hookName} at line ${line}`);
          console.warn(`❌ SSR VIOLATION: ${hookName} at ${path.relative(process.cwd(), filePath)}:${line}`);
        }
      }

      if (["useEffect", "useCallback", "useMemo"].includes(hookName)) {
        const args = node.arguments;
        if (args.length >= 1) {
          const callback = args[0];
          let depsArray = args[1];
          const referencedIds = extractReferencedIdentifiers(callback, declaredIdentifiers);

          if (referencedIds.length > 0) {
            if (!depsArray) {
              args.push(t.arrayExpression(referencedIds.map(id => t.identifier(id))));
              hasChanges = true;
              fixes.push(`Added dependencies to ${hookName}: ${referencedIds.join(', ')}`);
            } else if (t.isArrayExpression(depsArray)) {
              const existingDeps = new Set(
                depsArray.elements.filter(el => t.isIdentifier(el)).map(el => el.name)
              );
              const missingDeps = referencedIds.filter(id => !existingDeps.has(id));
              if (missingDeps.length > 0) {
                missingDeps.forEach(dep => depsArray.elements.push(t.identifier(dep)));
                hasChanges = true;
                fixes.push(`Added dependencies to ${hookName}: ${missingDeps.join(', ')}`);
              }
            }
          }
        }
      }
    }
  });

  if (warnings.length > 0) {
    console.log(`⚠️  Found ${warnings.length} SSR violations in ${filePath}`);
    warnings.forEach(w => console.log(`   ${w}`));
    console.log(`🚨 These violations will cause SSR crashes! Fix them manually.`);
  }

  if (hasChanges) {
    const backupPath = filePath + '.backup';
    fs.writeFileSync(backupPath, code);
    const output = generate(ast, { retainLines: true, compact: false });
    fs.writeFileSync(filePath, output.code);
    console.log(`✅ Fixed ${fixes.length} dependency issues in ${filePath}`);
    fixes.forEach(f => console.log(`   - ${f}`));
    console.log(`📁 Backup created: ${backupPath}`);
    return { hasChanges: true, hasWarnings: warnings.length > 0 };
  }

  return { hasChanges: false, hasWarnings: warnings.length > 0 };
}

function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.log('Usage: node fix-react-hooks.js <file1> [file2] [...]');
    process.exit(1);
  }

  let totalFixed = 0, totalWarnings = 0, filesWithIssues = 0;
  args.forEach(filePath => {
    if (fs.existsSync(filePath)) {
      const result = fixReactHooksInFile(filePath);
      if (result?.hasChanges) totalFixed++;
      if (result?.hasWarnings) totalWarnings++;
      if (result?.hasChanges || result?.hasWarnings) filesWithIssues++;
    } else {
      console.error(`❌ File not found: ${filePath}`);
    }
  });

  console.log(`\n🎉 Summary:`);
  console.log(`   📁 Files processed: ${args.length}`);
  console.log(`   ✅ Files with fixes: ${totalFixed}`);
  console.log(`   🚨 Files with SSR issues: ${totalWarnings}`);

  if (totalWarnings > 0) {
    console.log(`\n⚠️  SSR violations must be fixed manually.`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { fixReactHooksInFile };