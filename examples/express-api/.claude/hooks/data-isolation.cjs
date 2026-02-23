#!/usr/bin/env node

/**
 * PreToolUse:Edit+Write hook — warns when PostgreSQL queries lack org_id filter.
 * Adapted from the template for an Express + PostgreSQL backend.
 */

// === CONFIGURATION ===
const DB_CALL_PATTERN = /(?:pool|client|db)\.query\s*\(/g;
const REQUIRED_FILTERS = ['org_id', 'orgId', 'organization_id', 'user_id', 'userId'];
const CHECK_PATHS = ['/src/controllers/', '/src/services/', '/src/repositories/'];
const SKIP_PATTERNS = ['.test.', '.spec.', '.d.ts', '__tests__/'];
// === END CONFIGURATION ===

const fs = require('fs');
const input = JSON.parse(fs.readFileSync('/dev/stdin', 'utf8'));
const filePath = input.tool_input?.file_path || '';
const newContent = input.tool_input?.new_string || input.tool_input?.content || '';

if (!CHECK_PATHS.some(p => filePath.includes(p))) process.exit(0);
if (SKIP_PATTERNS.some(p => filePath.includes(p))) process.exit(0);

const warnings = [];
let match;
while ((match = DB_CALL_PATTERN.exec(newContent)) !== null) {
  const contextAfter = newContent.substring(match.index, match.index + 200);
  const hasTenantFilter = REQUIRED_FILTERS.some(f => new RegExp(f, 'i').test(contextAfter));
  if (!hasTenantFilter) {
    warnings.push(`Database query at position ${match.index} may lack org_id filter.`);
  }
}

if (warnings.length > 0) {
  process.stdout.write(JSON.stringify({
    message: `Data isolation warning:\n${warnings.join('\n')}`,
  }));
}

process.exit(0);
