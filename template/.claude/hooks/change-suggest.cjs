#!/usr/bin/env node

/**
 * PostToolUse:Edit+Write hook — suggests related actions when
 * critical files are modified (e.g., "run benchmarks", "update docs",
 * "rebuild assets").
 *
 * ENFORCEMENT: informational (non-blocking)
 */

// === CONFIGURATION ===
// Each entry: when a file matching `watchPaths` is modified,
// show the `suggestion` message.
const WATCH_RULES = [
  {
    // Example: detection-critical files -> suggest running benchmarks
    watchPaths: ['/src/validators/', '/src/detectors/', '/src/rules/'],
    skipFiles: ['types.ts', '.test.ts', '.spec.ts'],
    suggestion: 'Detection logic changed. Consider running: npm run benchmark',
  },
  {
    // Example: schema changes -> suggest running migrations
    watchPaths: ['/src/db/', '/src/models/', '/migrations/'],
    skipFiles: ['.test.ts', '.spec.ts'],
    suggestion: 'Database schema may have changed. Consider running: npm run migrate',
  },
  {
    // Example: API changes -> suggest updating API docs
    watchPaths: ['/src/api/'],
    skipFiles: ['.test.ts', '.spec.ts', '.d.ts'],
    suggestion: 'API handler modified. Consider updating SPEC-API-SURFACE.md if endpoints changed.',
  },
];
// === END CONFIGURATION ===

const fs = require('fs');

const input = JSON.parse(fs.readFileSync('/dev/stdin', 'utf8'));
const filePath = input.tool_input?.file_path || '';

// Skip non-source files
if (!filePath.includes('/src/') && !filePath.includes('/migrations/')) {
  process.exit(0);
}

for (const rule of WATCH_RULES) {
  const matchesWatch = rule.watchPaths.some(p => filePath.includes(p));
  const isSkipped = rule.skipFiles.some(s => filePath.endsWith(s));

  if (matchesWatch && !isSkipped) {
    const result = { message: rule.suggestion };
    process.stdout.write(JSON.stringify(result));
    process.exit(0);
  }
}

process.exit(0);
