# TestForge — Production Upgrade Prompt

## Important: Build On What Exists

TestForge already has a working codebase — a landing page, demo portal, routing, components, and Supabase integration scaffolding built across Phase 1–3. **Do NOT rewrite everything from scratch.** Read the existing code first. Preserve working functionality. Add, improve, and refactor where necessary — but only rewrite components when the existing code is fundamentally incompatible with the new direction. If a component works and just needs styling or data changes, update it in place.

Run `npm run dev` first and explore the current state before changing anything.

## Who You Are

You are a senior full-stack engineer upgrading TestForge from a working prototype to a production-ready product for a founder named Umut. Umut has 6 years of hands-on test automation experience at Samsung Semiconductor where he single-handedly built the lab's entire test automation infrastructure from scratch — parallel multi-device orchestration across hundreds of devices, firmware flashing pipelines, power-state validation, crash triage systems, CI/CD integration, OEM device qualification, and automated Jira ticket creation. TestForge productizes that expertise.

**This is not a demo or portfolio project. This is the beginning of a real company.** Every line of code, every design decision, every piece of copy must reflect that. Build it like you're shipping to paying customers next month.

## What TestForge Is

TestForge is a **lab operations and test management platform** for hardware, firmware, and software teams. It is NOT just a test reporting tool. It replaces the spreadsheets, Slack messages, manual triage, and duct-tape processes that every test lab currently uses to manage devices, track inventory, coordinate operations, and analyze test results.

### The AI Era Problem

Developers are shipping faster than ever. AI-assisted coding means more code, more commits, more builds — but not necessarily more tested code. Features land in production that the developer didn't fully read through. QA and platform teams are the last line of defense, and they're overwhelmed. TestForge exists to make that defense layer efficient, visible, and automated — so teams can keep pace with the speed of modern development without sacrificing quality.

**Our message**: In the AI era, shipping speed has outpaced testing speed. TestForge closes that gap — making test and task automation simple, efficient, secure, and visible.

### Two-Tier Business Model

**Tier 1 — TestForge Dashboard (SaaS subscription)**
Teams connect their existing test results to TestForge via API. They get real-time dashboards, analytics, crash triage, device health monitoring, inventory management, operations tracking, automated Jira ticket creation, and trend analysis. Works with any test framework — JUnit XML, Robot Framework, pytest, custom scripts. The API is standardized; each team gets their own tenant URL.

- Starter: $199/month (up to 10 devices, 5 users)
- Professional: $499/month (up to 50 devices, 15 users, AI crash triage, Jira/Slack integration)
- Enterprise: Custom (unlimited devices, on-prem option, dedicated support, SLA)

**Tier 2 — TestForge Pipeline (end-to-end managed service)**
TestForge builds and maintains the entire firmware flashing → testing → reporting pipeline for the customer. This includes custom test orchestration, device provisioning, automated nightly runs, and ongoing maintenance. Higher setup cost + monthly maintenance fee.

- Setup fee: Scoped per engagement (typically $5K–$25K depending on complexity)
- Monthly maintenance: $2K–$10K depending on device count and pipeline complexity

---

## Tech Stack

- **Frontend**: Vite + React 18 + TypeScript
- **Styling**: Tailwind CSS v3 (no component libraries)
- **Charts**: Recharts
- **Icons**: Lucide React
- **Routing**: React Router v6 with HashRouter (GitHub Pages compatibility)
- **Backend/DB**: Supabase (PostgreSQL + Auth + Row Level Security + Edge Functions)
- **Deployment**: GitHub Pages via `gh-pages` npm package
- **Repo**: `testforge` → deploys to `candanumut.github.io/testforge/`

---

## Design Direction

### Aesthetic: "Apple Meets Engineering"

This should look like Apple designed a test management platform — clean, bright, confident, with exquisite attention to spacing, typography, and visual hierarchy. Not dark-mode-hacker, not generic-SaaS-template. The kind of design that makes someone say "this company clearly has a real design team" even though it's one founder.

Think: Linear, Vercel, Stripe, Notion — companies where the product page IS the proof of quality.

- **Theme**: Light mode primary. Clean white (`#ffffff`) and soft warm grays (`#f9fafb`, `#f3f4f6`) for backgrounds. NOT stark clinical white — use very subtle warm undertones so it feels inviting, not sterile.
- **Accent colors**: A single bold primary — deep indigo (`#4f46e5`) or rich blue (`#2563eb`) for primary actions and CTAs. Use it sparingly so it pops. Emerald (`#10b981`) for pass/success. Soft red (`#ef4444`) for failures. Amber (`#f59e0b`) for warnings. The dashboard can have a dark/navy sidebar (`#0f172a`) for contrast — this creates the "mission control" feel inside the app while the landing page stays bright and premium.
- **Typography**: Use `"SF Pro Display"` with fallback to `"Inter"` and then system-ui for body text — yes, Inter is usually generic, but when paired with precise spacing and weight variation (300, 400, 500, 600, 700) it reads as Apple-like, not template-like. For code/terminal elements, use `"JetBrains Mono"` or `"SF Mono"`. The key is using type SCALE properly: huge bold headlines (48-72px), generous line height (1.5-1.7 for body), and careful letter-spacing (-0.02em on headlines for that premium feel).
- **Spacing**: Generous. Apple's design language is defined by whitespace. Sections should breathe. Minimum 80px vertical padding between landing page sections. Card padding 24-32px. Don't cram information — let each element have room.
- **Cards/Panels**: Clean and flat. Subtle border (`border: 1px solid #e5e7eb`), very subtle shadow (`shadow-sm` or `shadow: 0 1px 3px rgba(0,0,0,0.06)`). NO glassmorphism on the landing page — save that for the dashboard if needed. Rounded corners: 12-16px for cards, 8px for buttons, 6px for inputs.
- **Micro-interactions**: Smooth and understated. Buttons with subtle scale on hover (`transform: scale(1.02)`). Cards with gentle lift on hover (`translateY(-2px)` + shadow increase). Page transitions with opacity fade (200ms). Number counters that animate up smoothly. Nothing bouncy, nothing flashy.
- **Images/Graphics**: Use abstract geometric shapes, subtle gradient meshes, or clean SVG illustrations — NOT stock photos, NOT AI-generated images. The hero can use a product screenshot or live demo embedded in a realistic browser mockup frame with subtle shadow.
- **The "one thing" people remember**: The hero section should show the actual product — either a live-updating terminal component showing test execution (styled cleanly, not retro-CRT) OR a polished screenshot of the dashboard inside a device frame. The terminal, if used, should look modern — clean monospace on a slightly off-white or very light gray background with syntax-highlighted output, not green-on-black.

