<div align="center">

# Engineering Copilot

### The pre-coding analysis layer for staff-level engineering decisions

**AI forces structured analysis before code generation. Engineers approve the plan. Then code generates.**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![CI](https://github.com/your-org/engineering-copilot/actions/workflows/ci.yml/badge.svg)](https://github.com/your-org/engineering-copilot/actions)
[![npm](https://img.shields.io/npm/v/engineering-copilot)](https://www.npmjs.com/package/engineering-copilot)

[**→ Live Demo (no login)**](https://engineering-copilot.dev/demo) · [Docs](https://engineering-copilot.dev/docs) · [Discord](https://discord.gg/engineering-copilot)

</div>

---

## What it does

AI coding agents write code well. But they skip everything a **staff engineer** thinks about before touching a line: migrations, callers, rollback strategy, Kafka, IAM, SLOs, canary rollout.

Engineering Copilot is the **pre-coding layer** — it forces structured analysis first, and only generates code after a human approves the plan.

## Core user flow

```
1. Paste a Jira ticket, ADO item, or describe your task in plain text
2. Watch 10 analysis phases stream live (dependency graph, callers, DB migrations, risks, deployment plan...)  
3. Pick one of 3 implementation options the AI presents
4. Get a full 28-section Engineering Review — export as Markdown, PDF, or paste into Jira
```

## Quick start

### Web app (recommended)

👉 **[Try the live demo — no login required](https://engineering-copilot.dev/demo)**

Or run locally:

```bash
git clone https://github.com/your-org/engineering-copilot
cd engineering-copilot
npm install
cp apps/web/.env.example apps/web/.env.local
# Fill in your API keys, then:
cd packages/db && npx prisma migrate dev && cd ../..
npm run dev
```

### CLI

```bash
npx engineering-copilot analyze "Add rate limiting to the payments API"
npx engineering-copilot analyze --file ticket.md --provider openai
npx engineering-copilot analyze --url https://your-jira.atlassian.net/browse/PAY-123
```

## The 10 analysis phases

| # | Phase | What it answers |
|---|-------|-----------------|
| 1 | Context & Scope | What is the task? Bounded context. Acceptance criteria. |
| 2 | Dependency Graph | Which services/packages does this touch? |
| 3 | Caller Impact | Who calls the code being changed? Breaking changes? |
| 4 | DB Migrations | Schema changes, forward/backward DDL, zero-downtime strategy |
| 5 | Infra & Kafka | Kafka topics, event schemas, Terraform, Kubernetes |
| 6 | IAM & Permissions | Roles, secrets, service accounts, least-privilege audit |
| 7 | Risk Register | P0/P1/P2 risks with concrete mitigations |
| 8 | SLO Impact | Which SLOs are at risk? Error budget math. |
| 9 | Rollback Strategy | Step-by-step rollback runbook with exact commands |
| 10 | Canary Plan | Traffic split schedule, success metrics, kill-switch |

## AI provider support

| Provider | Models | Config |
|----------|--------|--------|
| **Anthropic** (default) | claude-opus-4-5, claude-sonnet-4-5 | `ANTHROPIC_API_KEY` |
| OpenAI | gpt-4o, gpt-4o-mini | `OPENAI_API_KEY` |
| Google | gemini-1.5-pro, gemini-1.5-flash | `GOOGLE_GENERATIVE_AI_API_KEY` |
| Ollama (local) | llama3, mistral, any | `OLLAMA_BASE_URL` (no key) |

## Contributing

The fastest way to contribute is to **improve one analysis phase**:

```
packages/prompt-engine/src/phases/
  01-context.ts           ← edit the prompt, open a PR
  02-dependency-graph.ts
  03-callers.ts
  ...
```

Each phase is one file. Each file exports one function. **You don't need to understand the web app, database, or auth.**

See [CONTRIBUTING.md](CONTRIBUTING.md) for full setup instructions.

### Good first issues

- [Improve Phase 4 (DB Migrations) for MySQL](https://github.com/your-org/engineering-copilot/issues)
- [Add Phase output for gRPC/Protobuf services](https://github.com/your-org/engineering-copilot/issues)
- [Improve canary plan for Kubernetes/Argo Rollouts](https://github.com/your-org/engineering-copilot/issues)

## Project structure

```
engineering-copilot/
├── apps/
│   ├── web/                # Next.js 14 web app
│   ├── cli/                # npx engineering-copilot
│   └── vscode-ext/         # VS Code extension
└── packages/
    ├── prompt-engine/      # ★ Core analysis engine (contribute here)
    ├── types/              # Shared TypeScript types
    └── db/                 # Prisma schema + migrations
```

## Tech stack

- **Web**: Next.js 14 (App Router), NextAuth v5, Tailwind CSS
- **AI**: Vercel AI SDK (provider-agnostic streaming)
- **DB**: PostgreSQL + Prisma
- **Background jobs**: Inngest (durable phase orchestration)
- **CLI**: Commander.js
- **VS Code ext**: VS Code Extension API

## License

MIT © Engineering Copilot Contributors