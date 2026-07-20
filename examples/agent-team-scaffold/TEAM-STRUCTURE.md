# TEAM-STRUCTURE.md — roster & reboot annex (template)

> Durable definition of the team's **shape** and how to **bring it back up**, so
> the fleet can be rebooted at any time after a machine or Orca restart.
>
> [`OPERATIONS.md`](./OPERATIONS.md) is the **binding operating manual** — the
> principles, the review lanes, the merge bar, the definition of done, and the
> standing rules. This file is its **roster/reboot annex** and deliberately does
> **not** restate those rules; where the two touch, OPERATIONS.md wins. Seat
> briefs live in [`roles/`](./roles/) (CEO) and
> [`.claude/agents/`](./.claude/agents/) (specialists). Reboot script:
> [`scripts/restart-fleet.sh`](./scripts/restart-fleet.sh).
>
> This is process documentation — it contains no secrets and never should.

---

## Org chart (template)

```
<owner> (human)
  └── CEO / coordinator ............. single point of contact for the human;
        │                            scopes, dispatches, gates, merges, verifies
        │                            (brief: roles/ceo.md)
        ├── engineer .............. implements code, fixes, infra/migrations
        ├── content-writer ........ docs, articles, guides, email/marketing copy
        ├── product-manager ....... roadmap, specs, pricing/monetization
        ├── growth ................ SEO, funnel, distribution drafts (drafts only)
        ├── code-reviewer ......... independent gate on substantive code
        └── content-reviewer ...... independent gate on public-facing content
```

Who owns what is defined once, in [`OPERATIONS.md` §2](./OPERATIONS.md) — not
repeated here. The one structural rule worth restating: **reviewers are separate
seats** so no one reviews their own work.

**One team, two runtimes** (see [`docs/SCALING.md`](./docs/SCALING.md)):
- **Native (Levels 0–2):** the CEO is your root `claude` session; the
  specialists are `.claude/agents/*.md` subagents invoked with the Task tool.
  There is nothing to "reboot" — you just start `claude` again.
- **Orca fleet (Level 3):** each seat is a **persistent Claude Code worker in
  its own git worktree**. This is the configuration that needs a reboot
  procedure, because worktrees and their terminal sessions outlive any single
  run. The rest of this doc is about that runtime.

---

## Reboot procedure (Orca fleet, after a machine / Orca restart)

Run from a checkout of this scaffold, with the Orca app already running:

```bash
scripts/restart-fleet.sh [--repo <path>] [--project <match>] [--ceo-handle <handle>]
```

It **discovers the seats** from the scaffold (the CEO brief plus every
`.claude/agents/*.md` specialist — the same set `scripts/orca-bootstrap.sh`
creates), then for each seat, idempotently:

1. **Creates** the worktree if it is missing, from `BASE_BRANCH` (default
   `origin/main`), and launches `claude --dangerously-skip-permissions`; **or**
2. **Resumes** the existing worktree with
   `claude --dangerously-skip-permissions --continue`, reattaching the seat's
   prior conversation.
3. Waits for the TUI, sends a **re-orientation** message (handles changed; any
   pre-restart dispatch preamble is stale — no completion reports for old task
   IDs), then **nudges** each pane with a bare Enter (text typed during TUI
   startup can sit unsubmitted in the input box).

Fresh seats get a *new-agent* brief (read your role files, you have no prior
work); resumed seats get a *resume* brief — the wording is deliberately
different (see hazards below).

After it finishes, the operator still must:

- **Re-arm any CEO session crons.** Session-scoped schedules (triage sweeps,
  audits) die with the session and do not come back on their own.
- **Reconcile orphaned work:** `orca orchestration task-list` — a task dispatched
  right before the restart may be stuck mid-flight.
- **Collect each seat's "back online" status.** If a seat stays silent, inspect
  its terminal directly; do **not** re-dispatch (see duplicate-session hazard).

---

## Reboot hazards (why the script is shaped the way it is)

These are the failure modes a naive "just relaunch everything" loop hits. The
script mitigates each; the operator has to respect the ones a script can't.

- **Stale terminal handles.** Handles change on every restart. Never reuse a
  stored handle — always re-resolve with `orca terminal list` /
  `orca worktree list`. The script re-resolves every handle from scratch.

- **Duplicate-session risk.** Two relaunches of the same seat fork its
  conversation history into two divergent `--continue` sessions that both think
  they own the work. Never run the reboot from two places at once, and never
  "re-dispatch to wake a quiet seat" — inspect the existing pane instead. The
  script is idempotent *only* if it is the sole thing launching seats.

- **Injection / nudge sequencing.** Text sent to a pane while its TUI is still
  starting can land in the input box **unsubmitted**. The script sends the
  re-orientation, then follows with a bare-Enter nudge to submit whatever
  landed. Fresh-vs-resume wording is not cosmetic: telling a zero-context fresh
  agent "your session was resumed, report interrupted work" primes it to
  **invent** a status it never had — a classic agent-team failure — so fresh and
  resumed seats get different messages.

- **Alive-but-slow panes.** A pane can be up and mid-turn: a message injected
  into it may sit in the composer and be **discarded when that turn ends**, so
  "the text was delivered" is not "the seat acted on it." Before concluding a
  seat is wedged, confirm it actually **consumed** the message (it responded, or
  its transcript advanced) rather than re-sending blindly. A permission prompt
  is a specific case of this — which is exactly why every seat is launched with
  `--dangerously-skip-permissions`: without it, a fresh worktree's first tool
  call blocks on an invisible prompt and the seat looks alive but never acts.

---

## Adding or removing a seat

Add a specialist by dropping a brief in `.claude/agents/<seat>.md`; remove one by
deleting its brief. Both `orca-bootstrap.sh` (create) and `restart-fleet.sh`
(reboot) discover seats from those files, so the roster, the bootstrap, and the
reboot stay in sync with **no script edits**. Keep this org chart and
[`OPERATIONS.md` §2](./OPERATIONS.md) updated to match.
