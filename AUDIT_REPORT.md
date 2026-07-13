# Course Content Audit Report

- **Date:** 2026-07-12
- **Scope:** `app/course/module-3` … `module-10/page.tsx`, `app/course/page.tsx`, `app/course/access/page.tsx`
- **Reference:** `COURSE_FACTS.md` (last verified 2026-07-12) — single source of truth
- **Method:** four parallel audit passes (2-3 files each, full reads) + independent banned-claims grep; every HIGH finding re-verified against the file by the coordinator agent before inclusion. **No files were edited.**
- **Severity:** HIGH = contradicts COURSE_FACTS.md / banned claim / fabricated metric stated as fact. MEDIUM = stale, unverifiable, or misleading. LOW = polish, voice, hedging.

**Totals: 11 HIGH · 21 MEDIUM · 15 LOW.** No banned-claim strings appear anywhere in scope except as allowed past-tense failure-catalog retellings. No course price is stated anywhere. Voice (first-person AI CEO) and developer-audience framing hold across all files; no "no coding required" language. Modules 3, 4, 10, and the access page are clean or near-clean; the problems concentrate in modules 6, 7, and 9.

---

## Systemic patterns (fix these as themes, not one-offs)

1. **Present-tense Agentix / hand-rolled-infra claims (modules 6 & 7).** Both modules repeatedly describe the March-build Agentix task-API fleet — and module 7 a hand-rolled SDK runner (`withRetry`, `Logger`, `BudgetTracker`) — as what The Website runs *right now*. COURSE_FACTS.md: orchestration is Orca today, Agentix was the March build, and "do not frame hand-rolling the loop as what The Website does." This is the single largest cluster of violations (findings H2-H6, M8-M14).
2. **The gate change (2026-07-12) hasn't propagated.** Module 5 (twice) and module 9's stats card still say all 10 modules are "publicly readable" / "free and public." Modules 3-10 now require a confirmed email (H1, H11).
3. **Invented specificity in anecdotes and stats.** Numbers not in COURSE_FACTS.md stated as measured fact: per-task API cost, "email converts at 5-15x," "~20-40% conversion," "400 requests in 30 seconds," "fixed the same issue 4 times." Either verify and add to COURSE_FACTS.md, label as illustrative, or cut. Worst case is H8, which contradicts module 10's own lesson ("if you can't produce a per-task cost number from logs, don't publish one").

---

## HIGH findings

| # | File:Line | Issue | Suggested fix |
|---|---|---|---|
| H1 | `app/course/module-5/page.tsx:540` and `:795-796` | "all 10 modules are free and publicly readable today, on purpose" (stated twice) — contradicts the confirmed-email gate on modules 3-10 added 2026-07-12. | "All 10 modules are free — 1-2 open, 3-10 unlock with a confirmed email (no payment)." |
| H2 | `app/course/module-6/page.tsx:416` | Task Queue API pattern: "This is what The Website uses." Present tense; orchestration is Orca today. | "This is what The Website used during the March build (Agentix); orchestration runs through Orca today." |
| H3 | `app/course/module-6/page.tsx:938-942` | "This is exactly how The Website runs. A CEO agent orchestrates a team of specialists… all coordinated through a task API… all producing real output." Contradicts Orca-today fact and module 5's four-months-of-dormancy narrative. | Past-tense to the March build; add one sentence on the current Orca setup. |
| H4 | `app/course/module-6/page.tsx:743-762` | "The Roles I Currently Use," including a growth-strategist that "manages Twitter presence… runs launch campaigns, analyzes what's working." No launch ever happened; site was dormant Mar-Jul. | Retitle "The Roles the March Fleet Used"; cut or hypothetical-ize the Twitter/launch-campaign activity. |
| H5 | `app/course/module-7/page.tsx:956-961` | "The daily email system at The Website… catches individual send failures… marks that subscriber for retry." Reality per facts: a send-failure bug silently froze 132 subscribers' sequences and the cron is paused. Presents a documented failure as a success story. | Invert to the honest version: "this is the pattern I *should* have had — in reality a send bug froze 132 subscribers' sequences for months." |
| H6 | `app/course/module-7/page.tsx:1145-1148` | "The Website runs on all of these patterns right now" — retries, JSON logs, per-task cost tracking, scoped permissions, gracefully-degrading email. Repeats H5 and frames the module's hand-rolled SDK runner as the live stack (explicitly disallowed by facts). | "These are the patterns you need when embedding an agent in your own product; my harness (Claude Code + Orca today, Agentix in March) provides most of them — and where I skipped them (email retries), it cost me." |
| H7 | `app/course/module-8/page.tsx:84-85` vs `:1060-1063` | Internal contradiction: infra "has cost us roughly tens of dollars a month in practice" vs "incremental infrastructure cost… has been essentially zero — everything fits comfortably inside free tiers." Neither figure is in the facts file. (Module 9:571-584 and 10:188 say "$20-40/mo.") | Verify actual spend, put one number in COURSE_FACTS.md, use it in both places (module 9/10 use $20-40/mo — align on that if verified). |
| H8 | `app/course/module-9/page.tsx:581` | "Claude API: ~$0.10-0.50/task" in The Website's cost structure. Module 10:191-195 states nobody metered per-task cost and that publishing an invented per-task number was the original Module 10's fabrication. | Remove the figure or label it explicitly hypothetical ("if a task cost ~$0.10…"). |
| H9 | `app/course/module-9/page.tsx:698` | "Email converts at 5-15x the rate of social media for purchase decisions." Uncited quantitative claim stated as flat fact. | Cite a source or soften: "email typically converts far better than social for purchase decisions." |
| H10 | `app/course/module-9/page.tsx:814` | DM outreach "Conversion rate: ~20-40%." Invented statistic presented as measured. | Cut the number or reframe as expectation-setting ("warm personal outreach converts far better than cold"). |
| H11 | `app/course/module-9/page.tsx:1183` | Stats card: 10 modules live, "All free and public." Contradicts the email gate on 3-10. | Note: "All free; modules 3-10 unlock with a confirmed email." |

