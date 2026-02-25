# Claude Code Hooks

Hooks are small Node.js programs that run before or after Claude Code executes a tool. They enforce architectural constraints, warn about potential issues, and suggest follow-up actions.

## How Hooks Work

### Input

Hooks receive a JSON object on **stdin** with this structure:

```json
{
  "tool_name": "Edit",
  "tool_input": {
    "file_path": "/path/to/file.ts",
    "new_string": "the new content",
    "old_string": "the old content"
  }
}
```

For `Write` tools, `tool_input` contains `file_path` and `content`.
For `Bash` tools, `tool_input` contains `command`.

### Output

Hooks communicate decisions via **stdout** as JSON:

| Decision | JSON | Effect |
|----------|------|--------|
| **Allow** | *(no output, exit 0)* | Tool proceeds normally |
| **Block** | `{ "decision": "block", "reason": "..." }` | Tool is prevented from executing. The agent sees the reason and can self-correct. |
| **Warn** | `{ "message": "..." }` | Tool proceeds. The agent sees the warning. |
| **Error** | `{ "error": "..." }` | Tool is blocked. Shown as an error. |

### Exit codes

- `exit(0)` — Hook ran successfully (check stdout for decision)
- `exit(1)` — Hook failed (treated as a block in some configurations)

## Hook Types

### PreToolUse (runs before the tool)

Registered under `"PreToolUse"` in `settings.local.json`. Can block or warn.

- **Blocking hooks** output `{ "decision": "block", "reason": "..." }` — the agent must fix the issue before proceeding.
- **Warning hooks** output `{ "message": "..." }` — the agent sees the message but the tool still executes.

### PostToolUse (runs after the tool)

Registered under `"PostToolUse"` in `settings.local.json`. Informational only.

- Output `{ "message": "..." }` to suggest follow-up actions.

## Matchers

Hooks are scoped to specific tools via the `"matcher"` field:

| Matcher | Fires on | Common use |
|---------|----------|------------|
| `"Edit"` | Edit tool (modify existing file) | Boundary guards, state flow |
| `"Write"` | Write tool (create/overwrite file) | Forbidden imports, boundary guards |
| `"Bash"` | Bash tool (run commands) | Test gate (commit checks) |

## Hooks in This Template

| Hook | Type | Enforcement | Purpose |
|------|------|-------------|---------|
| `forbidden-imports.cjs` | Pre | Blocking | Block runtime-inappropriate APIs |
| `required-prefix.cjs` | Pre | Blocking | Enforce route path prefix |
| `boundary-guard.cjs` | Pre | Blocking | Enforce module boundaries |
| `test-gate.cjs` | Pre | Blocking | Block commits without tests |
| `data-isolation.cjs` | Pre | Warning | Warn on unfiltered DB queries |
| `delegation-check.js` | Pre | Warning | Warn on inline business logic |
| `style-guard.cjs` | Pre | Warning | Enforce prose style and formatting rules |
| `terminology-check.cjs` | Pre | Warning | Enforce consistent terminology |
| `state-flow.cjs` | Pre | Blocking/Warning | Enforce unidirectional state |
| `test-suggest.cjs` | Post | Informational | Suggest running related tests |
| `change-suggest.cjs` | Post | Informational | Suggest related actions |

## Writing Your Own Hook

1. Create a `.cjs` or `.js` file in this directory
2. Read JSON from stdin
3. Extract `tool_input.file_path` and `tool_input.content` (or `new_string`, `command`)
4. Check your constraint
5. Output JSON to stdout if there's a violation/warning
6. Exit with code 0

```javascript
#!/usr/bin/env node
const fs = require('fs');
const input = JSON.parse(fs.readFileSync('/dev/stdin', 'utf8'));
const filePath = input.tool_input?.file_path || '';
const content = input.tool_input?.content || input.tool_input?.new_string || '';

// Your check here
if (filePath.includes('/src/') && content.includes('FORBIDDEN_THING')) {
  process.stdout.write(JSON.stringify({
    decision: 'block',
    reason: 'Cannot use FORBIDDEN_THING in source files. See CLAUDE.md.',
  }));
}

process.exit(0);
```

3. Register in `settings.local.json`:

```json
{
  "matcher": "Edit",
  "hooks": [{
    "type": "command",
    "command": "node .claude/hooks/my-hook.cjs",
    "statusMessage": "Checking my constraint..."
  }]
}
```

## Testing Hooks

Test hooks locally by piping mock input:

```bash
echo '{"tool_input":{"file_path":"/src/api/test.ts","content":"const x = require(\"fs\")"}}' | node .claude/hooks/forbidden-imports.cjs
```

If the hook blocks, you'll see JSON output. If it allows, there's no output.

## Configuration Pattern

Each hook has a `// === CONFIGURATION ===` block at the top with constants you customize for your project. This keeps hooks self-contained — no external config files needed.