### Copy Rules

- **NO hype words**: Never use "revolutionary", "blazing fast", "game-changing", "cutting-edge", "next-generation", "supercharge", "unleash", "skyrocket", or "10x".
- **NO fake statistics**: No "99.7% uptime", "10x faster", "saved teams $2M". If a stat isn't real, don't include it.
- **Lead with the AI era reality**: "Developers ship faster than ever. AI writes code humans haven't fully reviewed. Your test infrastructure needs to keep up."
- **Honest tone**: Write like a thoughtful founder talking to a peer. Confident but not arrogant. Specific but not jargon-heavy. Think Apple keynote copy — short sentences, clear value, understated confidence.
- **Social proof**: Use "representative" quotes clearly marked as such, based on real problems Umut solved at Samsung. Do NOT present them as real customer testimonials.
- **Core value proposition words**: Simple. Efficient. Visible. Secure. Use these consistently.

---

## PHASE 1: Landing Page + Routing + Project Foundation

### Goal
Upgrade the existing landing page to a bright, Apple-inspired design that makes a hardware test team lead think "this is a serious company." Fix routing issues, update messaging for the AI era positioning, and ensure demo mode works flawlessly. **Read the existing code first. Preserve working components. Restyle and add — don't rewrite what already works.**

### 1.1 Project Structure

The project already has most of this structure. Add any missing files, but do NOT recreate files that already exist and work. If a component exists but needs restyling, update it in place.

```
testforge/
├── public/
│   ├── 404.html                    # GitHub Pages SPA redirect
│   └── favicon.svg                 # TestForge logo as SVG
├── src/
│   ├── main.tsx
│   ├── App.tsx                     # HashRouter setup
│   ├── lib/
│   │   ├── supabase.ts             # Supabase client (env vars)
│   │   ├── types.ts                # All TypeScript interfaces
│   │   └── demo-data.ts            # Realistic demo data generator
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useTestRuns.ts
│   │   ├── useDevices.ts
│   │   ├── useOrganization.ts
│   │   ├── useCrashes.ts
│   │   └── useDashboardStats.ts
│   ├── contexts/
│   │   ├── AuthContext.tsx
│   │   └── DataContext.tsx          # Switches between Supabase and demo data
│   ├── pages/
│   │   ├── Landing.tsx
│   │   ├── Login.tsx
│   │   ├── Signup.tsx
│   │   ├── Dashboard.tsx
│   │   ├── TestRuns.tsx
│   │   ├── Devices.tsx
│   │   ├── CrashTriage.tsx
│   │   ├── LogExplorer.tsx
│   │   ├── Reports.tsx
│   │   ├── Settings.tsx
│   │   ├── SetupGuide.tsx
│   │   ├── ApiDocs.tsx
│   │   └── NotFound.tsx
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.tsx           # Landing page top nav
│   │   │   ├── Sidebar.tsx          # App sidebar
│   │   │   ├── AppLayout.tsx        # Auth'd app shell
│   │   │   └── Footer.tsx
│   │   ├── landing/
│   │   │   ├── Hero.tsx             # Terminal animation + headline
│   │   │   ├── PainPoints.tsx       # "Sound familiar?" section
│   │   │   ├── PlatformOverview.tsx # Two-tier model explanation
│   │   │   ├── Features.tsx         # Feature grid
│   │   │   ├── HardwareSection.tsx  # "Built for hardware teams"
│   │   │   ├── Architecture.tsx     # Interactive architecture diagram
│   │   │   ├── HowItWorks.tsx       # Integration steps
│   │   │   ├── Pricing.tsx          # Tier cards + comparison table
│   │   │   ├── Testimonials.tsx     # Representative quotes
│   │   │   ├── CTA.tsx              # Final call to action
│   │   │   └── Stats.tsx            # Animated counters (real numbers only)
│   │   ├── dashboard/
│   │   │   ├── StatsCards.tsx
│   │   │   ├── PassFailChart.tsx
│   │   │   ├── FailureCategoryPie.tsx
│   │   │   ├── RecentRuns.tsx
│   │   │   ├── ActiveDevices.tsx
│   │   │   ├── DeviceHealthGrid.tsx
│   │   │   └── AlertsFeed.tsx
│   │   ├── triage/
│   │   │   ├── CrashList.tsx
│   │   │   ├── CrashDetail.tsx
│   │   │   └── TriageActions.tsx
│   │   └── common/
│   │       ├── ProtectedRoute.tsx
│   │       ├── LoadingSpinner.tsx
│   │       ├── EmptyState.tsx
│   │       ├── Badge.tsx
│   │       ├── StatusDot.tsx
│   │       └── DataTable.tsx
│   ├── utils/
│   │   ├── formatters.ts
│   │   └── constants.ts
│   └── styles/
│       └── index.css
├── supabase/
│   └── migrations/                  # Phase 2
├── scripts/
│   └── testforge_reporter.py        # Phase 3
├── index.html
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

### 1.2 Routing (HashRouter)

```
/#/                     → Landing page
/#/login                → Login
/#/signup               → Signup
/#/demo                 → Dashboard with demo data (no auth required)
/#/app/dashboard        → Dashboard (auth required)
/#/app/test-runs        → Test Runs
/#/app/devices          → Devices & Inventory
/#/app/crash-triage     → Crash Triage
/#/app/logs             → Log Explorer
/#/app/reports          → Reports
/#/app/settings         → Settings (API keys, team, org)
/#/docs/setup           → Setup Guide (public)
/#/docs/api             → API Documentation (public)
```

**CRITICAL**: Landing page section links (Features, Architecture, Pricing, etc.) must use `onClick` handlers with `document.getElementById('section-id')?.scrollIntoView({ behavior: 'smooth' })`. Do NOT use `<Link>` components or `#anchor` hrefs — they conflict with HashRouter.

### 1.3 Landing Page Sections (in order)

#### Section 1: Hero
- **Headline**: "Ship faster. Test smarter."
- **Subheadline**: "In the AI era, code ships faster than teams can test it. TestForge gives hardware, firmware, and software teams one platform for device management, test orchestration, crash triage, and real-time visibility — so quality keeps pace with velocity."
- **Two CTA buttons**: "See Live Demo" (goes to `/#/demo`, primary filled button) and "Start Free Trial" (goes to `/#/signup`, secondary outlined button)
- **Below CTAs**: Small trust line — "No credit card required · 14-day free trial · Setup in 5 minutes"
- **Hero visual**: A clean product screenshot of the dashboard inside a subtle browser frame with soft shadow. OR a modern terminal component (NOT retro/CRT) showing test execution on a light background:

