# Engineering Copilot — TODO

> **How to use this file:**
> At the start of every session, read this file to know the project state.
> At the end of every session, update it with what was done and what's next.
> Commit this file with every PR so it stays in sync with the code.

---

## Current Status
**Branch:** `chore/initial-scaffold`
**Last updated:** 2026-06-26
**App state:** Scaffold complete — `npm run dev` not yet verified working

---

## ✅ Done (Session 1 — 2026-06-26)

### Monorepo foundation
- [x] Turborepo workspace (`package.json`, `turbo.json`, `tsconfig.base.json`)
- [x] `.gitignore`, `.prettierrc.json`, `LICENSE` (MIT)
- [x] `README.md` — launch-ready with badges, quickstart, phase table
- [x] `CONTRIBUTING.md` — "edit one phase file" contribution model
- [x] `.github/workflows/ci.yml` — lint + type-check + test
- [x] `.github/ISSUE_TEMPLATE/` — bug report + phase improvement templates

### packages/types
- [x] All shared TypeScript types: `Review`, `PhaseResult`, `ImplementationOption`, `ReviewSection`, all API payload shapes

### packages/db
- [x] Full Prisma schema — `User`, `Account`, `Session`, `VerificationToken`, `Review`, `ReviewPhase`, `ReviewOption`, `ReviewSection`, `ReviewExport`
- [x] All enums: `ReviewStatus`, `PhaseStatus`, `ExportFormat`
- [x] Prisma client singleton (`src/index.ts`)

### packages/prompt-engine
- [x] All 10 phase files (`01-context.ts` → `10-canary-plan.ts`)
- [x] `providers.ts` — Anthropic, OpenAI, Google, Ollama adapters (Vercel AI SDK)
- [x] `options-generator.ts` — structured output (Zod schema), 2–3 impl. options
- [x] `sections-generator.ts` — 28-section generator (AsyncGenerator)
- [x] `index.ts` — `runAllPhases()` orchestrator + public API

### apps/web
- [x] `next.config.js`, `tailwind.config.js`, `postcss.config.js`, `tsconfig.json`
- [x] `auth.ts` — NextAuth v5 (GitHub + Google OAuth, Prisma adapter)
- [x] `app/globals.css` — full design system (tokens, glass, animations, streaming cursor)
- [x] `app/layout.tsx` — Inter font, dark mode, SessionProvider, SEO metadata
- [x] `app/page.tsx` — landing page (hero, 10-phase grid, feature callouts)
- [x] `app/(auth)/login/page.tsx` — GitHub + Google sign-in
- [x] `app/(dashboard)/dashboard/page.tsx` — review list with status badges
- [x] `app/review/new/page.tsx` — ticket input form (text/URL tabs, provider picker)
- [x] `app/review/[id]/page.tsx` + `ReviewDetailClient.tsx` — streaming review view
- [x] `components/PhaseStream.tsx` — collapsible phase cards, live streaming
- [x] `components/OptionPicker.tsx` — 3-option cards, approve gate
- [x] `components/ReviewSections.tsx` — 28 editable sections, diff tracking
- [x] `components/ExportMenu.tsx` — Markdown, PDF, Jira, ADO export
- [x] `app/api/review/route.ts` — POST (create + Inngest trigger), GET (list)
- [x] `app/api/review/[id]/route.ts` — GET by ID (auth + isPublic check)
- [x] `app/api/review/[id]/section/route.ts` — PATCH (edit section)
- [x] `app/api/review/approve/route.ts` — POST (trigger Inngest option-selected)
- [x] `app/api/export/route.ts` — Markdown / Jira / ADO / PDF export
- [x] `app/api/inngest/route.ts` — Inngest serve route
- [x] `app/lib/inngest.ts` — Inngest client singleton
- [x] `app/lib/functions/analyze-review.ts` — full pipeline: phases → options → wait → sections

---

## 🔲 Up Next

### P0 — Must do before first `npm run dev`
- [ ] `npm install` in workspace (verify all deps installed — 650 packages ✓)
- [ ] `cd packages/db && npx prisma generate` — generate Prisma client
- [ ] Create `apps/web/.env.local` from `.env.example` (add real API keys)
- [ ] Run `npm run dev` and fix any TypeScript / import errors

### P1 — Before demo is usable
- [ ] `/demo` route (`app/demo/page.tsx`) — anonymous, no auth, uses `?demo=1` API flag
- [ ] `middleware.ts` — protect `/dashboard` and `/review/new` behind auth; allow `/demo` public
- [ ] `app/api/auth/[...nextauth]/route.ts` — NextAuth route handler
- [ ] Verify Inngest dev server runs (`npx inngest-cli@latest dev`)

### P2 — Polish before "Show HN"
- [ ] `app/not-found.tsx` — 404 page
- [ ] `app/error.tsx` — error boundary
- [ ] `app/loading.tsx` — skeleton loading states
- [ ] Add `react-markdown` + `remark-gfm` prose styles (table rendering in sections)
- [ ] Replace placeholder GitHub org in README (`your-org`) with real org name
- [ ] Add a real demo ticket in `/demo` as pre-filled example

### P3 — Milestone 2: CLI
- [ ] `apps/cli/` scaffold (Commander.js)
- [ ] `npx engineering-copilot analyze` command
- [ ] Terminal streaming renderer (ink or chalk)
- [ ] npm publish workflow (changesets)

### P4 — Milestone 3: VS Code Extension
- [ ] `apps/vscode-ext/` scaffold
- [ ] WebviewPanel + auth token storage
- [ ] Marketplace publish workflow

---

## Known Issues / Decisions Pending
- **PDF export**: Currently returns Markdown + "print-to-PDF" note. Real PDF via Puppeteer/Playwright or a PDF service (Gotenberg) is a P2 task.
- **Demo auth**: `/demo` route uses `userId: 'demo-user'` — reviews created without auth are ephemeral (no real user row). Need to either delete them on session end or use a dedicated demo user seeded in DB.
- **Ollama support**: Works via OpenAI-compatible endpoint. Needs a note in docs about running `ollama serve` first.
- **NEXTAUTH_URL**: Must be set correctly in production — `https://engineering-copilot.dev`.

---

## Session Log
| Date | Work done | Branch |
|------|-----------|--------|
| 2026-06-26 | Full monorepo scaffold — all packages, pages, components, API routes | `chore/initial-scaffold` |
