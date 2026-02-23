#!/usr/bin/env node

/**
 * PreToolUse:Edit+Write hook — enforces Prisma stays in lib/db/.
 * Adapted from the template for a Next.js + Prisma application.
 */

// === CONFIGURATION ===
const GUARDED_PATHS = [
  {
    // Prisma imports should only be in lib/db/
    pathContains: '/app/',
    forbiddenPatterns: [
      {
        pattern: /from ['"]@prisma\/client['"]|from ['"]\.\.?\/.*prisma['"]/,
        message: 'Direct Prisma import in app/ directory.',
        fix: 'Import from lib/db/ instead. All database access goes through repository functions.',
      },
    ],
    principle: 'Prisma stays in lib/db/. Never import Prisma directly in components, actions, or API routes. (CLAUDE.md)',
  },
  {
    // API routes should not contain complex business logic
    pathContains: '/app/api/',
    forbiddenPatterns: [
      {
        pattern: /from ['"]@prisma\/client['"]/,
        message: 'Direct Prisma import in API route.',
        fix: 'Call a repository function from lib/db/ instead of importing Prisma directly.',
      },
    ],
    principle: 'API handlers validate and delegate. Business logic belongs in lib/ services. (CLAUDE.md)',
  },
];

const SKIP_SUFFIXES = ['.d.ts', 'types.ts', '.test.ts', '.spec.ts'];
// === END CONFIGURATION ===

const fs = require('fs');
const input = JSON.parse(fs.readFileSync('/dev/stdin', 'utf8'));
const filePath = input.tool_input?.file_path || '';
const newContent = input.tool_input?.new_string || input.tool_input?.content || '';

if (SKIP_SUFFIXES.some(s => filePath.endsWith(s))) process.exit(0);

const violations = [];
let matchedPrinciple = '';

for (const guard of GUARDED_PATHS) {
  if (!filePath.includes(guard.pathContains)) continue;
  for (const { pattern, message, fix } of guard.forbiddenPatterns) {
    pattern.lastIndex = 0;
    if (pattern.test(newContent)) {
      violations.push(`${message}\n   Fix: ${fix}`);
      matchedPrinciple = guard.principle;
    }
  }
}

if (violations.length > 0) {
  process.stdout.write(JSON.stringify({
    decision: 'block',
    reason: `Boundary violation:\n${violations.map((v, i) => `${i + 1}. ${v}`).join('\n')}\n\nPrinciple: ${matchedPrinciple}`,
  }));
}

process.exit(0);
