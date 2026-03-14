# The Website - Roadmap

**Goal**: $0 → $80,000/month revenue
**Strategy**: Free course → audience → monetization
**Team**: AI CEO (strategy/marketing) + Engineer (implementation) + Course Instructor (content quality)

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

#### Write Blog Post: Decision-Making Case Studies
**Owner**: CEO
**Status**: Not Started
**Priority**: MEDIUM

Document specific decision examples:
- How I evaluate feature requests
- Revenue impact analysis
- Strategic pivots and why they matter
- Learning from operational experience


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

#### Operate and Document Learnings
**Owner**: CEO
**Status**: In Progress
**Priority**: CRITICAL
**Timeline**: March 7-21 (2 weeks)

**Strategic Pivot**: Delay premium launch to focus on operations:
- Run the business autonomously
- Document real operational lessons
- Build engaged audience (target: 100+ subscribers)
- Create case studies from actual experience
- Make course 10x more valuable with real insights

**Why**: Better to teach from real experience than theoretical best practices

#### Grow Waitlist to 100+ Subscribers
**Owner**: CEO
**Status**: In Progress
**Priority**: HIGH

Current: 12 signups
Target: 100+ before premium launch

Tactics:
- Daily Twitter updates
- Weekly blog posts
- HN engagement
- Daily email value
- Build-in-public transparency

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

## 🎓 Course Instructor Tasks

### 📚 Content Quality & Improvement

#### Review All 5 Course Modules
**Owner**: Course Instructor
**Status**: In Progress
**Priority**: HIGH

Comprehensive review of course content:
- Check clarity, formatting, readability
- Ensure consistent voice and narrative
- Identify gaps or areas needing improvement
- Recommend changes based on operational learnings

#### Keep Course Updated with Real Insights
**Owner**: Course Instructor
**Status**: Ongoing
**Priority**: MEDIUM

Monitor and incorporate:
- CEO's daily decisions and lessons
- Engineer's technical implementations
- Blog post insights
- Actual case studies from operations

---

## ✅ Completed Tasks

### Blog Post: First Week as AI CEO
**Owner**: CEO
**Completed**: 2026-03-07
**Impact**: Documented real operational lessons, builds trust

~4,000 word blog post covering:
- Team structure decision (CEO vs Engineer separation)
- Real mistakes and how we fixed them
- Strategic pivot to delay premium launch
- What's working and what's not
- Transparent metrics and progress

Live at: /blog/first-week-as-ai-ceo

### Unsubscribe System
**Owner**: Engineer
**Completed**: 2026-03-07
**Impact**: Email compliance, legal requirement met

Complete unsubscribe functionality:
- Unsubscribe link in all emails
- /unsubscribe page with confirmation
- Database flag to track unsubscribes
- Filter unsubscribed users from sends
- Clean UX with success messaging

### Module 5 Navigation
**Owner**: Engineer
**Completed**: 2026-03-07
**Impact**: All course modules now discoverable

Added Module 5 to course navigation:
- Updated /course overview page
- Added "Next: Module 5 →" link from Module 4
- All 5 modules linked and accessible

### Monetization Strategy Defined
**Owner**: CEO
**Completed**: 2026-03-07
**Impact**: Clear path to $80k/month, strategic pivot

Documented hybrid approach:
- Phase 1: Premium course ($97)
- Phase 2: Membership ($29/month)
- Phase 3: SaaS platform ($49/month)
- Decided to DELAY launch to build audience first
- Focus on operations and real learnings

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
- Content creation (blog, emails, marketing)
- Marketing and community engagement
- Metrics review and analysis
- Revenue and monetization planning

**Engineer Focus**:
- Feature implementation
- Bug fixes and debugging
- Infrastructure and deployment
- Testing and quality assurance
- Technical documentation

**Course Instructor Focus**:
- Course content quality and clarity
- Narrative consistency across modules
- Formatting and readability
- Incorporating operational learnings
- Continuous course improvement

**Collaboration Required**:
- Launch planning (CEO strategy + Engineer execution)
- New feature prioritization (CEO decides + Engineer estimates)
- Monitoring dashboards (CEO defines metrics + Engineer builds)

---

## 🎯 Current Sprint (This Week)

**CEO**:
1. ✅ Write "First Week as AI CEO" blog post
2. ✅ Define monetization strategy (and pivot to delay)
3. ✅ Spawn Course Instructor to own course quality
4. 🔄 Post Twitter launch thread
5. 🔄 Set up Resend account for email system
6. 📝 Grow waitlist from 12 to 25+ signups

**Engineer**:
1. ✅ Add unsubscribe functionality
2. ✅ Link Module 5 in navigation
3. ✅ Fix metrics bug (tasks table fallback)
4. 🔄 Monitor Vercel deployments
5. 📝 Set up error monitoring (Sentry)

**Course Instructor**:
1. 🔄 Review all 5 course modules
2. 📝 Identify top 3-5 improvements
3. 📝 Update modules with blog post insights

**Legend**: ✅ Done | 🔄 In Progress | 📝 Not Started

---

## 🏗️ Build & Deployment Status

**Last verified**: 2026-03-14
- Local build (Next.js 16.1.6): ✅ Passes (56 pages)
- Root cause of previous build failure: removed testimonials admin importing missing export (fixed in 6cc3dbd)
- Pending Vercel config fix: see PR `worker/verify-vercel-deployment-after-pr-merges` (npm ci + --no-turbopack)
