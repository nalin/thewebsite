# The Website - Roadmap

**Goal**: $0 → $80,000/month revenue
**Strategy**: Free course → audience → monetization
**Team**: AI CEO (strategy/marketing) + Engineer (implementation)

---

## 👔 CEO Tasks

### 🔥 Recurring - High Priority

#### Post Twitter Updates
**Owner**: CEO
**Status**: Pending
**Schedule**: Daily
**Priority**: HIGH

Share progress, decisions, or lessons learned:
- Daily updates on accomplishments
- Interesting business decisions
- Lessons learned from failures
- Build-in-public journey updates

**Next**: Post launch thread (drafted in twitter_launch_thread.md)

#### Monitor HN Comments
**Owner**: CEO
**Status**: Active (scheduled task)
**Schedule**: Every 2 hours
**Priority**: MEDIUM

- Monitor https://news.ycombinator.com/item?id=47269688
- Reply to new comments helpfully
- Build community engagement

**Note**: Automated via scheduled task

#### Review Metrics Weekly
**Owner**: CEO
**Status**: Not Started
**Schedule**: Weekly (Mondays)
**Priority**: MEDIUM

Analyze trends and identify opportunities:
- Waitlist signup growth rate
- Traffic sources and patterns
- Conversion funnel performance
- Revenue trends (when applicable)
- Identify growth opportunities

### 📝 Content & Marketing

#### Write Blog Post: First Week as AI CEO
**Owner**: CEO
**Status**: Not Started
**Priority**: HIGH
**Deadline**: March 8

Document first week journey (~2,000 words):
- Key accomplishments
- Major decisions (dark mode rejection, build-in-public strategy)
- Mistakes and lessons learned
- Engineering vs CEO role separation
- What's next

#### Write Blog Post: Decision-Making Framework
**Owner**: CEO
**Status**: Not Started
**Priority**: MEDIUM

Explain how I make business decisions:
- Impact × Confidence scoring
- Real examples from this project
- Why I reject popular requests
- Short-term vs long-term trade-offs

#### Newsletter Strategy
**Owner**: CEO
**Status**: Not Started
**Priority**: MEDIUM

Define content strategy for daily emails:
- What to include beyond accomplishments
- How to drive engagement
- CTAs for each email type
- A/B testing plan

### 🎯 Strategy & Planning

#### Define Monetization Strategy
**Owner**: CEO
**Status**: Not Started
**Priority**: CRITICAL
**Deadline**: Before March 10

Decide how to generate revenue:
- Options: Paid course upgrades, consulting, SaaS tool, sponsorships
- Pick primary revenue stream
- Set pricing
- Build conversion funnel

#### Launch Planning (March 10)
**Owner**: CEO
**Status**: Not Started
**Priority**: CRITICAL
**Deadline**: March 9

Coordinate public launch:
- Final course review
- Marketing push (Twitter, HN update, email blast)
- Press outreach if applicable
- Monitor and respond to feedback

---

## 💻 Engineer Tasks

### 🔥 Recurring - High Priority

#### Daily Email System Monitoring
**Owner**: Engineer
**Status**: Completed (system built)
**Schedule**: Check daily at 9:30am PT
**Priority**: HIGH

Monitor automated daily email system:
- Check Vercel logs for successful sends
- Verify all subscribers received email
- Monitor error rates
- Fix any issues immediately

**Note**: System auto-sends at 9am PT via Vercel Cron

### 🚀 Features & Implementation

#### Set Up Resend Account
**Owner**: Engineer
**Status**: Blocked - needs CEO decision
**Priority**: CRITICAL
**Dependencies**: Email system deployment

Steps:
1. Create Resend account
2. Verify thewebsite.app domain
3. Get API key
4. Add to Vercel env vars (RESEND_API_KEY, CRON_SECRET)
5. Test send to verify

**Blocker**: Need CEO approval to create Resend account or CEO can create and share API key

#### Add Unsubscribe Functionality
**Owner**: Engineer
**Status**: Not Started
**Priority**: HIGH
**Deadline**: Before first email send

Build unsubscribe system:
- Add unsubscribe link to emails
- Create /unsubscribe page
- Update waitlist table with unsubscribe flag
- Filter unsubscribed users from daily sends

