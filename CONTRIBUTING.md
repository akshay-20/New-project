# Contributing to Engineering Copilot

Thank you for your interest in contributing! This guide explains how to get started.

---

## The fastest way to contribute: improve a phase

The 10 analysis phases live in one place:

```
packages/prompt-engine/src/phases/
  01-context.ts
  02-dependency-graph.ts
  03-callers.ts
  04-db-migrations.ts
  05-infra-kafka.ts
  06-iam-permissions.ts
  07-risk-register.ts
  08-slo-impact.ts
  09-rollback-strategy.ts
  10-canary-plan.ts
```

Each file exports a `runPhase()` function with a prompt inside. To improve a phase:

1. Find the phase file
2. Edit the `userPrompt` string
3. Run locally against a test ticket
4. Open a PR with the old and new output

**You don't need to understand the web app, database, or auth to contribute a phase improvement.**

---

## Local setup

### Prerequisites

- Node.js 20+
- PostgreSQL 16 (or a Neon / Supabase free account)
- An Anthropic, OpenAI, or Google AI API key

### Steps

```bash
# 1. Clone and install
git clone https://github.com/your-org/engineering-copilot
cd engineering-copilot
npm install

# 2. Copy env file and fill in values
cp apps/web/.env.example apps/web/.env.local

# 3. Generate Prisma client + run migrations
cd packages/db
npx prisma migrate dev
cd ../..

# 4. Start dev server
npm run dev
```

---

## Project structure

```
apps/web/                  Next.js 14 web app
apps/cli/                  npx engineering-copilot CLI
apps/vscode-ext/           VS Code extension
packages/prompt-engine/    ★ The core analysis engine (most contributions go here)
packages/types/            Shared TypeScript types
packages/db/               Prisma schema and client
```

---

## Pull Request guidelines

- Keep PRs focused — one phase, one feature, one fix
- For phase PRs: include before/after output examples in the PR description
- For new phases: open an issue first to discuss
- All code must pass `npm run type-check` and `npm run lint`

---

## Code of Conduct

This project follows the [Contributor Covenant](https://www.contributor-covenant.org/). Be kind.
