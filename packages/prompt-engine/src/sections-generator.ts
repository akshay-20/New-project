import type { PhaseContext, ReviewSection, PhaseResult, ImplementationOption } from '@engineering-copilot/types'
import { streamText } from 'ai'
import { getProvider } from './providers'

/** All 28 section definitions — key, title, and brief prompt instructions */
export const SECTION_DEFINITIONS: Array<{ index: number; key: string; title: string; prompt: string }> = [
  { index: 1, key: 'executive-summary', title: 'Executive Summary', prompt: 'A 3–5 sentence summary for a VP. What changed, why, and the risk level.' },
  { index: 2, key: 'problem-statement', title: 'Problem Statement', prompt: 'What problem is being solved? What breaks without this change?' },
  { index: 3, key: 'scope-and-non-scope', title: 'Scope & Non-Scope', prompt: 'Bullet list of what is IN scope and explicitly OUT of scope.' },
  { index: 4, key: 'chosen-approach', title: 'Chosen Approach', prompt: 'Describe the selected implementation option in detail. Architecture, key decisions, why this was chosen.' },
  { index: 5, key: 'rejected-alternatives', title: 'Rejected Alternatives', prompt: 'The other options considered and why they were rejected.' },
  { index: 6, key: 'dependency-graph', title: 'Dependency Graph', prompt: 'ASCII dependency graph and list of all impacted services/packages.' },
  { index: 7, key: 'caller-impact-analysis', title: 'Caller Impact Analysis', prompt: 'Table of callers, breaking change assessment, and backward-compat strategy.' },
  { index: 8, key: 'api-contract-changes', title: 'API Contract Changes', prompt: 'Every endpoint, event schema, or function signature being changed. Before/after.' },
  { index: 9, key: 'auth-iam-changes', title: 'Auth & IAM Changes', prompt: 'Role changes, new secrets, service accounts, least-privilege assessment.' },
  { index: 10, key: 'kafka-event-changes', title: 'Kafka / Event Changes', prompt: 'Topics added/modified, schema changes, consumer compatibility.' },
  { index: 11, key: 'infra-terraform-changes', title: 'Infrastructure Changes', prompt: 'Cloud resources, Terraform/IaC changes, Kubernetes config changes.' },
  { index: 12, key: 'migration-scripts', title: 'Migration Scripts', prompt: 'Forward and backward DDL. Zero-downtime strategy. Estimated duration and lock risk.' },
  { index: 13, key: 'test-strategy', title: 'Test Strategy', prompt: 'Unit, integration, e2e, and contract tests. Coverage targets. Test gaps.' },
  { index: 14, key: 'performance-considerations', title: 'Performance Considerations', prompt: 'Latency impact, throughput changes, memory/CPU profile changes.' },
  { index: 15, key: 'load-test-plan', title: 'Load Test Plan', prompt: 'Test scenarios, target load, success criteria, tools to use.' },
  { index: 16, key: 'monitoring-alerts', title: 'Monitoring & Alerts', prompt: 'New dashboards needed. New alerts. Existing alerts to tune.' },
  { index: 17, key: 'rollback-runbook', title: 'Rollback Runbook', prompt: 'Step-by-step numbered rollback commands. Decision thresholds. Who owns each step.' },
  { index: 18, key: 'canary-rollout-plan', title: 'Canary Rollout Plan', prompt: 'Traffic split stages, soak time, promotion criteria, kill-switch conditions.' },
  { index: 19, key: 'feature-flag-config', title: 'Feature Flag Config', prompt: 'Flag name, default value, targeting rules, kill-switch procedure.' },
  { index: 20, key: 'slo-impact-assessment', title: 'SLO Impact Assessment', prompt: 'Which SLOs are at risk. Error budget impact. Alerting burn-rate rules.' },
  { index: 21, key: 'security-review', title: 'Security Review', prompt: 'Threat model changes. New attack surfaces. Mitigations.' },
  { index: 22, key: 'data-privacy-impact', title: 'Data Privacy Impact', prompt: 'PII handling. GDPR/CCPA implications. Retention policies.' },
  { index: 23, key: 'observability-plan', title: 'Observability Plan', prompt: 'New traces, metrics, logs. Structured logging fields. Correlation IDs.' },
  { index: 24, key: 'documentation-changes', title: 'Documentation Changes', prompt: 'Which docs need updating: API docs, runbooks, ADRs, wikis.' },
  { index: 25, key: 'on-call-handoff', title: 'On-Call Handoff', prompt: 'What the on-call engineer needs to know. Common failure modes and their fixes.' },
  { index: 26, key: 'acceptance-criteria', title: 'Acceptance Criteria', prompt: 'Given/When/Then format. 5–10 testable criteria. DoD checklist.' },
  { index: 27, key: 'open-questions', title: 'Open Questions', prompt: 'Unresolved questions with owner and deadline. Flag blockers 🔴 vs. nice-to-know 🟡.' },
  { index: 28, key: 'sign-off-checklist', title: 'Sign-Off Checklist', prompt: 'Checkboxes for: tech lead, security, SRE, product, legal (if needed). Sign-off status.' },
]

/**
 * Generates all 28 review sections as an async generator.
 * Each section is yielded as it completes — UI can show progress in real time.
 */
export async function* generateSections(
  ctx: PhaseContext,
  phases: PhaseResult[],
  selectedOption: ImplementationOption
): AsyncGenerator<ReviewSection> {
  const phaseSummary = phases
    .map((p) => `### ${p.phaseLabel}\n${p.content}`)
    .join('\n\n')

  const model = getProvider(ctx.aiProvider, ctx.aiModel)

  for (const def of SECTION_DEFINITIONS) {
    const { textStream } = await streamText({
      model,
      system: `You are writing one section of a 28-section Engineering Review document.
Write in clear, precise engineering prose. Use Markdown formatting.
Be specific. Avoid boilerplate. An on-call engineer will rely on this document.`,
      prompt: `## Task
${ctx.ticketText}

## Selected Implementation Option
**${selectedOption.title}**: ${selectedOption.summary}

## 10-Phase Analysis
${phaseSummary}

## Your Task
Write Section ${def.index}: **${def.title}**

Instructions: ${def.prompt}

Output only the section content in Markdown. Do not include the section title — it is added automatically.`,
      maxTokens: 1000,
      temperature: 0.3,
    })

    let content = ''
    for await (const chunk of textStream) {
      content += chunk
    }

    yield {
      sectionIndex: def.index,
      sectionKey: def.key,
      sectionTitle: def.title,
      aiContent: content,
      editedByUser: false,
    }
  }
}
