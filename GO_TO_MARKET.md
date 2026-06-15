# TestForge — Go-To-Market Playbook

How to position, market, and sell TestForge. Built on
[`MARKET_RESEARCH.md`](./MARKET_RESEARCH.md); pairs with
[`PRODUCT_READINESS.md`](./PRODUCT_READINESS.md) and [`SECURITY.md`](./SECURITY.md).

---

## 1. One-liner & category

**Category:** Test lab operations & observability platform.
**One-liner:** *Mission control for your test lab.*

> For hardware, firmware, and device teams whose labs run on spreadsheets, Slack,
> and tribal knowledge, TestForge unifies device health, test orchestration, and
> agentic crash triage into one real-time control plane — so quality keeps pace
> with AI-era development velocity. Your devices, your data, your lab.

We are **not** a cloud device farm (BrowserStack/Sauce) and **not** a six-figure
HIL rig (NI/dSPACE). We are the lightweight software layer over the lab you
already own.

## 2. Ideal customer profile (ICP)

**Primary:** In-house hardware/firmware/embedded/IoT test labs with **20–500
physical devices** and a 3–30 person QA/test-automation team, shipping firmware
on a nightly/CI cadence.

**Verticals:** consumer electronics, mobile/handset, semiconductor validation,
IoT/smart-home, wearables, automotive components, robotics/drones.

**Buyer & champions:**
- **Champion:** Test Automation Lead / SDET / Lab Manager (feels the daily pain).
- **Economic buyer:** QA Director / Eng Manager / VP Engineering.
- **Influencers:** Firmware leads, DevOps/CI owners; **Security/IT** for data review.

**Qualifying signals (good fit):** physical device lab; nightly firmware/regression
runs; manual crash triage; device inventory in a spreadsheet; "we don't know what's
online"; NDA/pre-release hardware; AI-accelerated code volume outpacing QA.

**Disqualifiers:** pure web/mobile-app testing (point them to cloud farms); no
physical devices; needs full real-time HIL simulation.

## 3. Why now (the wedge)

AI writes code faster than QA can test it; the bottleneck is **signal-to-noise**,
not execution. Teams are buried in flaky failures, duplicate crashes, and unknown
device state. TestForge turns lab noise into a prioritized signal. This is the
dominant 2026 narrative — lead with it.

## 4. Value propositions (by persona)

| Persona | Pain | TestForge value | Proof |
|---|---|---|---|
| Test/Automation Lead | Manual triage every Monday; flaky noise | Auto crash fingerprinting + dedup; one control plane | Crash Triage demo; reporter setup in minutes |
| QA Director / EM | No visibility; regressions found late | Real-time pass-rate trends, alerts, weekly reports | Dashboard demo; trend charts |
| Lab Manager | Devices lost in drawers/old firmware | Live device health, heartbeat, inventory | Devices page; agent heartbeats |
| Security / IT | Pre-release data, NDAs | Tenant isolation, hashed keys, audit trail, on-prem | `/trust`, `SECURITY.md` |

## 5. Packaging & pricing

| Plan | Price | For | Limits |
|---|---|---|---|
| **Starter** | $199/mo ($159 annual) | Small labs getting visibility | ≤10 devices, 5 users |
| **Professional** | $499/mo ($399 annual) | Scaling labs, AI triage, integrations | ≤50 devices, 15 users |
| **Enterprise** | Custom | On-prem, SSO, dedicated support | Unlimited |
| **TestForge Pipeline** | $5K–$25K setup + $2K–$10K/mo | Done-for-you flashing→reporting automation | Scoped per engagement |

Priced **per-lab/device**, not per-seat — friendlier to hardware teams where many
engineers share a small fleet. 14-day free trial, no credit card. Land with
Dashboard, expand to Pipeline.

## 6. Sales motion

**Motion:** Product-led top of funnel (self-serve demo + trial) → sales-assisted
for Pro/Enterprise. Bottom-up champion adoption, top-down close.

**Funnel:**
1. **Demo** (`/demo`, no signup) — instant "aha."
2. **Trial** — connect first reporter in <30 min (Setup Guide).
3. **Activation** = first real run + device heartbeat visible (see metrics).
4. **Expansion** — more devices/suites; Slack/Jira; then Pipeline or Enterprise.

**Sales cycle:** Starter/Pro self-serve to weeks; Enterprise 1–3 months
(security review is the gate — `/trust` + `SECURITY.md` shorten it).

## 7. Channels