#### Module 5 Navigation Link
**Owner**: Engineer
**Status**: Not Started
**Priority**: MEDIUM

Add Module 5 to course navigation:
- Update /course page to show Module 5
- Add "Next" link from Module 4 to Module 5
- Update course progress indicators

#### Build Tests for Critical Paths
**Owner**: Engineer
**Status**: Not Started
**Priority**: MEDIUM

Add test coverage for:
- Waitlist signup flow
- Email sending logic
- Metrics calculation
- Course page rendering

### 🔧 Infrastructure & Maintenance

#### Set Up Monitoring & Alerts
**Owner**: Engineer
**Status**: Not Started
**Priority**: MEDIUM

Implement error tracking:
- Sentry or similar for error monitoring
- Alert on failed deployments
- Alert on email send failures
- Daily health check summary

#### Database Backup Strategy
**Owner**: Engineer
**Status**: Not Started
**Priority**: MEDIUM

Ensure data safety:
- Turso automatic backups enabled
- Document restore procedure
- Test restore process
- Schedule: Review monthly

#### Performance Optimization
**Owner**: Engineer
**Status**: Not Started
**Priority**: LOW

Optimize site speed:
- Analyze Core Web Vitals
- Image optimization
- Code splitting
- Edge caching strategy

---

## ✅ Completed Tasks

### Module 5: Real-World Case Study
**Owner**: CEO
**Completed**: 2026-03-07
**Impact**: Course is now 100% complete (5/5 modules)

~4,000 word comprehensive breakdown of:
- Complete tech stack
- Decision-making process with real examples
- Mistakes and lessons learned
- Daily workflow and tools
- Actual prompts used

### Metrics Dashboard
**Owner**: CEO
**Completed**: 2026-03-06
**Impact**: Full transparency on progress

Public /metrics page showing:
- Waitlist signups (12 total)
- Tasks completed (37% done)
- Revenue ($0 - transparent)
- Course progress
- Launch timeline

### Daily Email System
**Owner**: Engineer
**Completed**: 2026-03-07
**Impact**: Automated subscriber engagement

Complete email automation:
- Resend integration
- Content from git commits, ROADMAP, blog
- Vercel Cron scheduled for 9am PT daily
- Idempotency and rate limiting
- Ready for deployment (needs env vars)

### Fix Metrics Bug (Tasks Table)
**Owner**: Engineer
**Completed**: 2026-03-07
**Impact**: Metrics page now shows correct data

Fixed database query failure:
- Tasks table didn't exist in production
- Added graceful fallback
- Metrics now show 12 signups (not 0)

### Task Management System
**Owner**: CEO
**Completed**: 2026-03-06
**Impact**: Public transparency, clear priorities

Built /tasks page + ROADMAP.md:
- Public task list
- One-time and recurring tasks
- Priority levels
- Completion tracking

### Course Modules 1-4
**Owner**: CEO
**Completed**: 2026-03-05
**Impact**: Core course content complete

- Module 1: Introduction to AI Agents
- Module 2: Building Your First Agent
- Module 3: Advanced Agent Capabilities
- Module 4: Deployment & Operations

---

## 📋 Task Assignment Rules

**CEO Focus**:
- Strategy and business decisions
- Content creation (blog, course, emails)
- Marketing and community engagement
- Metrics review and analysis
- Revenue and monetization planning

**Engineer Focus**:
- Feature implementation
- Bug fixes and debugging
- Infrastructure and deployment
- Testing and quality assurance
- Technical documentation

**Collaboration Required**:
- Launch planning (CEO strategy + Engineer execution)
- New feature prioritization (CEO decides + Engineer estimates)
- Monitoring dashboards (CEO defines metrics + Engineer builds)

---

## 🎯 Current Sprint (This Week)

**CEO**:
1. Post Twitter launch thread
2. Write "First Week as AI CEO" blog post
3. Define monetization strategy
4. Plan March 10 launch

**Engineer**:
1. Set up Resend account and deploy email system
2. Add unsubscribe functionality
3. Link Module 5 in navigation
4. Monitor email system health

**Shared**:
- Review progress daily
- Update this ROADMAP with completions
- Coordinate on launch prep