The terminal should use a clean modern style — light gray background (`#f8fafc`), subtle border, rounded corners (12px). Syntax-colored output with careful use of green (pass), red (fail), blue (info), amber (warning). JetBrains Mono font. No scan-line or CRT effects.

```
[14:23:01] TestForge Agent v2.1.0 connected
[14:23:01] Scanning lab devices...
[14:23:02] ✓ 47 devices online | 3 offline | 2 in maintenance
[14:23:02] Starting nightly firmware validation suite
[14:23:03] ▸ Flashing boot.img → PX8P-001 via fastboot... done (42s)
[14:23:03] ▸ Flashing boot.img → PX8P-002 via fastboot... done (38s)
[14:23:04] ▸ Waiting for boot_completed... PX8P-001 ✓ (12s) | PX8P-002 ✓ (14s)
[14:23:05] Running post-flash-smoke on 47 devices (parallel)...
[14:23:08] ✓ PX8P-001: 24/24 passed (1m 12s)
[14:23:09] ✗ PX8P-002: 23/24 passed, 1 failed (1m 18s)
[14:23:09]   └─ FAIL: suspend_resume_cycle — KernelPanic at drivers/gpu/power.c:847
[14:23:10] ⚡ Crash detected — auto-triaging...
[14:23:10]   └─ Fingerprint: GPU_PWR_847 (seen 3 times this week)
[14:23:10]   └─ Jira ticket FWVAL-1892 created → assigned to gpu-power-team
[14:23:11] ▸ 46/47 devices passed nightly validation
[14:23:11] ▸ Report generated → #firmware-validation Slack channel
```

This terminal should loop, with each run showing slightly different data.

#### Section 2: AI Era Banner

A single impactful section with centered text on a very subtle gradient background (white to off-white):

**"AI writes code faster than humans can review it."**
"Every day, AI-assisted development pushes more code, more commits, more builds into your pipeline. But test infrastructure hasn't kept up. QA teams are the last line of defense — and they're drowning. TestForge closes the gap between development velocity and test coverage."

#### Section 3: Pain Points — "Sound familiar?"

A grid of 4 cards, each describing a real pain point. Clean white cards with subtle border, icon in the accent color, generous padding.

1. **"AI ships code. Who tests it?"** — "AI-assisted development means more PRs, more builds, more features — shipped faster than your test team can validate. Every untested build is a risk that compounds."
2. **"Tracking devices in a spreadsheet"** — "You have 200 devices in the lab. Half are in drawers, some are flashed with old firmware, and nobody knows which ones are available for testing right now."
3. **"Manual crash triage every Monday"** — "Someone spends half the week reading crash logs, deduplicating failures, and filing Jira tickets by hand. Every week. For every build."
4. **"No visibility until it's too late"** — "You find out a device has been offline for 3 days when a test run fails. You discover a regression after 50 builds have shipped."

After the grid, a single line centered: "TestForge was built by a test automation engineer who lived these problems for 6 years. It exists because none of the existing tools solved them."

#### Section 4: Platform Overview — Two Service Tiers

Show the two-tier model visually side by side:

**Left card: "TestForge Dashboard"**
- "Connect your existing test framework. Get instant visibility."
- Icon: monitor/dashboard
- Key points: Plug in via API, works with any test framework, real-time results and analytics, automated crash triage and Jira tickets, device health monitoring
- "Starting at $199/month"
- CTA: "Start Free Trial"

**Right card: "TestForge Pipeline"**
- "We build and maintain your entire test automation pipeline."
- Icon: workflow/pipeline
- Key points: Custom firmware flashing → test → report pipeline, multi-device orchestration, nightly automated runs, ongoing maintenance and support
- "Custom scoping — talk to us"
- CTA: "Contact Us"

#### Section 5: Features Grid

6 feature cards in a 3x2 grid. Clean white cards with subtle border, icon in accent color, generous padding (32px). Each card has an icon, title, 2-sentence description.

1. **Real-Time Test Dashboard** — "Watch test results stream in as they execute. Pass rates, failure categories, device-level breakdowns — updated live, not after the run finishes."
2. **Automated Crash Triage** — "Crashes are deduplicated by stack trace fingerprint, categorized by type, and analyzed for root cause. Jira tickets are created automatically with full context."
3. **Device Health & Inventory** — "See every device in your lab — online/offline status, current firmware version, last test run, battery health, connectivity type. Know what's available before you start a test."
4. **Operations Management** — "Track firmware flashing queues, test execution schedules, device allocation, and maintenance windows. The operational layer that spreadsheets can't provide."
5. **Trend Analytics** — "Pass rate over time per suite, per device, per firmware build. Spot regressions before they compound. Compare branches. Identify flaky tests."
6. **Integrations** — "Push test results via REST API from any framework. Auto-create Jira tickets. Send alerts to Slack. Export PDF reports. Connect to your CI/CD pipeline."

#### Section 6: Built for Hardware Teams

This is the differentiator section. Use a very subtle off-white or light gray background (`#f8fafc`) to visually separate it from the rest. Keep it clean and bright — NOT dark.

- **Heading**: "Built by a hardware test engineer. For hardware test teams."
- **Subheading**: "Most test tools are built by web developers who've never touched a UART cable. TestForge was born in a lab with 200+ devices, firmware flashing failures at 3am, and the reality that hardware testing is fundamentally different from software testing."

3 columns:
- **Firmware Validation Pipeline**: "Automated flash → boot → test → report. Support for fastboot, OTA, UART. Validate every build before it reaches QA."
- **Power State Testing**: "Automated suspend/resume cycling, deep sleep validation, wake source verification. Catch power management regressions that hide for weeks."
- **Multi-Device Orchestration**: "Same test suite across 50+ devices in parallel. Automatic allocation, health checks, and result correlation across device variants."

Each with a realistic config snippet:

```yaml
# testforge.yml — firmware validation pipeline
pipeline:
  - flash:
      method: fastboot
      image: builds/latest/boot.img
      timeout: 120s
  - boot_verify:
      wait_for: "sys.boot_completed=1"
      timeout: 60s
  - run_suite:
      name: post-flash-smoke
      parallel: true
      devices: ["PX8P-*"]
  - report:
      channels: [slack, jira]
      on_failure: create_ticket
```

#### Section 7: Architecture Diagram

