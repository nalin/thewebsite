# The GitHub interaction model

GitHub is the durable record of the team's work; the agent runtime (Claude Code
sessions or Orca tasks) is just execution state. Every non-trivial change
follows one path. This is the backbone that turns a pile of subagents into an
auditable company.

```
 issue  →  CEO scopes  →  dispatch  →  branch  →  PR  →  review gate  →  merge  →  verify  →  close
```

## The steps

1. **Issue.** Every idea or bug becomes a GitHub issue first. It is the backlog
   entry and the place the outcome is recorded. No issue → no durable trail.
2. **CEO scopes.** The CEO turns the issue into a concrete, verifiable task:
   what changes, who owns it, and how "done" will be proven. Vague issues get
   scoped before they get dispatched.
3. **Dispatch.** The CEO hands the task to the owning specialist —
   the `engineer` subagent for code, `content-writer` for content, etc.
   (Native: the Task tool. Orca: `orca orchestration task-create` +
   `dispatch --inject`.)
4. **Branch.** The specialist works on its **own feature branch**, one task per
   branch, committing as it goes. Never commits to `main`.
5. **PR.** The specialist pushes and opens a pull request, reporting the branch
   name + head commit back to the CEO. The PR is where the diff is reviewed and
   the preview deploy (if any) is probed.
6. **Review gate.** The CEO routes the PR to the **right independent reviewer**:
   `code-reviewer` for substantive code, `content-reviewer` for public content.
   The reviewer returns **APPROVE** or **REQUEST-CHANGES**. Reviewers never
   review their own work. (Fast-track items — typos, config, hotfixes — skip the
   independent gate but still go through a PR the CEO merges.)
7. **Merge + verify.** On APPROVE, the CEO merges **and runs a live probe** — an
   actual request, query, or click that proves the change works in the deployed
   result. Approval is not verification; both are required.
8. **Close.** The CEO comments the outcome (commit/PR links) on the issue and
   closes it.

## Why each guardrail exists
- **Issue-first** gives you a durable, greppable history independent of any
  agent session.
- **One branch per task** keeps PRs single-purpose and reviewable, and keeps
  `main` releasable at all times.
- **Independent review** catches what the author's own context can't — the
  reviewer didn't write the code and isn't invested in it.
- **Live-probe verify before close** is the rule that prevents the single most
  common agent-team failure: reporting work "done" that was never exercised.

## Minimum viable version
No GitHub org? The same shape works with local branches + PRs and a plain
`TODO`/issues file as the backlog. The guardrails — scope, branch, independent
review, verify-before-done — matter more than the specific tools.
