#!/usr/bin/env node

/**
 * PreToolUse:Edit+Write hook — enforces Next.js server/client boundary.
 * Adapted from the template for a Next.js + Prisma application.
 */

// === CONFIGURATION ===
const FORBIDDEN_PATTERNS = [
  {
    // Prisma in client components
    pattern: /from ['"]@prisma\/client['"]/,
    message: 'Prisma client cannot be imported in Client Components. Move DB access to lib/db/ and call from Server Components or Server Actions.',
    onlyInClientFiles: true,
  },
  {
    // Server-only module in client code
    pattern: /from ['"]server-only['"]/,
    message: 'server-only module imported in a client file.',
    onlyInClientFiles: true,
  },
  {
    // Direct env access for secrets in client files
    pattern: /process\.env\.(?!NEXT_PUBLIC_)\w+/,
    message: 'Server environment variables cannot be accessed in Client Components. Use NEXT_PUBLIC_ prefix for client-accessible vars.',
    onlyInClientFiles: true,
  },
];

const SKIP_PATHS = ['/scripts/', '/.claude/', '/tests/', '/__tests__/'];
const SKIP_EXTENSIONS = ['.json', '.md', '.css', '.svg'];
// === END CONFIGURATION ===

const fs = require('fs');
const input = JSON.parse(fs.readFileSync('/dev/stdin', 'utf8'));
const filePath = input.tool_input?.file_path || '';
const content = input.tool_input?.content || input.tool_input?.new_string || '';

if (SKIP_PATHS.some(p => filePath.includes(p))) process.exit(0);
if (SKIP_EXTENSIONS.some(ext => filePath.endsWith(ext))) process.exit(0);

const isClientFile = content.includes("'use client'") || content.includes('"use client"');

const violations = [];
for (const { pattern, message, onlyInClientFiles } of FORBIDDEN_PATTERNS) {
  if (onlyInClientFiles && !isClientFile) continue;
  if (pattern.test(content)) violations.push(message);
}

if (violations.length > 0) {
  process.stdout.write(JSON.stringify({
    decision: 'block',
    reason: `Next.js boundary violation:\n${violations.join('\n')}`,
  }));
}

process.exit(0);