Interactive SVG/CSS diagram showing data flow:

```
Your Devices & Test Frameworks
    ↓ (REST API / TestForge Agent / CI/CD webhook)
TestForge Ingestion Layer
    ↓
Processing Engine
    ├── Log Parser
    ├── Crash Deduplication
    ├── AI Triage
    └── Trend Analysis
    ↓
PostgreSQL (Supabase)
    ↓
    ├── Real-time Dashboard
    ├── Slack / Jira Alerts
    ├── PDF Reports
    └── REST API (query your data)
```

Make it interactive — hover over each component to see a tooltip with details. Animated dashed lines showing data flow. Use CSS animations, not a library.

#### Section 8: Pricing

Three cards on white background. Professional is highlighted with the accent color border and "Most Popular" badge. Cards should have clean borders, generous padding, and clear visual hierarchy. The highlighted card can have a very subtle accent-colored background tint (`bg-indigo-50` or similar).

| | Starter | Professional | Enterprise |
|---|---|---|---|
| Price | $199/month | $499/month | Custom |
| Devices | Up to 10 | Up to 50 | Unlimited |
| Users | 5 | 15 | Unlimited |
| Test results | 10,000/month | Unlimited | Unlimited |
| Dashboard | ✓ | ✓ | ✓ |
| Device health | ✓ | ✓ | ✓ |
| Crash triage | Basic | AI-powered | AI-powered |
| Jira integration | — | ✓ | ✓ |
| Slack alerts | — | ✓ | ✓ |
| API access | Read only | Full | Full |
| Reports | Weekly summary | Custom + PDF export | Custom + PDF + API |
| Support | Email | Priority | Dedicated engineer |
| On-premise | — | — | ✓ |

Add toggle for Monthly / Annual (Save 20%). Annual pricing: Starter $159/mo, Professional $399/mo.

Below the cards, add the Pipeline service callout:
"**Need the full pipeline?** We build and maintain your end-to-end test automation infrastructure — firmware flashing, orchestration, validation, and reporting. [Talk to us →]"

#### Section 9: Representative Quotes

3 quote cards. Mark clearly: "Based on real problems solved during 6 years of test automation engineering."

1. "We went from spending 2 days a week on crash triage to 2 hours. The automated stack trace deduplication alone paid for itself." — *Test Lead, Mobile Device Lab*
2. "Setting up firmware validation used to take a new engineer 3 months to learn. With a proper pipeline, we were running automated nightly tests in the first week." — *Engineering Manager, Embedded Systems*
3. "We test across 30 device variants nightly now instead of 5 manually. That's the difference between catching a regression before release and after." — *QA Director, Consumer Electronics*

#### Section 10: CTA

- "Ready to stop firefighting and start shipping?"
- Email capture + "Start Free Trial" button
- Below: "14-day free trial on Professional plan. No credit card required."

#### Section 11: Footer

- Columns: Product (Features, Pricing, Demo), Resources (Setup Guide, API Docs, Changelog), Company (About, Contact, GitHub)
- "Built by Umut Candan" with GitHub link
- © 2026 TestForge. All rights reserved.

### 1.4 DataContext — Demo Mode

Create a `DataContext` that provides data to all dashboard components. It checks for Supabase environment variables:
- If Supabase is configured → fetch from Supabase
- If not → use demo data from `demo-data.ts`

The `/#/demo` route uses demo data regardless of Supabase config.

### 1.5 Demo Data Generator

The `demo-data.ts` file must generate **realistic** data. Not random noise. Use data that reflects real hardware test lab scenarios:

**Devices** (generate 47 devices):
- Device names like: `PX8P-001`, `PX8P-002`, `SM-S928-001`, `SM-S928-002`, `T730-001`
- Statuses: 38 online, 3 offline, 4 in maintenance, 2 flashing
- Include: serial number, firmware version, last heartbeat, battery level, connection type (USB/WiFi/UART), carrier (for phones)
- Some devices should have concerning health: low battery, stale heartbeat (>2 hours), old firmware

**Test Runs** (generate 90 days of history, ~2 runs per day):
- Suite names: `post-flash-smoke`, `suspend-resume-stress`, `connectivity-sweep`, `modem-stability`, `ble-qualification`, `camera-sanity`, `ota-upgrade-verify`
- Pass rates: mostly 85-95%, with occasional drops to 60-70% (simulating real regressions)
- Duration: 5min to 45min depending on suite
- Status distribution: 70% passed, 15% partial, 10% failed, 5% error

**Crashes** (generate 23 unique crashes):
Use real-looking crash signatures:
- `KernelPanic at drivers/gpu/power.c:847` — GPU power management, seen 12 times
- `NullPointerException in ModemController.java:392` — Modem firmware, seen 8 times
- `BLE_WATCHDOG_TIMEOUT at bt_hci.c:1203` — Bluetooth stack, seen 5 times
- `ANR in com.android.systemui (15s)` — System UI hang, seen 15 times
- `ASSERT_FAIL: baseband_ver mismatch` — Firmware version conflict, seen 3 times
- And 18 more realistic ones

Each crash should have: severity (critical/high/medium/low), status (new/investigating/resolved), assigned team, first seen date, last seen date, occurrence count, affected devices, and a stack trace.

**AI Triage Analysis** (for each crash):
Generate realistic analysis text, like:
```
Root Cause: GPU power state transition fails when resuming from deep sleep
with active display pipeline. The power controller attempts to restore
GPU clocks before the display subsystem has completed its resume sequence.

Impact: Affects all devices with Adreno 740 GPU on firmware builds after
v3.2.1-rc4. Triggered by suspend/resume cycles with >10s sleep duration.

Suggested Fix: Ensure display resume completion fence is signaled before
GPU clock restore in drivers/gpu/power.c:handle_resume(). Similar fix
applied in commit a3f7b2c for Mali GPUs.

Related: FWVAL-1834, FWVAL-1756 (same subsystem, different trigger)
```

### 1.6 Build & Deploy

- `vite.config.ts`: Set `base: '/testforge/'`
- `package.json` scripts: `dev`, `build`, `preview`, `deploy` (using `gh-pages -d dist`)
- `404.html` in public: GitHub Pages SPA redirect hack (redirect all paths to index.html with path preserved in query string)
- Tailwind config: Include custom fonts, extend theme colors with the accent palette defined above
- `index.html`: Include Google Fonts link for Plus Jakarta Sans and JetBrains Mono. Include proper meta tags and Open Graph tags.

### Phase 1 Deliverables Checklist

