# MyAPI - Development Guidelines

## Architecture Overview

This is a **Node.js** application built with Express. It runs on AWS EC2 and serves as the backend API for our SaaS product.

**IMPORTANT**: This is a server-side Node.js application. Frontend code lives in a separate repo.

---

## Architectural Principles

### Security Principles

**Every input is hostile.** Validate all request bodies with Zod schemas before processing.

**Tenant isolation is non-negotiable.** Every database query must include an `org_id` filter. User A must never see Org B's data.

### Boundary Principles

**Controllers validate and delegate.** Route handlers validate input, call service functions, format responses. Business logic belongs in `src/services/`, not in `src/controllers/`.

**Services own logic; repositories own data.** Services contain business rules. Repositories contain SQL. Never put SQL in a service or business logic in a repository.

### Performance Principles

**The search endpoint is latency-critical.** `GET /api/v1/search` must respond in under 200ms. No N+1 queries, no unbounded result sets.

### Change Propagation Principles

**Side effects are explicit.** Email sends, webhook dispatches, and audit log writes happen in dedicated service functions, not inline in controllers.

---

## Local Development

```bash
cp .env.example .env        # Configure environment
npm install                  # Install dependencies
npm run dev                  # Start dev server on :3000
npm test                     # Run tests
```

## Runtime Constraints

### DO
- Use Express middleware for cross-cutting concerns
- Access config via `process.env` validated at startup
- Use parameterized queries for all database access

### DON'T
- Import browser APIs in server code
- Use `eval()` or `new Function()`
- Store secrets in code or commit `.env` files
