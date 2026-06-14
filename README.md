# TestForge

**Mission control for your test lab.**

TestForge is the operations and observability platform for hardware, firmware, and device test labs. It unifies device health, test orchestration, and agentic crash triage into one real-time control plane — so quality keeps pace with AI-era development velocity. Your devices, your data.

Unlike cloud device farms (BrowserStack, Sauce Labs) it manages the physical lab you already own, and unlike heavy HIL rigs (NI, dSPACE) it is a lightweight software layer that connects to the test framework you already run. See [`MARKET_RESEARCH.md`](./MARKET_RESEARCH.md) for the full positioning and competitive analysis.

Built by [Umut Candan](https://github.com/candanumut) — 6 years of test automation experience at Samsung Semiconductor.

## Live Demo

Visit [candanumut.github.io/testforge](https://candanumut.github.io/testforge/) to see the platform.

Click **"See Live Demo"** on the landing page to explore the full dashboard with realistic test data — no sign-in required.

## Tech Stack

- **Frontend**: Vite + React + TypeScript
- **Styling**: Tailwind CSS v3
- **Backend**: Supabase (PostgreSQL + Auth + Row Level Security)
- **Charts**: Recharts
- **Icons**: Lucide React
- **Routing**: React Router v6 (HashRouter for GitHub Pages)
- **Deployment**: GitHub Pages via `gh-pages`

## Development

```bash
npm install
npm run dev       # dev server
npm run build     # production build
npm run deploy    # build + push to GitHub Pages
```

## Supabase Setup

1. Create a project at [supabase.com](https://supabase.com)
2. Run migrations in order: `supabase/migrations/001_*.sql` → `011_*.sql`
3. Copy `.env.example` to `.env.local` and fill in credentials

Without Supabase credentials the app runs in **Demo Mode** using in-memory seed data.



## Project Structure

```
src/
├── lib/           Supabase client + TypeScript interfaces
├── hooks/         Data-fetching hooks
├── contexts/      AuthContext with demo mode support
├── pages/         Route-level components (Landing, Dashboard, etc.)
├── components/    landing/, dashboard/, triage/, layout/, common/
└── utils/         Seed data, formatters, constants
supabase/
└── migrations/    11 production-ready SQL migrations with RLS
```

---

© 2026 TestForge. Built by Umut Candan.