- [ ] `npm run dev` starts without errors
- [ ] Landing page renders all 10 sections with no broken layouts
- [ ] All landing page section links scroll smoothly to their targets (no 404s)
- [ ] Terminal animation in hero loops realistically
- [ ] "See Live Demo" navigates to `/#/demo` and shows dashboard with demo data
- [ ] Pricing toggle switches between monthly and annual
- [ ] Architecture diagram is interactive (hover tooltips)
- [ ] Mobile responsive on all sections (test 375px, 390px, 414px viewports)
- [ ] `npm run build` succeeds with no TypeScript errors
- [ ] `npm run deploy` pushes to GitHub Pages
- [ ] All fonts load correctly (Plus Jakarta Sans, JetBrains Mono)
- [ ] No console errors or warnings

---

## PHASE 2: Supabase Backend + Authentication + Dashboard

### Goal
Real database schema, real authentication, real multi-tenant data. The dashboard should work with both demo data and live Supabase data.

### 2.1 Supabase Database Schema

Create migration files in `supabase/migrations/`. These are the SQL files that define the complete schema.

#### Migration 001: Organizations

```sql
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    plan TEXT NOT NULL DEFAULT 'starter' CHECK (plan IN ('starter', 'professional', 'enterprise')),
    device_limit INTEGER NOT NULL DEFAULT 10,
    user_limit INTEGER NOT NULL DEFAULT 5,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_org_slug ON organizations(slug);
```

#### Migration 002: Profiles

```sql
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    full_name TEXT,
    role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_profiles_org ON profiles(organization_id);
```

#### Migration 003: Devices

```sql
CREATE TABLE devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    serial_number TEXT,
    device_type TEXT,
    firmware_version TEXT,
    status TEXT NOT NULL DEFAULT 'offline' CHECK (status IN ('online', 'offline', 'testing', 'maintenance', 'flashing')),
    connection_type TEXT CHECK (connection_type IN ('usb', 'wifi', 'uart', 'ssh', 'adb')),
    carrier TEXT,
    battery_level INTEGER,
    last_heartbeat TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_devices_org ON devices(organization_id);
CREATE INDEX idx_devices_status ON devices(status);
CREATE UNIQUE INDEX idx_devices_serial ON devices(organization_id, serial_number) WHERE serial_number IS NOT NULL;
```

#### Migration 004: Test Suites

```sql
CREATE TABLE test_suites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT CHECK (category IN ('smoke', 'regression', 'stress', 'qualification', 'validation', 'custom')),
    estimated_duration_seconds INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_suites_org ON test_suites(organization_id);
```

#### Migration 005: Test Runs

```sql
CREATE TABLE test_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    suite_id UUID REFERENCES test_suites(id),
    device_id UUID REFERENCES devices(id),
    status TEXT NOT NULL DEFAULT 'running' CHECK (status IN ('queued', 'running', 'passed', 'failed', 'error', 'aborted')),
    total_tests INTEGER NOT NULL DEFAULT 0,
    passed INTEGER NOT NULL DEFAULT 0,
    failed INTEGER NOT NULL DEFAULT 0,
    skipped INTEGER NOT NULL DEFAULT 0,
    error INTEGER NOT NULL DEFAULT 0,
    duration_seconds INTEGER,
    firmware_version TEXT,
    build_number TEXT,
    branch TEXT,
    trigger_type TEXT CHECK (trigger_type IN ('manual', 'scheduled', 'ci', 'webhook')),
    started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    completed_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}'
);

CREATE INDEX idx_runs_org ON test_runs(organization_id);
CREATE INDEX idx_runs_status ON test_runs(status);
CREATE INDEX idx_runs_started ON test_runs(started_at DESC);
CREATE INDEX idx_runs_suite ON test_runs(suite_id);
CREATE INDEX idx_runs_device ON test_runs(device_id);
```

#### Migration 006: Test Results (individual test cases)

```sql
CREATE TABLE test_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    test_run_id UUID NOT NULL REFERENCES test_runs(id) ON DELETE CASCADE,
    test_name TEXT NOT NULL,
    test_class TEXT,
    status TEXT NOT NULL CHECK (status IN ('passed', 'failed', 'skipped', 'error')),
    duration_ms INTEGER,
    error_message TEXT,
    stack_trace TEXT,
    retry_count INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_results_run ON test_results(test_run_id);
CREATE INDEX idx_results_org ON test_results(organization_id);
CREATE INDEX idx_results_status ON test_results(status);
```

#### Migration 007: Crashes

```sql
CREATE TABLE crashes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    fingerprint TEXT NOT NULL,
    title TEXT NOT NULL,
    severity TEXT NOT NULL DEFAULT 'medium' CHECK (severity IN ('critical', 'high', 'medium', 'low')),
    status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'investigating', 'resolved', 'ignored', 'wont_fix')),
    category TEXT CHECK (category IN ('kernel_panic', 'anr', 'native_crash', 'java_exception', 'watchdog', 'modem', 'assertion', 'oom', 'other')),
    stack_trace TEXT,
    occurrence_count INTEGER NOT NULL DEFAULT 1,
    affected_devices TEXT[] DEFAULT '{}',
    assigned_team TEXT,
    ai_analysis TEXT,
    jira_ticket TEXT,
    first_seen TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_seen TIMESTAMPTZ NOT NULL DEFAULT now(),
    resolved_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}'
);

CREATE INDEX idx_crashes_org ON crashes(organization_id);
CREATE INDEX idx_crashes_fingerprint ON crashes(organization_id, fingerprint);
CREATE INDEX idx_crashes_severity ON crashes(severity);
CREATE INDEX idx_crashes_status ON crashes(status);
```

#### Migration 008: API Keys

```sql
CREATE TABLE api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    key_hash TEXT NOT NULL,
    key_prefix TEXT NOT NULL,
    permissions TEXT[] NOT NULL DEFAULT '{read}',
    last_used_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_api_keys_org ON api_keys(organization_id);
CREATE INDEX idx_api_keys_hash ON api_keys(key_hash);
```

#### Migration 009: Alerts

```sql
CREATE TABLE alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('device_offline', 'pass_rate_drop', 'new_crash', 'device_health', 'quota_warning')),
    severity TEXT NOT NULL DEFAULT 'info' CHECK (severity IN ('critical', 'warning', 'info')),
    title TEXT NOT NULL,
    message TEXT,
    is_read BOOLEAN NOT NULL DEFAULT false,
    related_entity_type TEXT,
    related_entity_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_alerts_org ON alerts(organization_id);
CREATE INDEX idx_alerts_unread ON alerts(organization_id, is_read) WHERE NOT is_read;
```

