# Engineering Copilot — TODO

## Session: 2026-06-26
### Completed
- Full monorepo scaffold (apps/web, packages/types, packages/db, packages/prompt-engine)
- Prisma schema with all models
- Next.js pages: /, /login, /dashboard, /review/new, /review/[id]
- 4 React components, 6 API routes, Inngest orchestration
- GitHub Actions CI, .env.example, README.md

### In progress
- [ ] Make app run locally (next dev working)
- [ ] Add missing tsconfig.json files
- [ ] Verify prisma generate passes
- [ ] Add MIT LICENSE file
- [ ] Build /demo route

### Next session
- Build /demo route (no-login entry point for HN launch)
- Verify next build passes with 0 errors
- Deploy to Vercel

### Known issues / blockers
- apps/web/tsconfig.json is missing — app will not start without it
- packages/*/tsconfig.json are missing — TS compilation broken