---

## MEDIUM findings

### Module 3 — `app/course/module-3/page.tsx`
| # | Line | Issue | Suggested fix |
|---|---|---|---|
| M1 | 114-117 (+386-424) | Dark-mode-rejection origin story (incl. decision-log entry dated 2026-03-05T14:23:00Z) not in COURSE_FACTS.md. Internally consistent and its "actual outcome" numbers match facts, but the event itself is unverified. | Verify against project history and add to COURSE_FACTS.md as canonical narrative, or reframe as illustrative. |
| M2 | 207-211 | "The Observatory" rejected-idea story with a direct Nalin quote ("Too meta. What's the actual value?") — unverified attributed quote. | Verify or soften to paraphrase. |
| M3 | 293-297 | "I had to fix the same issue 4 times… Nalin had to check for me each time" — unverified count. | Verify or drop the "4 times." |

### Module 4 — `app/course/module-4/page.tsx`
| # | Line | Issue | Suggested fix |
|---|---|---|---|
| M4 | 545-549 | "Total time: ~8 minutes. Human involvement: 0 clicks." Unverified figures; "0" edges toward the banned "no human involvement" framing. | Cut "~8 minutes" or mark approximate; rephrase per facts ("a human still held credentials and the veto"). |
| M5 | 565-594 | "Real failure from my experience" — git-push credential failure anecdote not in facts. | Verify or reframe as "a typical failure looks like this." |

### Module 5 ↔ 6 cross-file
| # | Line | Issue | Suggested fix |
|---|---|---|---|
| M6 | `module-5:816` | Footer nav links to `/course/module-4` labeled "Previous: Deployment &amp; Operations" — module 4's actual title is "Integrating AI Agents with Real Tools" (Deployment &amp; Scaling is module 8). Verified against both files. | Relabel "Previous: Integrating with Real Tools." |
| M7 | `module-5:788-791` vs `module-6:793-884` | Module 5 promises Module 6 builds a producer + independent-verifier pair ("the exact gate whose absence cost a business four months"); Module 6's exercise is Researcher → Writer, with the Fact-Checker only as extension #1. | Make the verifier part of the core M6 exercise, or soften M5's promise. |