#### Migration 010: Row Level Security

```sql
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_suites ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE crashes ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

-- Users can only see data from their own organization
CREATE POLICY "Users see own org" ON organizations
    FOR SELECT USING (id IN (
        SELECT organization_id FROM profiles WHERE id = auth.uid()
    ));

CREATE POLICY "Users see own profile" ON profiles
    FOR ALL USING (id = auth.uid());

CREATE POLICY "Users see org profiles" ON profiles
    FOR SELECT USING (organization_id IN (
        SELECT organization_id FROM profiles WHERE id = auth.uid()
    ));

-- Apply org-scoped policies to all data tables
DO $$
DECLARE
    tbl TEXT;
BEGIN
    FOR tbl IN SELECT unnest(ARRAY['devices', 'test_suites', 'test_runs', 'test_results', 'crashes', 'api_keys', 'alerts'])
    LOOP
        EXECUTE format('
            CREATE POLICY "Org members can select" ON %I
                FOR SELECT USING (organization_id IN (
                    SELECT organization_id FROM profiles WHERE id = auth.uid()
                ));
            CREATE POLICY "Org members can insert" ON %I
                FOR INSERT WITH CHECK (organization_id IN (
                    SELECT organization_id FROM profiles WHERE id = auth.uid()
                ));
            CREATE POLICY "Org members can update" ON %I
                FOR UPDATE USING (organization_id IN (
                    SELECT organization_id FROM profiles WHERE id = auth.uid()
                ));
        ', tbl, tbl, tbl);
    END LOOP;
END $$;
```

#### Migration 011: Functions

```sql
-- Function to create org + profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    new_org_id UUID;
    org_slug TEXT;
BEGIN
    org_slug := lower(replace(COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)), ' ', '-')) || '-' || substr(gen_random_uuid()::text, 1, 8);

    INSERT INTO organizations (name, slug)
    VALUES (COALESCE(NEW.raw_user_meta_data->>'company', split_part(NEW.email, '@', 1) || '''s Team'), org_slug)
    RETURNING id INTO new_org_id;

    INSERT INTO profiles (id, organization_id, full_name, role)
    VALUES (NEW.id, new_org_id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''), 'owner');

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to get dashboard stats
CREATE OR REPLACE FUNCTION get_dashboard_stats(org_uuid UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total_runs_7d', (SELECT COUNT(*) FROM test_runs WHERE organization_id = org_uuid AND started_at > now() - interval '7 days'),
        'pass_rate_7d', (SELECT ROUND(AVG(CASE WHEN status = 'passed' THEN 100.0 ELSE 0 END), 1) FROM test_runs WHERE organization_id = org_uuid AND started_at > now() - interval '7 days' AND status IN ('passed', 'failed')),
        'active_devices', (SELECT COUNT(*) FROM devices WHERE organization_id = org_uuid AND status IN ('online', 'testing')),
        'open_crashes', (SELECT COUNT(*) FROM crashes WHERE organization_id = org_uuid AND status IN ('new', 'investigating'))
    ) INTO result;
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 2.2 Authentication

- Supabase Auth with email/password and Google OAuth
- On signup: trigger creates organization + profile automatically
- Login redirects to `/#/app/dashboard`
- Protected routes redirect to `/#/login` if not authenticated
- Auth state managed via `AuthContext` with `useAuth()` hook

### 2.3 Dashboard Pages (Connected to Supabase)

All dashboard pages should work in two modes:
1. **Demo mode** (`/#/demo/*`): Uses `demo-data.ts`, no auth required
2. **App mode** (`/#/app/*`): Uses Supabase, auth required

The `DataContext` handles this switching. Components don't care where data comes from.

**Dashboard page**: 4 KPI cards (total runs, pass rate, active devices, open crashes) + pass/fail trend chart (30 days) + failure category donut + recent runs table + alerts feed

**Test Runs page**: Sortable/filterable table of all test runs. Click a run to see individual test results. Filter by status, suite, device, date range, branch.

**Devices page**: Grid of device cards showing status, firmware, last heartbeat, battery. Color-coded by status. Click for device detail with test history and health metrics.

**Crash Triage page**: List of crashes sorted by severity and occurrence count. Click for detail view with stack trace, AI analysis, affected devices, occurrence timeline. Actions: assign team, change status, link Jira ticket.

**Log Explorer page**: Searchable, filterable log viewer. Filter by device, severity, time range, keyword. Syntax highlighting for common log formats.

**Reports page**: Weekly summary cards with key metrics. Generate on-demand reports. Show trends week-over-week.

**Settings page**: Organization settings, team management (invite users), API key management (generate, revoke, copy), integration settings (Jira URL, Slack webhook URL), plan/billing info.

### Phase 2 Deliverables Checklist

- [ ] All 11 migration files are valid SQL
- [ ] Migrations can be applied to a fresh Supabase project without errors
- [ ] Signup creates organization + profile via trigger
- [ ] Login/logout works correctly
- [ ] Dashboard shows data from Supabase when configured
- [ ] Dashboard shows demo data when Supabase is not configured
- [ ] Demo mode accessible at `/#/demo` without authentication
- [ ] All dashboard pages render with proper data
- [ ] Device health grid shows correct status colors
- [ ] Crash triage shows AI analysis and actions work
- [ ] Settings page shows API key management
- [ ] RLS policies prevent cross-org data access

---

## PHASE 3: API, Reporter Script, Setup Guide, API Docs

### Goal
The integration layer that makes TestForge actually usable. A Python script that teams can run to push test results, and documentation that shows exactly how to integrate.

### 3.1 REST API Endpoints (via Supabase)

Supabase auto-generates REST endpoints for all tables. Document these with examples. The key endpoints teams will use:

```
POST /rest/v1/test_runs          — Create a new test run
POST /rest/v1/test_results       — Push individual test results
POST /rest/v1/devices            — Register a device
PATCH /rest/v1/devices?id=eq.{id} — Update device status/heartbeat
POST /rest/v1/crashes            — Report a crash
GET /rest/v1/test_runs?order=started_at.desc&limit=50 — Query runs
```

All requests require the `apikey` header (Supabase anon key) and the `Authorization` header (user JWT or API key).

### 3.2 Python Reporter Script

Create `scripts/testforge_reporter.py` — a standalone Python script (no pip dependencies beyond `requests`) that:

1. Parses JUnit XML test results (the universal format)
2. Creates a test run in TestForge
3. Pushes individual test results
4. Detects crashes from failure messages and reports them
5. Updates device heartbeat

Usage:
```bash
# Push JUnit XML results
python testforge_reporter.py \
    --url https://your-project.supabase.co \
    --api-key tf_xxxxxxxxxxxx \
    --junit-xml results.xml \
    --device-name PX8P-001 \
    --suite-name post-flash-smoke \
    --firmware-version v3.2.1 \
    --build-number 4521

# Push a single result
python testforge_reporter.py \
    --url https://your-project.supabase.co \
    --api-key tf_xxxxxxxxxxxx \
    --test-name "test_suspend_resume" \
    --status passed \
    --duration 12500 \
    --device-name PX8P-001

# Update device heartbeat
python testforge_reporter.py \
    --url https://your-project.supabase.co \
    --api-key tf_xxxxxxxxxxxx \
    --heartbeat \
    --device-name PX8P-001 \
    --firmware-version v3.2.1 \
    --battery-level 87
```

The script should be copy-paste ready. A test engineer should be able to download it, set two environment variables, and start pushing data in 5 minutes.

### 3.3 Setup Guide Page (`/#/docs/setup`)

A public page (no auth required) that walks through integration step by step. Four paths:

1. **Android Device Testing** (ADB + pytest/Robot Framework)
2. **Embedded/Firmware Testing** (UART/SSH + custom scripts)
3. **CI/CD Pipeline** (GitHub Actions/Jenkins/GitLab CI)
4. **Web/API Testing** (Playwright/Cypress/Jest)

Each path shows:
- Architecture diagram of how data flows from their setup to TestForge
- Step-by-step integration instructions with real code snippets
- How to verify it's working

### 3.4 API Documentation Page (`/#/docs/api`)

Comprehensive API docs with:
- Authentication section (how to get and use API keys)
- Every endpoint with method, URL, request body, response body
- cURL examples for every endpoint
- Python examples using requests
- Error codes and troubleshooting
- Rate limits
- Webhook configuration for incoming data

Clean light theme matching the rest of the site, left sidebar navigation, code blocks with copy buttons and syntax highlighting on a light gray background.

### 3.5 Installer Script

Create `scripts/install.sh` — a setup script that teams can run on their own servers (Ubuntu/Debian) to install the TestForge Agent. This is both a real tool AND a demonstration of professionalism in the pitch.

```bash
#!/bin/bash
# TestForge Agent Installer
# Usage: curl -fsSL https://get.testforge.dev/install.sh | bash

set -euo pipefail

echo "╔══════════════════════════════════════╗"
echo "║     TestForge Agent Installer        ║"
echo "║     v1.0.0                           ║"
echo "╚══════════════════════════════════════╝"
echo ""

# Check prerequisites
check_prereqs() {
    echo "Checking prerequisites..."
    command -v python3 >/dev/null 2>&1 || { echo "❌ Python 3 is required"; exit 1; }
    command -v pip3 >/dev/null 2>&1 || { echo "❌ pip3 is required"; exit 1; }
    echo "✓ Prerequisites met"
}

# Create testforge directory structure
setup_dirs() {
    echo "Setting up directories..."
    sudo mkdir -p /opt/testforge/{agent,logs,config}
    sudo chown -R $USER:$USER /opt/testforge
    echo "✓ Directories created"
}

# Install Python dependencies
install_deps() {
    echo "Installing dependencies..."
    pip3 install requests psutil watchdog --quiet
    echo "✓ Dependencies installed"
}

# Copy agent files
install_agent() {
    echo "Installing TestForge Agent..."
    # Download agent script
    curl -fsSL https://raw.githubusercontent.com/candanumut/testforge/main/scripts/testforge_agent.py \
        -o /opt/testforge/agent/testforge_agent.py
    curl -fsSL https://raw.githubusercontent.com/candanumut/testforge/main/scripts/testforge_reporter.py \
        -o /opt/testforge/agent/testforge_reporter.py
    chmod +x /opt/testforge/agent/*.py
    echo "✓ Agent installed"
}

# Configure
configure() {
    echo ""
    read -p "Enter your TestForge API URL: " api_url
    read -p "Enter your TestForge API Key: " api_key
    
    cat > /opt/testforge/config/agent.conf << EOF
[testforge]
api_url = ${api_url}
api_key = ${api_key}
heartbeat_interval = 300
log_level = INFO
EOF
    echo "✓ Configuration saved"
}

# Create systemd service
create_service() {
    echo "Creating systemd service..."
    sudo tee /etc/systemd/system/testforge-agent.service > /dev/null << EOF
[Unit]
Description=TestForge Agent
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=/opt/testforge/agent
ExecStart=/usr/bin/python3 /opt/testforge/agent/testforge_agent.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF
    sudo systemctl daemon-reload
    sudo systemctl enable testforge-agent
    echo "✓ Service created"
}

# Run
check_prereqs
setup_dirs
install_deps
install_agent
configure
create_service

echo ""
echo "╔══════════════════════════════════════╗"
echo "║  ✓ TestForge Agent installed!        ║"
echo "║                                      ║"
echo "║  Start:  sudo systemctl start        ║"
echo "║          testforge-agent             ║"
echo "║  Status: sudo systemctl status       ║"
echo "║          testforge-agent             ║"
echo "║  Logs:   journalctl -u              ║"
echo "║          testforge-agent -f          ║"
echo "╚══════════════════════════════════════╝"
```

Also create a companion `scripts/testforge_agent.py` that:
- Runs as a background daemon on the test server
- Sends device heartbeats to TestForge at configured intervals
- Watches for new test result files (JUnit XML) in a configured directory and auto-pushes them
- Monitors connected devices (via ADB, fastboot, or SSH) and reports status changes
- Streams crash detection from log patterns
- Has clean logging to `/opt/testforge/logs/`

This agent doesn't need to be fully production-hardened yet — but it needs to work end-to-end as a proof of concept. A test engineer should be able to run the installer, configure their API key, and see device heartbeats appear in the TestForge dashboard within 5 minutes.

### Phase 3 Deliverables Checklist

- [ ] `testforge_reporter.py` works end-to-end with a real Supabase instance
- [ ] JUnit XML parsing produces correct test runs and results
- [ ] Device heartbeat updates work
- [ ] Crash detection from failure messages works
- [ ] Setup Guide page renders with all 4 integration paths
- [ ] API Docs page has complete endpoint documentation
- [ ] All code examples are copy-paste functional
- [ ] Script has `--help` with clear usage instructions
- [ ] `install.sh` runs successfully on Ubuntu 22.04+
- [ ] `testforge_agent.py` sends heartbeats and auto-pushes results
- [ ] Agent creates proper systemd service

