#!/usr/bin/env node

/**
 * PostToolUse:Edit+Write hook — suggests running related tests
 * when source files are modified. Also nudges toward creating tests
 * when none exist.
 *
 * ENFORCEMENT: informational (non-blocking)
 */

// === CONFIGURATION ===
// Test location mappings: source directory -> possible test directories.
const TEST_LOCATIONS = {
  'src/api/':        ['tests/api/', 'src/api/__tests__/'],
  'src/core/':       ['tests/core/', 'src/core/__tests__/'],
  'src/services/':   ['tests/services/', 'src/services/__tests__/'],
  'src/lib/':        ['tests/lib/', 'src/lib/__tests__/'],
  'src/middleware/':  ['tests/middleware/', 'src/middleware/__tests__/'],
};

// Test run command (shown in suggestions).
const TEST_COMMAND = 'npm test -- --filter';

// Skip these path substrings.
const SKIP_PATHS = ['/packages/', '/scripts/', '/generated/'];

// Source extensions to check.
const SOURCE_EXTENSIONS = ['.ts', '.js', '.tsx', '.jsx'];
// === END CONFIGURATION ===

const fs = require('fs');
const path = require('path');

const input = JSON.parse(fs.readFileSync('/dev/stdin', 'utf8'));
const filePath = input.tool_input?.file_path || '';

// Skip non-source files
if (!filePath.includes('/src/')) process.exit(0);
if (SKIP_PATHS.some(p => filePath.includes(p))) process.exit(0);
if (!SOURCE_EXTENSIONS.some(ext => filePath.endsWith(ext))) process.exit(0);

// Skip test files themselves
if (filePath.includes('.test.') || filePath.includes('.spec.') || filePath.includes('__tests__')) {
  process.exit(0);
}

// Skip type definitions and generated files
if (filePath.endsWith('types.ts') || filePath.includes('/generated/')) {
  process.exit(0);
}

// Find project root
function findProjectRoot(fp) {
  let dir = path.dirname(fp);
  while (dir !== '/') {
    if (fs.existsSync(path.join(dir, 'package.json'))) return dir;
    dir = path.dirname(dir);
  }
  return null;
}

const projectRoot = findProjectRoot(filePath);
if (!projectRoot) process.exit(0);

// Find related test files
const ext = path.extname(filePath);
const fileName = path.basename(filePath, ext);
const found = [];

for (const [srcPattern, testDirs] of Object.entries(TEST_LOCATIONS)) {
  if (filePath.includes(srcPattern)) {
    for (const testDir of testDirs) {
      for (const testExt of ['.test' + ext, '.spec' + ext]) {
        const testPath = path.join(projectRoot, testDir, fileName + testExt);
        if (fs.existsSync(testPath)) {
          found.push(path.relative(projectRoot, testPath));
        }
      }
    }
  }
}

if (found.length > 0) {
  const result = {
    message: `Tests found: ${found.join(', ')}. Run: ${TEST_COMMAND} ${fileName}`,
  };
  process.stdout.write(JSON.stringify(result));
} else {
  const relPath = path.relative(projectRoot, filePath);
  const result = {
    message: `No tests found for ${relPath}. Consider adding tests for this file.`,
  };
  process.stdout.write(JSON.stringify(result));
}

process.exit(0);
