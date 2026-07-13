# Sample task — the full loop in one run

A self-contained first run that needs no repo of your own. It proves the whole
loop works: a specialist fixes a real failing test, and an independent reviewer
approves the fix.

## What's here
- `sum.js` — a `sum(a, b)` with a deliberate bug (it subtracts).
- `sum.test.js` — two tests that currently **fail** (zero dependencies; uses
  Node's built-in test runner).
- `package.json` — `npm test` runs `node --test`.

## Prerequisites
- Node 18+ (for `node --test`).
- Claude Code installed and authenticated
  (`npm install -g @anthropic-ai/claude-code`).

## Run it (a couple of minutes)

1. Confirm the test currently fails:
   ```
   npm test
   ```
   You'll see `sum adds two numbers` fail (got `-1`, expected `5`).

2. From this directory, start Claude Code as the coordinator:
   ```
   claude
   ```

3. Dispatch to the engineer, then gate with the reviewer. In the session:
   > Use the **engineer** subagent to make `npm test` pass in this directory.
   > It should fix the code, run the tests to prove they pass, and report the
   > diff — not anything else.

   Then:
   > Use the **code-reviewer** subagent to review that diff. APPROVE or
   > REQUEST-CHANGES with specifics.

## What "done" looks like
- `sum.js` adds instead of subtracts.
- `npm test` passes (the engineer ran it and showed you the output — verified,
  not asserted).
- `code-reviewer` returned **APPROVE** (a separate context that didn't write the
  fix).

That's the entire operating model in miniature: scope → specialist → independent
review gate → verify. Scale it up with `../docs/SCALING.md`.

> Tip: to re-run the demo, restore the bug — change `a + b` back to `a - b` in
> `sum.js`.