- **Founder-led outreach** to ICP test leads (LinkedIn, email) — see templates §10.
- **Content/SEO:** "test lab operations," "firmware CI dashboard," "crash triage
  automation," "BrowserStack alternative for hardware," "device lab management."
  The practitioner story (6 yrs Samsung) is the differentiator — write from it.
- **Communities:** r/embedded, Hacker News (Show HN), embedded/QA Slacks &
  Discords, EE/test conferences (DVCon, embedded world).
- **Open-source pull:** reporter + agent scripts are public → top-of-funnel.
- **Partnerships/referrals:** test consultancies, contract manufacturers, labs.

## 8. Positioning vs alternatives (sales talk track)

- **vs BrowserStack/Sauce:** "Those rent *their* cloud phones for web/mobile apps.
  They can't touch your custom hardware or pre-release firmware. We run your lab."
- **vs NI/dSPACE:** "Those are powerful but heavy and integrator-led. We're a
  software layer over what you already run — live in minutes, not months."
- **vs spreadsheets/scripts:** "Free to start, impossible to scale, invisible
  until something breaks. We make the lab a shared, real-time control plane."

## 9. Launch plan (first 90 days)

**Days 0–30 — Foundation**
- Deploy live (migrations + ingest fn); run `scripts/smoke_ingest.py`.
- Recruit 3–5 **design partners** from network for free/discounted Pro.
- Stand up analytics (demo clicks, trial starts, activation) + a waitlist/contact.
- Replace representative testimonials with named design-partner quotes as they land.

**Days 30–60 — Proof**
- Ship 2–3 case studies / before-after metrics (triage time, regressions caught).
- Content: 4–6 SEO posts from the messaging pillars; one "Show HN" / launch post.
- Add a 60–90s product demo video/GIF above the fold.

**Days 60–90 — Scale**
- Outbound to 100–200 ICP accounts with templates (§10); weekly cohort review.
- First Enterprise security reviews using `/trust` + `SECURITY.md`.
- Iterate pricing/packaging from real trial→paid conversion data.

## 10. Outreach templates

**Cold email (test lead):**
> Subject: your lab's nightly crash triage
>
> Hi {name} — quick one. Most {vertical} test teams I talk to still track devices
> in a spreadsheet and hand-triage crashes every Monday. TestForge gives you one
> live view of device health, runs, and auto-deduplicated crashes — connects to
> your existing pytest/Robot/JUnit setup in under 30 minutes, your devices and
> data stay yours. Worth a 15-min look? There's a no-signup demo: {link}

**LinkedIn (short):**
> Built TestForge after 6 years automating hardware test at Samsung — the
> operations layer I always wished existed: device health + orchestration +
> agentic crash triage over the lab you already own. No-signup demo: {link}

**Show HN angle:** "Show HN: TestForge — mission control for in-house hardware
test labs (not a cloud device farm)."

## 11. Objection handling

| Objection | Response |
|---|---|
| "We already have BrowserStack." | Different layer — that's cloud web/mobile; we manage your *physical* lab and firmware. Complementary. |
| "Security — this is pre-release HW." | Tenant isolation (RLS), hashed/revocable keys, audit trail, on-prem option, no model training. See `/trust`. |
| "We have scripts already." | Keep them — push results via the reporter in minutes; we replace the chaos around them, not the framework. |
| "Too early / no budget." | Start on the demo + free trial; land at $199 on the devices you have today. |
| "Will it fit our framework?" | JUnit XML, pytest, Robot, custom + REST. If it emits results, we ingest them. |

## 12. Metrics that matter (instrument these)

- **TOFU:** demo opens, demo→trial rate, signups.
- **Activation:** % trials with first real run + heartbeat within 24h (north star).
- **Value:** crash triage time saved; regressions caught pre-release; devices tracked.
- **Revenue:** trial→paid, ARPA, device/seat expansion, Pipeline attach rate.
- **Retention:** weekly active labs, runs/week, logo & net-revenue retention.

## 13. Marketing asset checklist

- [x] Positioned landing page (hero, differentiation, security strip, FAQ)
- [x] Trust & Security page + `SECURITY.md`
- [x] Social share image (`public/og-image.png`)
- [x] Accurate API docs + Setup Guide
- [ ] Named testimonials + logo wall (post design partners)
- [ ] Demo video / GIF above the fold
- [ ] 4–6 SEO blog posts from the messaging pillars
- [ ] Case studies (before/after metrics)
- [ ] Analytics + funnel instrumentation
- [ ] Sales one-pager / pitch deck (PDF)
