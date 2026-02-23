# MyApp - Development Guidelines

## Architecture Overview

This is a **Next.js 14** application with App Router, deployed on Vercel. It uses Prisma with PostgreSQL for data access.

**IMPORTANT**: Server Components are the default. Client Components must be explicitly marked with `'use client'`. Server Actions must be in `'use server'` files.

---

## Architectural Principles

### Security Principles

**Every input is hostile.** Validate all form inputs and API request bodies with Zod schemas.

**Server-client boundary is a trust boundary.** Never trust data from Client Components. Always re-validate in Server Actions and API routes.

### Boundary Principles

**Server Components fetch data; Client Components handle interaction.** Data fetching happens in Server Components or Server Actions. Client Components receive data as props.

**Prisma stays in `lib/db/`.** All database access goes through repository functions in `lib/db/`. Never import Prisma directly in components, actions, or API routes.

### Performance Principles

**Minimize client-side JavaScript.** Default to Server Components. Only use `'use client'` when you need interactivity (event handlers, hooks, browser APIs).

**Avoid waterfalls.** Use parallel data fetching with `Promise.all()` in Server Components. Don't make sequential queries when they can be parallel.

### Change Propagation Principles

**Server Actions are the mutation path.** UI -> Server Action -> DB -> revalidate. Never mutate data client-side. Use `revalidatePath()` or `revalidateTag()` after mutations.

---

## Local Development

```bash
cp .env.example .env.local   # Configure environment
npm install                   # Install dependencies
npx prisma migrate dev        # Run migrations
npm run dev                   # Start dev server on :3000
npm test                      # Run tests
```

## Runtime Constraints

### DO
- Use Server Components by default
- Use Prisma for all database access
- Use Server Actions for mutations
- Use `next/image` for images, `next/link` for navigation

### DON'T
- Import Prisma client in Client Components
- Use `'use client'` without needing interactivity
- Use `fetch()` to call your own API routes from Server Components (call DB directly)
- Store secrets in client-accessible env vars (must use `NEXT_PUBLIC_` prefix for client vars)
