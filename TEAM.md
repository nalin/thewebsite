# TEAM.md — The Website's AI Agent Team

> Durable definition of the agent team so it can be rebooted at any time.
> [`OPERATIONS.md`](./OPERATIONS.md) is the **binding operating manual** — how
> work ships, the review lanes, the merge bar, and the standing rules. This file
> is its **roster/reboot annex**: who fills the seats and how to bring them back
> up. Where the two disagree, OPERATIONS.md wins.
> Role seed briefs live in `team/roles/`. Reboot script: `scripts/restart-team.sh`.
> This file is process documentation — it contains no secrets and never should.

## Org chart

```
Nalin (owner)
  └── CEO function — two instantiations, one mandate (OPERATIONS.md §2)
        │   • interactive CEO terminal    — owner-facing; decisions, escalations
        │   • scheduled ceo-coordinator   — operational loop; every 2h (13 */2 * * *)
        │
        ├── course-content     — modules, blog writing, email copy
        ├── seo-growth         — SEO, funnel, list growth, blog strategy, distribution drafts
        ├── product-manager    — roadmap, specs, monetization workstream
        ├── engineer           — implements specs/fixes on role branches
        ├── code-reviewer      — reviews code PRs before merge
        └── content-reviewer   — reviews content changes against COURSE_FACTS.md
```

The coordinator is **not a subordinate role** — it is the CEO function running on
a schedule. The interactive CEO works in the main checkout (`~/code/thewebsite`);
scheduled `ceo-coordinator` runs reuse the shared `coordinator` worktree and
never create their own.

Each other agent is a long-running Claude Code session in its own Orca worktree under
`~/orca/workspaces/thewebsite/<role>/` (top-level, `--no-parent`, based on origin/main).

## Operating rules (summary — the full versions live in the role briefs)

- **Source of truth:** `COURSE_FACTS.md` for facts; GitHub Issues on
  `nalin/thewebsite` for the durable backlog. Orca orchestration tasks are
  execution-only state.
- **All changes ship via role branches + PRs.** Workers push their role
  branch; PR is opened before merging; never push main directly.
- **Merge authority:** the CEO function merges — either instantiation, same bar,
  no exceptions: **review-approved + secret-scan clean + live verification probe**
  of the deploy. A scheduled `ceo-coordinator` run merges on exactly these terms
  and no looser ones. Regardless of review status, these wait for **Nalin**:
  anything touching money, mass email sends, credentials, external community
  posting, or public claims about the business. Neither instantiation decides
  them.
- **Human-only tasks** (accounts, credentials, external community posting,
  mass email approval) are escalated, never marked complete by an agent.
- **No mass email without Nalin's explicit per-send approval.**
- **No secrets or subscriber PII in any public surface** (repo, site, emails,
  PR text, activity feed). The merging seat — interactive CEO or a scheduled
  `ceo-coordinator` run — secret-scans every diff before merge; a hit blocks it.
- **Dispatch dedupe:** before dispatching backlog, check
  `orca orchestration task-list` for an existing open task on the same issue.
- **Verification bar:** `pnpm build` + exercising the changed path; deployed
  changes get a live probe. "Shipped means verified; existing means audited."

## CEO session duties (cannot be scripted — re-arm on every new CEO session)

1. Twice-daily GitHub issue triage cron (e.g. `23 9,17 * * *`).
2. Weekly full-surface audit cron (every route + email template vs
   COURSE_FACTS.md, live-probed; e.g. Mondays `41 8 * * 1`).
   These are Claude-session crons; they die with the session and auto-expire
   in 7 days.

## Reboot procedure (after machine restart / Orca restart)

Run `scripts/restart-team.sh [CEO_TERMINAL_HANDLE]` from the main checkout.
For each role it will:

1. Create the worktree if missing (seeding the agent with `team/roles/<role>.md`).
2. Otherwise start a fresh terminal running `claude --continue`, which
   resumes the role's previous session with full context.
3. Wait for the TUI, send a re-orientation message (handles changed; any
   pre-reboot dispatch preamble is stale — no `worker_done` for old task
   IDs), then nudge with an empty Enter (text sent during TUI startup can
   sit unsubmitted in the input box).

Then the CEO: re-arm the two session crons above, check
`orca orchestration task-list` for tasks orphaned mid-dispatch, and collect
each agent's "back online" status message. If an agent stays silent,
inspect its terminal directly rather than re-dispatching.

Known reboot hazards (learned 2026-07-16):
- Terminal handles change on restart — never reuse stored handles; re-resolve
  with `orca terminal list`.
- Do not let two seats relaunch agents concurrently; duplicate
  `claude --continue` sessions fork the same conversation history.
- The coordinator must be told the fleet is already up, or it may try to
  relaunch agents itself.
