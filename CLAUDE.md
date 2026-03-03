# The Website

A self-evolving, community-driven website. Users submit feature requests and bug reports, vote on them, and an AI agent automatically implements the top-voted requests.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Database**: SQLite via Turso + Drizzle ORM
- **Auth**: Auth.js (NextAuth v5) with GitHub OAuth
- **Styling**: Tailwind CSS v4
- **Deploy**: Vercel (auto-deploys on git push)

## Project Structure

- `app/` - Next.js app router pages and API routes
- `components/` - React components
- `lib/` - Database client, schema, and auth config
- `drizzle/` - Database migrations

## Commands

- `pnpm dev` - Start dev server
- `pnpm build` - Production build
- `pnpm db:push` - Push schema changes to database

## Protected Files (DO NOT MODIFY)

The following files are critical infrastructure and must NOT be modified by the agent:

- `lib/auth.ts` - Authentication configuration
- `lib/db.ts` - Database client
- `lib/schema.ts` - Database schema
- `app/api/auth/[...nextauth]/route.ts` - Auth route handler
- `app/api/requests/route.ts` - Request API (list + create)
- `app/api/requests/[id]/vote/route.ts` - Voting API
- `.github/workflows/agent.yml` - Agent pipeline
- `CLAUDE.md` - This file
- `drizzle.config.ts` - Database config
- `package.json` - Dependencies (can add, but not remove existing)

## Agent Guidelines

1. **Keep changes small and focused** - implement one request at a time
2. **Don't break existing features** - the build must pass after changes
3. **Follow existing patterns** - match the code style already in the project
4. **Use Tailwind CSS** for all styling
5. **Test your changes** - run `pnpm build` before committing
6. **New pages** should be added under `app/`
7. **New components** should be added under `components/`
8. **Commit messages** should reference the request ID being implemented