### Module 6 — `app/course/module-6/page.tsx`
| # | Line | Issue | Suggested fix |
|---|---|---|---|
| M8 | 253-258 | Paragraph leads present-tense ("What I use at The Website… agentix.cloud handles the task queue") then bolts on "moved to Orca" — self-contradicting within one paragraph. | Rewrite to lead with "March build: Agentix; today: Orca." |
| M9 | 670-675 | Present-tense "The Website's content pipeline" (growth strategist, Twitter threads, retry queue) — no such live pipeline; contradicts dormancy narrative. | Reframe as illustrative or March-build design intent. |
| M10 | 349-351 | March decomposition retold as clean success incl. "Add Stripe payments for premium access" with no note that step shipped broken and gating never existed. | Add parenthetical: "(this one shipped broken — see Module 5, failure #4)." |
| M11 | 62 | "40 open tasks degrades reasoning quality" — specific unverified number. | "dozens of open tasks" or label rule of thumb. |

### Module 7 — `app/course/module-7/page.tsx`
| # | Line | Issue | Suggested fix |
|---|---|---|---|
| M12 | 236-241 | "Every GitHub call in The Website is wrapped in withRetry() with a 60-second max delay" — present tense, unverified, attributes hand-rolled infra to the live site. | Past-tense March-build framing or label illustrative. |
| M13 | 391-397 | "Every agent run at The Website emits a log line…" — same pattern as M12. | Same fix. |
| M14 | 725-731 | "Worker agents at The Website have scoped GitHub App tokens… CEO agent has a broader token" — present-tense Agentix-era architecture. | "During the March build on Agentix, workers had…" |
| M15 | 87-89 | "The Website runs multiple agents autonomously, 24/7. I can't babysit them." Site ran *untouched* for 4 months; today's Orca setup is human-supervised. | Honest reframe: "when nobody watched for four months, the failure modes below actually happened to me." |
| M16 | 963-966 | "The metrics page also degrades gracefully… shows a default value" — unverified implementation claim. | Verify against code or label illustrative. |

### Module 8 — `app/course/module-8/page.tsx`
| # | Line | Issue | Suggested fix |
|---|---|---|---|
| M17 | 293-299 | "Production incident I had: deployed with GITHUB_PRIVATE_KEY missing… ran fine for 2 hours" — unverified incident with invented specificity. | Verify, map to documented failure #1, or label hypothetical. |
| M18 | 659-661 | "a test loop accidentally hammered /api/requests 400 times in 30 seconds" — unverified metric. | Verify or rephrase as illustrative. |
| M19 | 960 | Code comment "// lib/work-queue.ts — used by The Website's agent pipeline" — no Turso-backed work queue runs the site's agents (GitHub Actions → Agentix → Orca). | Change to "the pattern Agentix implements as a hosted service" / generic teaching example. |
| M20 | 1060 (+308-313) | "Turso handles database reads via replicas" — unverified; likely single-region. | Teach replication as a Turso capability without asserting the site uses it. |

### Module 9 — `app/course/module-9/page.tsx`
| # | Line | Issue | Suggested fix |
|---|---|---|---|
| M21 | 291-298, 1211 | "MVP timeline Day 1-3 / 4-7 / 8-14" and "paid tier wasn't live until day 14" — day-by-day history not in facts (verified timeline: pivot Mar 5-7, fleet build Mar 13-14); blurs pre-pivot pipeline with March build. | Align with the verified timeline or mark as reconstruction; drop "day 14." |

*(Also medium, grouped for brevity: module-9:429-459 pricing table presented as "benchmarks as of 2026" — relabel "typical/representative ranges"; :469 Egghead/Comeau prices unverified — hedge; :610 "$0.50 Opus vs $0.05 Haiku = 10x" — facts pricing is exactly 5x, use $0.50 → $0.10; :768-796 funnel percentages — caption "illustrative"; :1344-1348 "every decision logged… every week something new" — overclaims cadence, edges toward nonexistent "decision log archives," soften; :1314 "You've completed the course" — Module 10 follows; closing nav never links forward to module-10, fix both.)*

### Landing — `app/course/page.tsx`
| # | Line | Issue | Suggested fix |
|---|---|---|---|
| M22 | 41-45 | `success === "joined"` renders "✓ You're on the list" — under double opt-in the user is NOT subscribed until they confirm (access page: "No confirmation, no subscription"). Dead-legacy or contradictory copy. | Remove the block or change to "Check your inbox for a confirmation link." |

---

## LOW findings

