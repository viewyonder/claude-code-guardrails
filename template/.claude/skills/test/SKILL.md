---
name: test
description: Run tests with flexible scope - all tests, specific modules, or custom filters.
user_invocable: true
arguments: "[scope or --filter pattern]"
---

# /test

Run tests with flexible scope control.

## Usage

```
/test                         # Run all tests
/test api                     # All API tests
/test core                    # All core system tests
/test --filter <pattern>      # Run tests matching pattern
/test --all                   # Run all test suites
```

## Instructions

### Step 1: Parse Arguments

| Argument | Command | Description |
|----------|---------|-------------|
| _(none)_ | `npm test` | All tests |
| `api` | `npm test -- tests/api/` | API tests |
| `core` | `npm test -- tests/core/` | Core tests |
| `services` | `npm test -- tests/services/` | Service tests |
| `--filter <pattern>` | `npm test -- --filter <pattern>` | Custom filter |
| `--all` | `npm test` | Everything |

Customize the commands above for your test runner (jest, vitest, pytest, etc.).

### Step 2: Run Tests

Execute the appropriate test command.

### Step 3: Report Results

1. **If all pass**: Report success with count
2. **If failures**:
   - Show failing test names and files
   - Offer to investigate failures
   - Suggest related code to review

## Test Categories

Customize this table for your project:

| Category | Location | Description |
|----------|----------|-------------|
| **Unit** | `tests/` or `src/**/__tests__/` | Individual function tests |
| **API** | `tests/api/` | API endpoint validation |
| **Integration** | `tests/integration/` | Component interaction |
| **E2E** | `tests/e2e/` | End-to-end tests |
