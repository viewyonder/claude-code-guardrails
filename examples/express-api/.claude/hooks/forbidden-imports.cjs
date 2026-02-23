#!/usr/bin/env node

/**
 * PreToolUse:Edit+Write hook — blocks browser/frontend APIs in server code.
 * Adapted from the template for an Express + PostgreSQL backend.
 */

// === CONFIGURATION ===
const FORBIDDEN_PATTERNS = [
  {
    pattern: /from ['"]react['"]/,
    message: 'React imports are not allowed in server code. This is a backend-only repo.',
  },
  {
    pattern: /document\.|window\.|localStorage\./,
    message: 'Browser APIs (document, window, localStorage) are not available in Node.js server code.',
  },
  {
    pattern: /eval\s*\(|new Function\s*\(/,
    message: 'eval() and new Function() are forbidden for security reasons. Use safe alternatives.',
  },
];

const SKIP_PATHS = ['/scripts/', '/tests/', '/.claude/', '/migrations/'];
const SKIP_EXTENSIONS = ['.json', '.md', '.yaml', '.yml', '.css', '.html', '.sql'];
// === END CONFIGURATION ===

const fs = require('fs');
const input = JSON.parse(fs.readFileSync('/dev/stdin', 'utf8'));
const filePath = input.tool_input?.file_path || '';
const content = input.tool_input?.content || input.tool_input?.new_string || '';

if (SKIP_PATHS.some(p => filePath.includes(p))) process.exit(0);
if (SKIP_EXTENSIONS.some(ext => filePath.endsWith(ext))) process.exit(0);

const violations = [];
for (const { pattern, message } of FORBIDDEN_PATTERNS) {
  if (pattern.test(content)) violations.push(message);
}

if (violations.length > 0) {
  process.stdout.write(JSON.stringify({
    decision: 'block',
    reason: `Forbidden import violation:\n${violations.join('\n')}`,
  }));
}

process.exit(0);
