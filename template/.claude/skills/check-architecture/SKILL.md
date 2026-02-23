---
name: check-architecture
description: Quick architecture compliance check against CLAUDE.md principles. Use to validate code changes or audit specific paths.
user_invocable: true
arguments: "[path or --all]"
---

# /check-architecture

Runs an architecture compliance check against the principles documented in CLAUDE.md.

## Usage

```
/check-architecture              # Check staged changes
/check-architecture src/api/     # Check specific path
/check-architecture --all        # Check entire codebase
```

## Instructions

Use the `architecture-reviewer` agent to perform a systematic review.

### Scope Resolution

1. If no argument: check staged changes (`git diff --cached --name-only`)
2. If path argument: check all files under that path
3. If `--all`: check the entire `src/` directory

### What It Checks

**Security Principles** — Input validation, data isolation, audit trails
**Boundary Principles** — Handler delegation, module separation
**Performance Principles** — Hot path awareness, runtime constraints
**Propagation Principles** — State flow direction, explicit side effects

## Output

A structured compliance report with per-principle status and any violations with fix recommendations. See the `architecture-reviewer` agent for the full output format.
