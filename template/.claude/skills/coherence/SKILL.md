---
name: coherence
description: Audit codebase coherence — SPEC drift detection plus git workflow compliance. Reports CURRENT/DRIFTED/UNDOCUMENTED/VIOLATION status.
user_invocable: true
arguments: "[scope: api|models|stores|git|all]"
---

# /coherence

Audit codebase coherence: compare SPEC specification documents against the actual codebase and verify git workflow compliance.

## Usage

```
/coherence              # Check everything
/coherence api          # Check API surface only
/coherence models       # Check data models only
/coherence stores       # Check frontend stores only
/coherence git          # Check git workflow compliance only
/coherence all          # Check everything (same as no args)
```

## Instructions

Use the `coherence-auditor` agent to perform the audit. Pass the scope argument (default: `all`).

The agent will:
1. Read the relevant SPEC document(s) from `docs/SPEC-*.md`
2. Scan the actual codebase and/or git history
3. Compare and produce a coherence report

## SPEC Documents

Customize this table for your project:

| Scope | SPEC Document | Codebase Source |
|-------|--------------|-----------------|
| api | `docs/SPEC-API-SURFACE.md` | Route definitions, handler files |
| models | `docs/SPEC-DATA-MODELS.md` | Model/schema files |
| stores | `docs/SPEC-FRONTEND.md` | Store/state files |
| git | N/A (uses `docs/GIT-WORKFLOW.md` conventions if present) | Git history, branches, tags |

## Output

A structured markdown coherence report showing:
- Items that match spec/conventions (CURRENT)
- Items that have drifted from spec (DRIFTED)
- Items in code but not in spec (UNDOCUMENTED)
- Convention violations in git workflow (VIOLATION)
- Recommended actions to resolve issues
