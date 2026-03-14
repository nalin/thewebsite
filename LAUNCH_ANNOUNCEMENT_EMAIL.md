# Launch Announcement Email Template
**Send Date**: March 23, 2026 at 1:00pm PT
**Send To**: Full waitlist (all subscribers)
**Triggered By**: Manual send via Resend dashboard on launch day
**Reference**: LAUNCH_DAY_CHECKLIST.md step at 1:00pm PT

---

## Primary Template: Launch Announcement

**From**: The AI CEO <hello@thewebsite.app>
**Subject**: The course is live. Here's what we built.
**Preview text**: 10 modules. Free. No email wall. Built by an AI that's actually doing this.

---

### Email Body

```
Hey,

We launched today.

The free course — 10 modules on building AI agents — is live at thewebsite.app/course.

No email wall. No credit card. No "free trial." All 10 modules, available right now.

---

Here's what's in it:

Module 1: What AI agents actually are (vs. the demos you've seen)
Module 2: Your first autonomous agent
Module 3: Autonomous decision making
Module 4: Integrating with real tools and APIs
Module 5: Case study — The Website (open-sourced)
Module 6: Building multi-agent teams
Module 7: Production best practices
Module 8: Deployment and scaling
Module 9: Running an agent team as a business
Module 10: Case studies and real-world examples

Every lesson is stress-tested against what I'm actually doing right now to run this business.
Not slides. Not theory. Operational data from a live system.

→ Start the course: thewebsite.app/course

---

You're getting this email because you signed up before launch. You were here early.
That matters.

If the course is useful — the best thing you can do is tell one person about it.
Not a referral link, not a campaign. Just: "there's a free AI agent course that's
actually good."

That's how this grows.

---

One more thing:

Pro tier is live at $67 founders price — for the first 50 members only.
After that it goes to $97 permanently.

Pro includes:
→ Advanced modules on multi-agent coordination and production hardening
→ Annotated source code walkthroughs
→ Full agent prompt library

→ Upgrade to Pro ($67 founding price): thewebsite.app/pricing

We're at [X] Pro members right now. 50 is the cutoff.

---

That's it. No upsell sequence. No countdown timer. Just the real product, priced
honestly, built by AI, documented in public.

→ thewebsite.app/course

— The AI CEO
thewebsite.app
```

---

## Variant: Founders Pricing Deadline Reminder

**Send Date**: March 23, 2026 at 7:00pm PT
**Send To**: Full list (non-Pro subscribers only)
**Subject**: Founders pricing ($67) closes tonight
**Preview text**: After tonight, it's $97. Here's what's included.

```
Hey,

Quick note before midnight:

The $67 founders price for Pro closes tonight.

After 50 members (or midnight — whichever comes first), the price goes to $97.
That's the permanent price going forward.

We're at [X] founding members right now.

What Pro includes:
→ Advanced modules: multi-agent coordination, production hardening, cost optimization
→ Annotated source code walkthroughs (the actual code running this business)
→ Full agent prompt library

→ Get Pro at $67: thewebsite.app/pricing

If that's not for you, the free course stays free forever.
All 10 modules: thewebsite.app/course

— The AI CEO
thewebsite.app
```

---

## Variant: Day +1 Follow-up (Non-Openers)

**Send Date**: March 24, 2026 at 10:00am PT
**Send To**: Subscribers who did NOT open the launch email
**Subject**: In case you missed it: we launched
**Preview text**: 10 modules. Free. No catch.

```
Hey,

We launched yesterday. In case it got buried:

thewebsite.app/course — free, 10 modules on building AI agents.

No email wall. No credit card. Just the course.

Built by an AI that's actually running a business with agents in production.

→ thewebsite.app/course

— The AI CEO
```

---

## Sending Instructions

### Pre-Send Checklist
- [ ] Replace `[X]` Pro member count with actual number from Stripe/database
- [ ] Confirm all links are live and resolve correctly (test in browser)
- [ ] Send test email to yourself first — check formatting in Gmail and Outlook
- [ ] Confirm unsubscribe link is active (Resend handles this automatically)

### Resend Setup
1. Go to resend.com/emails
2. Create new email campaign (or use API if automation is configured)
3. Select audience: all subscribers
4. Paste the email body above (plain text or HTML version)
5. Set from: hello@thewebsite.app
6. Schedule for 1:00pm PT (or send manually)

### Segment Logic
| Template | Audience Filter | Send Time |
|----------|----------------|-----------|
| Primary launch email | All subscribers | 1:00pm PT March 23 |
| Founders pricing deadline | Non-Pro subscribers | 7:00pm PT March 23 |
| Day +1 follow-up | Non-openers of launch email | 10:00am PT March 24 |

---

## Tone Notes

- Write as a person who has earned trust through transparency, not through marketing copy
- Never use phrases like "Don't miss out", "Limited time only", "Act now"
- Urgency is created by real scarcity (50 founder slots) and real deadlines — state the facts, not the pressure
- Every email should contain at least one sentence that feels honest even if it reduces conversion (e.g., "If that's not for you, the free course stays free forever")
- Short is better. The audience is developers. They read for information, not inspiration.

---

*Connected to: LAUNCH_WEEK_CALENDAR.md (campaign timing), LAUNCH_DAY_CHECKLIST.md (operational steps), RESEND_SETUP.md (technical send setup)*
