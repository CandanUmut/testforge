# TestForge

**Test infrastructure that runs itself.**

TestForge is a universal test automation platform that provides companies with automated test infrastructure, crash triage, log parsing, dashboards, and reporting as a managed service.

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
