# Claude Code Guardrails

**Maintain architectural coherence when AI writes your code.**

A system of hooks, agents, skills, and specification documents that encode your project's architectural constraints into the Claude Code development loop. Instead of catching violations during review, they're caught at the moment of creation.

Read the full rationale: [Entropy at Velocity](blog/entropy-at-velocity.md)

---

## Quick Start (15 minutes)

### 1. Copy the template into your project

```bash
cd /path/to/your/project

# Copy the .claude directory
cp -r /path/to/claude-code-guardrails/template/.claude .

# Copy the CLAUDE.md template
cp /path/to/claude-code-guardrails/template/CLAUDE.md .

# Copy the SPEC template and memory template
mkdir -p docs
cp /path/to/claude-code-guardrails/template/docs/SPEC-TEMPLATE.md docs/
cp /path/to/claude-code-guardrails/template/docs/MEMORY.md docs/
```

### 2. Customize CLAUDE.md

Replace the `{{PLACEHOLDER}}` markers with your project's values. The file has comments explaining each placeholder.

### 3. Configure hooks

Each hook in `.claude/hooks/` has a `// === CONFIGURATION ===` block at the top. Edit the constants for your project:

- **What APIs are forbidden?** Edit `forbidden-imports.cjs`
- **What route prefix is required?** Edit `required-prefix.cjs`
- **What module boundaries exist?** Edit `boundary-guard.cjs`
- **What tenant filter fields are used?** Edit `data-isolation.cjs`
- **Where do stores and views live?** Edit `state-flow.cjs`

Remove hooks that don't apply to your project and update `settings.local.json` accordingly.

### 4. Create your first SPEC document

Copy `docs/SPEC-TEMPLATE.md` to `docs/SPEC-API-SURFACE.md` (or whatever fits), fill in your actual components, and run `/check-drift` to verify.

---

## What's Inside

### The Four Layers

| Layer | What It Does | When It Runs |
|-------|-------------|--------------|
| **Hooks** | Enforce known constraints (block, warn, suggest) | Every file edit/write/commit |
| **Agents** | Detect drift and review architecture | On demand via skills |
| **SPEC Docs** | Define what "correct" means (falsifiable claims) | Referenced by agents and humans |
| **Skills** | Multi-step workflows with built-in compliance | User-invoked (`/check-drift`) |

### Hooks (9 included)

| Hook | Enforcement | Purpose |
|------|-------------|---------|
| `forbidden-imports.cjs` | Blocking | Block runtime-inappropriate APIs |
| `required-prefix.cjs` | Blocking | Enforce route path prefix |
| `boundary-guard.cjs` | Blocking | Enforce module boundaries |
| `test-gate.cjs` | Blocking | Block commits without tests |
| `data-isolation.cjs` | Warning | Warn on unfiltered DB queries |
| `delegation-check.js` | Warning | Warn on inline business logic |
| `state-flow.cjs` | Blocking/Warning | Enforce unidirectional state |
| `test-suggest.cjs` | Informational | Suggest running related tests |
| `change-suggest.cjs` | Informational | Suggest related actions |

### Agents (4 included)

| Agent | Role |
|-------|------|
| `architecture-reviewer` | Compliance check against CLAUDE.md principles |
| `drift-detector` | Compare SPEC docs against codebase reality |
| `code-reviewer` | Quality, security, and best practices review |
| `security-auditor` | OWASP-focused vulnerability detection |

### Skills (3 included)

| Command | What It Does |
|---------|--------------|
| `/check-drift` | Invoke drift detector, compare specs against code |
| `/check-architecture` | Compliance review of staged changes or a path |
| `/test` | Run tests with flexible scope control |

---

## Examples

The `examples/` directory shows how the template adapts to different stacks:

### Express + PostgreSQL (`examples/express-api/`)

- CLAUDE.md adapted for Node.js/Express patterns
- `forbidden-imports.cjs` blocks browser APIs and `eval()`
- `data-isolation.cjs` checks for `org_id` in PostgreSQL queries

### Next.js + Prisma (`examples/next-app/`)

- CLAUDE.md adapted for Next.js App Router patterns
- `forbidden-imports.cjs` enforces server/client boundary (no Prisma in client components)
- `boundary-guard.cjs` ensures Prisma stays in `lib/db/`

---

## How It Works

**Hooks** run as small Node.js programs before/after Claude Code executes tools. They read the proposed change from stdin, check it against your constraints, and output a decision (block, warn, or allow).

**Agents** are specialized personas with defined tools and output formats. They're invoked by skills or automatically when the task matches their description.

**SPEC documents** are falsifiable descriptions of what the code currently does — not what it should do. They make claims like "we have 18 inspectors" that can be mechanically verified against the codebase.

**Skills** are named multi-step workflows. `/check-drift` doesn't just run a grep — it invokes the drift-detector agent, which reads every SPEC document, compares against code, and produces a structured report.

See [the blog post](blog/entropy-at-velocity.md) for the full rationale behind this approach.

---

## License

MIT. See [LICENSE](LICENSE).

---

Built by [Injectionator](https://injectionator.com). Inspired by the patterns we developed while building a prompt injection defense platform with Claude Code as a primary development tool.
