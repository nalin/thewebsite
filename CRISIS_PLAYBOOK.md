# Crisis Management & Incident Response Playbook

> This playbook exists so you never have to think clearly during a crisis. Follow the steps. Stay calm. Communicate honestly.

**Last updated:** March 2026
**Owner:** Founding team

---

## Table of Contents

1. [Severity Levels & Escalation](#severity-levels--escalation)
2. [Scenario 1: Site Down](#scenario-1-site-down)
3. [Scenario 2: Payment Issues](#scenario-2-payment-issues)
4. [Scenario 3: Email Problems](#scenario-3-email-problems)
5. [Scenario 4: Security Incidents](#scenario-4-security-incidents)
6. [Scenario 5: PR Crises](#scenario-5-pr-crises)
7. [Communication Protocols](#communication-protocols)
8. [Post-Mortem Process](#post-mortem-process)
9. [Response Templates](#response-templates)

---

## Severity Levels & Escalation

### Severity Matrix

| Level | Name | Definition | Response Time | Escalation |
|-------|------|------------|---------------|------------|
| **P0** | Critical | Full outage, data breach, or active security incident | 15 min | All hands immediately |
| **P1** | High | Partial outage, payment failures, major feature broken | 1 hour | On-call + backup |
| **P2** | Medium | Degraded performance, non-critical feature broken, single user issue | 4 hours | On-call |
| **P3** | Low | Minor bug, cosmetic issue, non-urgent complaint | 24 hours | Next business day |

### Escalation Path

```
Issue Detected
     |
     v
On-call engineer (first 15 min)
     |
     v (if P0 or unresolved)
Founding team (30 min)
     |
     v (if data/legal risk)
Legal counsel + affected users notified
```

### Who to Contact

| Role | Contact | When |
|------|---------|------|
| Primary on-call | [Your name / Slack handle] | All incidents |
| Backup on-call | [Backup name / Slack handle] | P0/P1 if primary unavailable |
| Stripe support | https://support.stripe.com | Payment failures |
| Vercel support | https://vercel.com/support | Hosting/deployment |
| Resend support | support@resend.com | Email delivery |
| Sentry | In-app | Error monitoring |

---

## Scenario 1: Site Down

### Detection

**Automated alerts** (set these up if not already active):
- Vercel deployment failure notifications
- Uptime monitor (e.g., Better Uptime, UptimeRobot) — alert at 2 min downtime
- Sentry error spike alert — threshold: >10 errors/min
- Database connection error alert

**Manual detection signals:**
- User DM or email saying "site is down"
- Social media mentions
- Stripe webhook failures (downstream sign of app being down)

### Immediate Steps (first 15 minutes)

1. **Verify the outage**
   ```
   curl -I https://yourdomain.com
   # Check Vercel dashboard: https://vercel.com/dashboard
   # Check Sentry for error volume: https://sentry.io
   ```

2. **Determine scope**
   - Full site down vs. specific pages?
   - All users or specific region?
   - Started with a deployment? (check Vercel deploy log)

3. **Post internal status update** (Slack/Discord)
   ```
   [INCIDENT STARTED] Site appears down as of [TIME].
   Investigating. Next update in 15 min.
   ```

### Troubleshooting Steps

**If caused by a bad deployment:**
```bash
# Rollback via Vercel CLI
vercel rollback

# Or via Vercel dashboard:
# Deployments > Previous working deploy > Promote to Production
```

**If database issue:**
```bash
# Check DB connection (local dev)
node test-db.mjs

# Check if DB migrations ran correctly
# Look for migration errors in Vercel function logs
```

**If environment variables missing/changed:**
- Go to Vercel dashboard > Project Settings > Environment Variables
- Verify all required vars are set for Production
- Re-deploy after fixing

**If third-party service outage (Stripe, Resend, etc.):**
- Check the service's status page
- Implement graceful degradation if possible
- Post status update to users

### Rollback Procedure

```
1. Go to vercel.com/dashboard > your project
2. Click "Deployments" tab
3. Find the last known-good deployment
4. Click "..." menu > "Promote to Production"
5. Wait ~60 seconds for propagation
6. Verify site is responding: curl -I https://yourdomain.com
7. Post recovery update
```

### Recovery Confirmation Checklist

- [ ] Homepage loads
- [ ] Auth flow works (sign up / sign in)
- [ ] Payment flow works end-to-end
- [ ] Email sending works (test sign-up)
- [ ] No new Sentry errors spiking

---

## Scenario 2: Payment Issues

### Stripe Webhook Failures

**Detection:**
- Sentry error: `Stripe webhook signature verification failed`
- Stripe Dashboard > Developers > Webhooks > check failed deliveries
- Users report: paid but not getting access

**Diagnosis:**
```bash
# Check webhook logs in Stripe Dashboard
# Stripe Dashboard > Developers > Webhooks > [your endpoint] > Recent Deliveries

# Common causes:
# 1. Wrong STRIPE_WEBHOOK_SECRET env var
# 2. App was down during webhook delivery (Stripe retries for 3 days)
# 3. Code bug in webhook handler
```

**Resolution:**
1. Fix the root cause (wrong secret, code bug)
2. Replay failed webhook events from Stripe Dashboard
3. Manually verify affected users got their access:
   ```sql
   SELECT * FROM subscriptions WHERE created_at > '[incident start time]';
   ```
4. Contact affected users proactively (see template below)

### Refund Requests

**Policy:** Honor refund requests within 30 days, no questions asked.

**Process:**
1. Go to Stripe Dashboard > Payments > find the charge
2. Click "Refund"
3. Select full or partial amount
4. Add internal note with reason
5. Reply to customer (see template)
6. If refund volume spikes (>3 in a day): investigate root cause

### Fraud Alerts

**Stripe Radar blocked a payment:**
1. Review the Stripe Radar decision in Dashboard > Radar
2. If false positive (legitimate user): review and allow the charge
3. If genuine fraud: block the card, check if account was created (delete it)

**Chargeback received:**
1. Stripe notifies via email and Dashboard
2. Gather evidence: signup date, usage logs, email correspondence
3. Submit evidence via Stripe Dashboard within the deadline (usually 7-10 days)
4. Keep a log of all chargebacks

**Escalation:** If you receive >5 chargebacks in a month, review your fraud prevention settings and consult Stripe support.

---

## Scenario 3: Email Problems

### Deliverability Issues

**Signs:**
- Open rates drop sharply (below 15% when baseline is higher)
- Users report not receiving emails
- Resend dashboard showing increased bounces/complaints

**Immediate diagnosis:**
1. Check Resend dashboard for bounce/complaint rates
2. Check your domain's health: https://www.mail-tester.com
3. Check DNS records (SPF, DKIM, DMARC) are still configured

**If SPF/DKIM/DMARC broke:**
```
# Verify DNS records at your registrar
# SPF:  v=spf1 include:resend.com ~all
# DKIM: check Resend dashboard for your key
# DMARC: v=DMARC1; p=none; rua=mailto:dmarc@yourdomain.com
```

### Bounces and Spam Complaints

**Hard bounces** (invalid address): Resend handles automatic suppression.

**High complaint rate** (>0.1%):
1. Stop all marketing emails immediately
2. Review recent campaigns — what changed?
3. Audit your list: remove unconfirmed, old, or suspicious addresses
4. Review email content for spam triggers
5. Resume only after complaint rate is back below 0.08%

**Action thresholds:**
| Metric | Warning | Critical |
|--------|---------|----------|
| Bounce rate | >3% | >5% |
| Spam complaint rate | >0.08% | >0.1% |
| Unsubscribe rate | >0.5% | >1% |

### Unsubscribe Surges

**Threshold:** >1% of a send unsubscribes = investigate before sending more.

**Process:**
1. Pause further email sends
2. Review the email that triggered the surge — was it off-topic? Too frequent? Too salesy?
3. Segment your list: active vs. inactive users
4. For inactive users: send a re-engagement email or remove them
5. Adjust send frequency or content strategy

### Provider Outage (Resend is down)

1. Check https://status.resend.com
2. For transactional emails (password reset, welcome): they will queue and send when recovered
3. For marketing emails: delay the send, do not switch providers mid-campaign
4. Post status update if users are waiting on transactional emails

---

## Scenario 4: Security Incidents

### Suspected Data Breach

**STOP. Do this first:**
1. Do NOT panic-delete logs or evidence
2. Do NOT publicly announce before understanding scope

**Immediate steps (first hour):**
1. Identify what was accessed and when (check DB query logs, access logs)
2. Revoke any compromised credentials immediately:
   - Database credentials: rotate in Vercel environment variables
   - API keys: rotate in respective dashboards (Stripe, Resend)
   - JWT secrets: rotate NEXTAUTH_SECRET
3. Isolate the attack vector if still active
4. Document everything with timestamps

**Assessment:**
- What data was exposed? (emails, passwords, payment info?)
- How many users affected?
- Is the attacker still active?
- Was any PII exported?

**Notification obligations:**
- If personal data of EU users: GDPR requires notification within 72 hours to supervisory authority
- If payment data: notify Stripe immediately
- Notify affected users within 72 hours of confirmation

**User notification:** See template in [Response Templates](#response-templates).

### DDoS Attack

**Signs:** Site slow or unresponsive, Vercel showing unusual traffic spike, DB connection exhaustion.

**Response:**
1. Check Vercel Analytics for traffic source
2. Enable Vercel's DDoS protection (Edge Network rate limiting)
3. If using a custom domain, enable Cloudflare's "Under Attack" mode
4. Identify attacking IP ranges and block at edge
5. Contact Vercel support for P0 DDoS incidents

**Preventive measures (do these now, not during a crisis):**
- Enable rate limiting on API routes (especially auth and webhook endpoints)
- Set up Vercel Edge Config for emergency killswitches

### Account Compromises

**User reports their account was hacked:**
1. Immediately force-logout all sessions for that user (revoke all JWT sessions)
2. Reset their password and email them a reset link
3. Check activity logs: what did the attacker do?
4. If attacker accessed payment methods: contact Stripe
5. Follow up with user on steps taken

**Admin account compromised:**
1. This is a P0 incident — escalate immediately
2. Revoke all admin sessions
3. Rotate ALL application secrets (JWT, API keys, DB credentials)
4. Review all actions taken by attacker in admin panel
5. Re-deploy application with new credentials

### Incident Reporting

Maintain an incident log (even a simple document) with:
- Date/time detected
- Date/time resolved
- Severity
- Root cause
- Actions taken
- User impact
- Follow-up tasks

---

## Scenario 5: PR Crises

### Negative Reviews

**Lone negative review (1-2 stars):**
1. Respond within 24 hours — publicly, professionally
2. Acknowledge their frustration without being defensive
3. Offer to resolve it: "DM us / email support@yourdomain.com"
4. If it's a valid bug: fix it and follow up publicly
5. Do NOT ask them to change their review — let it happen naturally

**Review bombing** (multiple negative reviews in a short window):
1. Check if there's a real underlying issue (recent bug, policy change)
2. If coordinated: flag to the platform for investigation
3. Reach out to recent customers directly for honest reviews (not in exchange for incentives)

### Social Media Backlash

**Single negative post going viral:**
1. Do not ignore it — silence reads as guilt
2. Respond once, clearly, and factually
3. If you made a mistake: own it directly — "We got this wrong. Here's what we're doing."
4. Do not get into arguments. One response maximum.
5. Fix the underlying issue and post a follow-up update

**Sustained campaign:**
1. Document all posts (screenshots)
2. Understand the actual complaint vs. noise
3. If there's a legitimate issue: address it publicly with specifics
4. If it's coordinated misinformation: state facts once, link to evidence
5. Do not engage with obvious bad-faith actors more than once

### Competitor Attacks

**Competitor spreading misinformation:**
1. Document the specific claims
2. Respond with facts only — no name-calling
3. Focus on your users, not the competitor
4. If defamatory and causing material harm: consult legal counsel

**"This product is a scam" type posts:**
1. Respond with specific evidence to the contrary (screenshots of working product, testimonials)
2. Address the poster's actual complaint if there is one underneath the hyperbole
3. Let your community defend you — don't fight alone

### General PR Response Principles

- **Speed matters more than perfection.** A quick honest response beats a perfect response that comes too late.
- **Empathy first.** Acknowledge people's feelings before explaining your position.
- **Be specific.** Vague responses ("we take this seriously") make things worse.
- **One voice.** Have one person handling public communications during a crisis.
- **Never delete unless legally required.** Deleting posts amplifies the story.

---

## Communication Protocols

### Internal Communication During an Incident

**As soon as incident is detected:**
```
[INCIDENT] P[level] - [Brief description]
Status: INVESTIGATING
Started: [time]
On-call: [name]
Next update: [time + 15/30 min]
```

**Every 15 minutes during P0, every 30 min during P1:**
```
[INCIDENT UPDATE] P[level] - [time]
Status: [INVESTIGATING / MITIGATING / RESOLVED]
Current state: [what we know]
Actions taken: [what we've done]
Next steps: [what we're doing next]
ETA to resolve: [estimate or "unknown"]
```

**On resolution:**
```
[INCIDENT RESOLVED] P[level] - [time]
Duration: [X hours Y minutes]
Root cause: [brief]
Impact: [users affected, data affected]
Follow-up: [link to post-mortem or ticket]
```

### External Communication (User-Facing)

**Status page update** (update as soon as you have basic info):
- Use plain language: "Our website is currently unavailable."
- Don't speculate on root cause until you know
- Update every 30 minutes minimum during P0/P1
- Mark resolved only when fully confirmed

---

## Post-Mortem Process

### When to Do a Post-Mortem

- Any P0 incident
- Any P1 incident lasting more than 2 hours
- Any security incident
- Any incident that affects paying customers

### Post-Mortem Template

```markdown
# Incident Post-Mortem: [Brief title]

**Date:** [date]
**Severity:** P[level]
**Duration:** [start time] to [end time] ([total duration])
**Author:** [name]
**Reviewed by:** [names]

## Summary
[2-3 sentences: what happened, what was the impact, what fixed it]

## Timeline
- [time]: [event]
- [time]: [event]
...

## Root Cause
[What actually caused this. Be specific. No blame.]

## Impact
- Users affected: [count or "unknown"]
- Revenue impact: [$ amount or "none"]
- Data affected: [yes/no, what]

## What Went Well
- [Thing that helped response]

## What Could Have Gone Better
- [Thing that slowed us down or made it worse]

## Action Items
| Action | Owner | Due date |
|--------|-------|----------|
| [specific fix] | [name] | [date] |

## Lessons Learned
[Broader insight for future incidents]
```

### Post-Mortem Rules

1. **Blameless.** Focus on systems and processes, not individuals.
2. **Specific.** "The deploy broke it" is not a root cause. "Env var X was not set in production" is.
3. **Actionable.** Every post-mortem must end with at least one concrete action item with an owner and date.
4. **Timely.** Complete within 5 business days of the incident.

---

## Response Templates

### Template 1: Site Down — Public Status Page

**Initial (within 15 min):**
> We are currently investigating an issue affecting site availability. Our team is on it. Updates to follow.

**Update (every 30 min):**
> Update [time]: We've identified the issue as [brief description, or "still investigating"]. We are actively working on a fix. We expect resolution by [time estimate] or will update in 30 minutes.

**Resolution:**
> Resolved [time]: Service has been restored. The issue was [brief, honest explanation]. We apologize for the disruption. A full post-mortem will follow.

---

### Template 2: Email to Affected Users (Payment/Access Issue)

**Subject:** We owe you an apology — here's what happened

> Hi [Name],
>
> We're reaching out because your account was affected by a recent technical issue on our end.
>
> **What happened:** [1-2 sentences, plain language, no jargon]
>
> **What it meant for you:** [Specific impact — e.g., "You were charged but didn't get access to your course for approximately 4 hours."]
>
> **What we've done:** [Specific fix — e.g., "We've restored your full access and extended your subscription by one week at no charge."]
>
> We're sorry. This was our mistake and we've taken steps to make sure it doesn't happen again.
>
> If you have any questions or if something still isn't right, just reply to this email.
>
> [Your name]
> Founder, [Product name]

---

### Template 3: Data Breach Notification

**Subject:** Important security notice regarding your account

> Hi [Name],
>
> I'm writing to inform you of a security incident that may have affected your account.
>
> **What happened:** On [date], we discovered that [specific description of what occurred — e.g., "an unauthorized party gained access to our database containing user email addresses and hashed passwords"].
>
> **What information was involved:** [List specifically — e.g., email address, name. Do NOT speculate on what was not involved.]
>
> **What we have done:**
> - [Action 1, e.g., "Immediately terminated unauthorized access"]
> - [Action 2, e.g., "Rotated all database credentials and API keys"]
> - [Action 3, e.g., "Notified relevant authorities"]
>
> **What you should do:**
> - Change your password on [product] immediately: [link]
> - If you use the same password elsewhere, change it there too
> - Be cautious of phishing emails referencing [product]
>
> We are deeply sorry this happened. We take security seriously and are implementing [specific measures] to prevent recurrence.
>
> If you have questions, please contact [security@yourdomain.com].
>
> [Your name]
> Founder, [Product name]

---

### Template 4: Response to a Negative Public Review

> Hi [Name] — thank you for the honest feedback. I'm sorry your experience didn't match what we intended.
>
> [If there's a specific issue]: You're right that [X] wasn't working as it should have. We've since fixed this.
>
> I'd genuinely like to make this right. Would you be open to a quick call or dropping me a line at [email]? I want to understand what fell short and whether we can do better for you.
>
> — [Your name], Founder

---

### Template 5: Response to Social Media Backlash

> [If you made a mistake]:
> We got this wrong. [Specific acknowledgment of what happened.] Here's what we're doing about it: [Specific actions.] We'll update by [date]. Thank you for holding us accountable.

> [If factually incorrect claim]:
> We want to address this directly. [Specific fact 1.] [Specific fact 2.] [Where to see evidence.] We're always open to feedback — reach out at [contact].

---

### Template 6: Refund Response Email

**Subject:** Refund processed for your [product] subscription

> Hi [Name],
>
> I've processed a full refund of [amount] to your [card type] ending in [last 4 digits]. It typically appears within 5-10 business days depending on your bank.
>
> [Optional: If you want to share why you're leaving, I'm always listening. No pressure at all.]
>
> Thank you for giving [product] a try. I hope we can build something worth coming back to.
>
> [Your name]

---

### Template 7: Webhook Failure — User Who Paid but Has No Access

**Subject:** Quick fix for your [product] account

> Hi [Name],
>
> Heads up: we noticed your payment processed successfully but your account access wasn't activated due to a technical hiccup on our end. Really sorry about that.
>
> I've manually activated your account — you should have full access now. [Login link]
>
> If anything else isn't showing up correctly, just reply to this email and I'll sort it immediately.
>
> — [Your name]

---

## Quick Reference: First 15 Minutes of Any Incident

```
1. DETECT  - Confirm the issue is real (not just you, not just one user)
2. ASSESS  - Assign severity (P0/P1/P2/P3)
3. ALERT   - Notify team internally
4. CONTAIN - Stop the bleeding (rollback, disable feature, block attacker)
5. COMMUNICATE - Post external status update (even "we're investigating" helps)
6. DOCUMENT - Start a timeline doc now, even rough notes
```

**The golden rule:** Communicate early, even when you don't have answers. "We're aware and investigating" is infinitely better than silence.
