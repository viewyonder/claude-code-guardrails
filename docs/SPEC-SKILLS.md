# SPEC-SKILLS: Skill System

> **Last verified**: 2026-02-25
> **Verified by**: manual review
> **Verification method**: file listing + source inspection

## Overview

Skills are named multi-step workflows that users invoke with a slash command. Each skill defines instructions for Claude Code to follow, and may delegate to agents. Skills live in `template/.claude/skills/` (template skills) and `plugins/coherence-plugin/` (plugin skill).

## Components

There are 4 skills total.

### Template Skills

| Skill | Location | Command | Delegates To |
|-------|----------|---------|-------------|
| coherence | `template/.claude/skills/coherence/SKILL.md` | `/coherence [scope]` | `coherence-auditor` agent |
| coherence-setup | `template/.claude/skills/coherence-setup/SKILL.md` | `/coherence-setup [--reset]` | None (interactive wizard) |
| check-architecture | `template/.claude/skills/check-architecture/SKILL.md` | `/check-architecture [path]` | `architecture-reviewer` agent |
| test | `template/.claude/skills/test/SKILL.md` | `/test [scope]` | None (runs test command directly) |

### Plugin Skill

| Skill | Location | Command | Delegates To |
|-------|----------|---------|-------------|
| coherence-setup | `plugins/coherence-plugin/skills/coherence-setup/SKILL.md` | `/coherence-setup [--reset]` | None (interactive wizard) |

## Skill Protocol

Skill definitions live in `skills/<name>/SKILL.md` with YAML front matter:

```yaml
---
name: skill-name
description: What this skill does.
user_invocable: true
arguments: "[optional arguments]"
---
```

### Front Matter Fields

| Field | Required | Description |
|-------|----------|-------------|
| `name` | Yes | Slash command name (`coherence` -> `/coherence`) |
| `description` | Yes | What the skill does |
| `user_invocable` | Yes | Must be `true` for user-facing skills |
| `arguments` | No | Description of accepted arguments |

## `/coherence-setup` Wizard Phases

The `/coherence-setup` skill is the interactive setup wizard. It runs through 7 phases:

| Phase | Name | Description |
|-------|------|-------------|
| 0 | Project Scan | Silently scan the project to detect stack, framework, tests, structure |
| 1 | Project Classification | Ask project type (web app, API, CLI, infra, writing, marketing, research) |
| 2 | Constraint Discovery | Ask 2-3 questions adapted to the project type |
| 3 | Enforcement Preferences | Ask whether to generate SPEC documents |
| 4 | Summary & Confirmation | Present what will be generated, get user approval |
| 5 | Generate Files | Create all hooks, agents, skills, CLAUDE.md, settings |
| 6 | Verify | Syntax-check hooks, cross-reference settings, check for leftover placeholders |

## Plugin Distribution

The `/coherence-setup` skill is distributed as a Claude Code plugin:

- Plugin manifest: `plugins/coherence-plugin/.claude-plugin/plugin.json`
- Marketplace listing: `marketplace.json`
- Install command: `claude plugin add --from https://github.com/viewyonder/coherence`
- Homepage: `https://coherence.viewyonder.com`

## Constraints

These constraints are falsifiable — each can be verified mechanically.

1. **All user-invocable**: Every skill's front matter has `user_invocable: true`. Verified by: `grep "user_invocable:" template/.claude/skills/*/SKILL.md` should show `true` for all.
2. **Agent cross-references valid**: Every skill that delegates to an agent references an agent that exists. Verified by: `/coherence` references `coherence-auditor` (exists), `/check-architecture` references `architecture-reviewer` (exists).
3. **Skill count**: There are 4 template skills and 1 plugin skill (5 total). Verified by: `ls template/.claude/skills/*/SKILL.md | wc -l` should return 4; plugin skill at `plugins/coherence-plugin/skills/coherence-setup/SKILL.md` exists.
4. **Plugin metadata consistent**: `marketplace.json` and `plugin.json` both reference the same homepage URL. Verified by: `grep "homepage" marketplace.json plugins/coherence-plugin/.claude-plugin/plugin.json`.

---

*This is a SPEC document. It describes what the code **does**, not what it should do. If the code contradicts this document, either the code has drifted or this document needs updating. Run `/coherence` to detect discrepancies.*
