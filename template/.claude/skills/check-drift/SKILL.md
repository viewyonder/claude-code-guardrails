---
name: check-drift
description: Compare SPEC docs against actual codebase to detect architectural drift. Reports CURRENT/DRIFTED/UNDOCUMENTED status.
user_invocable: true
arguments: "[scope: api|models|stores|all]"
---

# /check-drift

Compare SPEC specification documents against the actual codebase to detect drift.

## Usage

```
/check-drift              # Check everything
/check-drift api          # Check API surface only
/check-drift models       # Check data models only
/check-drift stores       # Check frontend stores only
/check-drift all          # Check everything (same as no args)
```

## Instructions

Use the `drift-detector` agent to perform the comparison. Pass the scope argument (default: `all`).

The agent will:
1. Read the relevant SPEC document(s) from `docs/SPEC-*.md`
2. Scan the actual codebase
3. Compare and produce a drift report

## SPEC Documents

Customize this table for your project:

| Scope | SPEC Document | Codebase Source |
|-------|--------------|-----------------|
| api | `docs/SPEC-API-SURFACE.md` | Route definitions, handler files |
| models | `docs/SPEC-DATA-MODELS.md` | Model/schema files |
| stores | `docs/SPEC-FRONTEND.md` | Store/state files |

## Output

A structured markdown drift report showing:
- Items that match spec (CURRENT)
- Items that have drifted (DRIFTED)
- Items in code but not in spec (UNDOCUMENTED)
- Recommended actions to resolve drift