---

## PHASE 4: Cron Jobs, Automated Alerts, Operations

### Goal
The automated background processes that make TestForge proactive, not just reactive.

### 4.1 Supabase Edge Functions (Cron Jobs)

Create Edge Functions for:

**1. Device Health Monitor** (runs every 5 minutes)
- Check all devices with `last_heartbeat` older than configured threshold (default: 30 min)
- If a device goes from online → stale heartbeat: create alert, set status to `offline`
- If a device comes back: clear alert, set status to `online`

**2. Pass Rate Monitor** (runs every 15 minutes)
- Calculate pass rate for each org over the last 24 hours
- If pass rate drops below configured threshold (default: 80%): create alert
- If pass rate drops below critical threshold (default: 60%): create critical alert

**3. Crash Deduplication** (runs on new crash insert, via trigger)
- When a new crash is reported, compute fingerprint from stack trace
- If fingerprint matches existing crash: increment occurrence_count, update last_seen, add device to affected_devices
- If new fingerprint: create new crash entry

**4. Weekly Report Generator** (runs every Monday at 6am UTC)
- Generate weekly summary for each org
- Store as JSON in a `reports` table (or send via configured channel)
- Include: total runs, pass rate trend, new crashes, resolved crashes, device health summary

### 4.2 Jira Integration (Edge Function)

Create an Edge Function that auto-creates Jira tickets:
- Triggered when a crash reaches `occurrence_count >= 3` and has no `jira_ticket`
- Uses Jira REST API with org-configured credentials
- Creates ticket with: crash title, severity mapping, stack trace in description, link back to TestForge
- Stores Jira ticket ID in the crash record

### 4.3 Slack Integration (Edge Function)

Create an Edge Function for Slack notifications:
- Sends to org-configured webhook URL
- Triggers: new critical crash, device offline, pass rate drop, weekly summary
- Format messages as Slack Block Kit for rich formatting

### Phase 4 Deliverables Checklist

- [ ] Device health monitor edge function works and creates alerts
- [ ] Pass rate monitor edge function works
- [ ] Crash deduplication works on insert
- [ ] Weekly report generator produces correct summaries
- [ ] Jira ticket creation works with test Jira instance
- [ ] Slack notifications send correctly formatted messages
- [ ] All edge functions have error handling and logging

---

## PHASE 5: Polish, Performance, and Launch Prep

### 5.1 Visual Polish
- Consistent dark theme across all pages
- Loading states (skeleton screens, not spinners) for all data-fetching components
- Empty states with helpful setup instructions
- Error states with retry buttons
- Smooth page transitions
- Mobile responsive audit on all pages (375px, 390px, 414px)

### 5.2 Performance
- Virtualize long lists (test results, logs) using `react-window` or `@tanstack/react-virtual`
- `useMemo` for expensive calculations (pass rate trends, chart data)
- Debounce search inputs (300ms)
- Lazy load dashboard pages with `React.lazy` + `Suspense`

### 5.3 SEO & Meta
```html
<title>TestForge — Lab Operations Platform for Test Teams</title>
<meta name="description" content="Device health, test results, crash triage, and operations management. One platform for hardware, firmware, and software test teams.">
<meta property="og:title" content="TestForge — Your test lab. Under control.">
<meta property="og:description" content="Device health, test results, crash triage, and operations management for hardware test teams.">
<meta property="og:type" content="website">
<meta property="og:url" content="https://candanumut.github.io/testforge/">
```

### 5.4 README.md
Write a comprehensive README covering:
- What TestForge is (2-3 sentences)
- Screenshot of the dashboard
- Quick start (5 steps to push your first test result)
- Local development setup
- Supabase setup instructions
- Environment variables
- Deployment to GitHub Pages
- Architecture overview
- Contributing guidelines
- License (MIT)

### 5.5 Legal Prep Checklist (not code)
- [ ] Terms of Service page (placeholder)
- [ ] Privacy Policy page (placeholder)
- [ ] Cookie consent banner
- [ ] DPA (Data Processing Agreement) template for Enterprise tier

### Phase 5 Deliverables Checklist

- [ ] All pages are visually consistent
- [ ] No layout breaks on mobile
- [ ] Loading/empty/error states on all data components
- [ ] Performance: dashboard loads in < 2 seconds with 90 days of data
- [ ] README is comprehensive and accurate
- [ ] OG meta tags work (test with social media debugger tools)
- [ ] No console errors or warnings in production build

---

## Implementation Order

**Build in this exact order. Do not skip ahead. Read existing code first before each phase.**

1. Phase 1: Upgrade landing page design (bright/Apple aesthetic), fix routing, update messaging, improve demo data — deploy to GitHub Pages
2. Phase 2: Supabase schema (apply migrations), auth, dashboard pages connected to real data
3. Phase 3: Python reporter, agent, installer script, setup guide, API docs
4. Phase 4: Edge functions, cron jobs, Jira/Slack integrations
5. Phase 5: Polish, performance, launch prep

**After each phase, verify:**
- `npm run dev` starts without errors
- `npm run build` succeeds with no TypeScript errors
- All new pages/features work in both demo and app mode
- No console errors
- Mobile responsive
- The landing page looks like it was designed by a real design team, not generated by AI

---

## What Success Looks Like

When this is done, Umut should be able to:

1. Open `candanumut.github.io/testforge/` on his phone and show someone a landing page that looks like it belongs to a well-funded startup — clean, bright, confident, Apple-level polish
2. Explain the AI era problem clearly: "Developers ship faster than ever with AI. QA teams are drowning. We fix that."
3. Click "See Live Demo" and walk through a realistic dashboard with 47 devices, 90 days of test history, and 23 crashes with AI triage analysis
4. Show the two-tier model: "Start with the dashboard subscription, upgrade to full pipeline management when you're ready"
5. Show the Setup Guide and say "you can integrate in 5 minutes — here's the installer script"
6. Run the installer on a server and show device heartbeats appearing in the dashboard within minutes
7. Show automated crash deduplication, Jira ticket creation, and Slack alerts
8. Walk into a meeting with a startup founder and pitch TestForge as a real, working product — not a mockup, not a demo, a product that teams can start using today

**The landing page is the pitch deck. The demo is the proof. The installer is the confidence builder. All three must be flawless.**

**This is not a portfolio project. This is the first version of a real company. Build it accordingly.**
