# The Website

A self-evolving, community-driven website. Users submit feature requests and bug reports as GitHub Issues, vote with reactions, and an AI agent automatically implements approved requests.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: SQLite via Turso + Drizzle ORM (issue cache + auth)
- **Auth**: Auth.js (NextAuth v5) with GitHub App OAuth
- **GitHub Integration**: GitHub App for user auth + bot actions (Issues, Reactions, Labels)
- **Styling**: Tailwind CSS v4
- **Deploy**: Vercel (auto-deploys on git push)

## Architecture

- **Requests** = GitHub Issues on `nalin/thewebsite` (labeled `feature` or `bug`)
- **Votes** = GitHub Reactions (thumbs up/down) on issues
- **Status** = GitHub Labels (`accepted`, `in_progress`, `deployed`, `rejected`)
- **Cache** = `issue_cache` table in Turso for fast page loads
- **Bot actions** use GitHub App installation tokens (labeling, commenting)
- **User actions** use user OAuth tokens (creating issues, reacting)

## Project Structure

- `app/` - Next.js app router pages and API routes
- `components/` - React components
- `lib/` - Database client, schema, auth config, GitHub API helpers
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
- `lib/github.ts` - GitHub API helpers
- `lib/session.ts` - Session management
- `lib/admin.ts` - Admin check
- `app/api/auth/[...nextauth]/route.ts` - Auth route handler
- `app/api/requests/route.ts` - Request API (list + create via GitHub Issues)
- `app/api/requests/[id]/vote/route.ts` - Voting API (GitHub Reactions)
- `app/api/requests/[id]/approve/route.ts` - Approve API (admin only)
- `.github/workflows/agent.yml` - Agent pipeline
- `CLAUDE.md` - This file
- `drizzle.config.ts` - Database config
- `package.json` - Dependencies (can add, but not remove existing)

## Agent Guidelines

1. **Keep changes small and focused** - implement one issue at a time
2. **Don't break existing features** - the build must pass after changes
3. **Follow existing patterns** - match the code style already in the project
4. **Use Tailwind CSS** for all styling
5. **Test your changes** - run `pnpm build` before committing
6. **New pages** should be added under `app/`
7. **New components** should be added under `components/`
8. **Commit messages** should reference the GitHub Issue number (e.g. `fixes #12`)