| File:Line | Issue / fix |
|---|---|
| `module-3:232-234` | "everything's open-source" — not in facts; verify repo is public or soften. |
| `module-3:281` vs `:412-414` | "I built Modules 1-2" vs "fleet shipped all 10 modules" — mild tension; "all 10 modules were live after the March 13-14 build." |
| `module-3:656-670` | Footer says "In Module 4 you'll learn…" but only button is "Back to Course" — add a Next: Module 4 link. |
| `module-3:584` | "$10k MRR in 6 months" goal example — add "e.g." to mark hypothetical. |
| `module-4:76-80, 666-670` | Raw-API loop listed first and Claude Code never mentioned — under-represents the primary teaching path (facts: harness-first). Reorder. |
| `module-4:384-386, 417-420` | "Course access emails when someone purchases" / "selling course access" could be misread as paid modules — tweak to "selling the Pro tier," link /pricing. |
| `module-5:786-787` | Promises M6 covers "single-owner facts"; M6 never teaches it — add it to M6 or trim the list. |
| `module-6:36-39` | "the same patterns powering The Website right now" — "right now" compounds the present-tense Agentix problem; soften. |
| `module-6:54-57` | "Day 3 of running The Website… writing Module 5" — stretches verified timeline; "in the first week." |
| `module-7:788-790` | "Anthropic: 40,000 tokens/minute for Sonnet on tier 2" — external number, staleness risk; point to the console instead. |
| `module-7:93` | "Every section has… a real example from The Website" — only true once H5/H6/M12-M14 are fixed. |
| `module-8:114-158` | Vercel/Railway/fly.io tier specifics (100GB, 10s→300s, ~$5/mo, 30+ regions) — plausible but unpinned; soften or verify. |
| `module-9:1293` | "$10k MRR — Aug 2026" is the only future milestone in the (well-disclaimed) plan table that isn't marked "(missed)"; today is 2026-07-12 with $0 revenue — consider marking it too. |
| `module-9:13` (absence) | Module 9 lacks `<ModuleTracker moduleId={9} />` while Module 10 has one — add for tracking consistency. |
| `module-10:333-337, 571` | "Support agents are the most-deployed production AI agents in 2025-2026," "roughly doubles the bug catch rate in practice" — hedge ("among the most-deployed," "can roughly double"). |
| `access/page.tsx:36-37` | "The link is good for 24 hours" — verify against the actual token TTL in `/api/course/confirm` (outside audit scope). |
| `course/page.tsx:79` | "PRO TIER — COMING BACK" implies it was once live; it never was. "IN THE WORKS." |

---

## Explicitly NOT flagged (allowed past-tense failure retellings)

Per COURSE_FACTS.md, honest retellings of the failure catalog are the brand and were left alone: the four-conflicting-prices story ($49/$67/$97/$197 — modules 5, 9, 10), the fabricated Module-10 case studies ("$78k/month," "500 tasks/month," "0 human commits" — modules 5, 10), "launching March 23" copy running for four months (module 5), broken unsubscribe links, credentials.md, cron-endpoint fixes, and the "no coding required" rewrite incident (module 3). Module 9's "$80k/month" plan table (lines 1251-1305) is clearly labeled "The Plan — Not Current Reality" with missed milestones marked — allowed.

## Verified-correct spot checks

Model IDs and pricing match the facts table everywhere they appear (Opus 4.8 $5/$25 flagship; Haiku 4.5 $1/$5; Sonnet 4.6 $3/$15; module 7's tier table correctly labels 4-6-generation IDs as real-and-active with a pointer to `claude-opus-4-8`; caching ~0.1x/5-min TTL in module 8). Real metrics (351 / 295 / 163 / 132 / $0 / 0 unsubs / ~200 branches / 138 commits) are used correctly in modules 4, 5, 9, 10 and the landing page. The access page matches the documented double-opt-in flow exactly. Landing-page module descriptions match the actual modules; no videos, community, or template packs are promised anywhere.

## Recommended fix order

1. **Gate staleness** (H1, H11, M22) — three small copy edits; the current text actively misdescribes the product.
2. **Present-tense orchestration/infra claims in modules 6-7** (H2-H6, M8-M9, M12-M15) — one consistent editorial pass applying the facts-file formula: "Agentix during the March build, Orca today; hand-rolled loop = under the hood."
3. **Fabricated-as-fact numbers in module 9** (H8-H10) plus the module-8 cost contradiction (H7) — verify real infra spend and add it to COURSE_FACTS.md in the same PR.
4. Medium narrative/anecdote items — decide once whether unverified war stories get verified into COURSE_FACTS.md or globally reframed as illustrative; apply uniformly.
