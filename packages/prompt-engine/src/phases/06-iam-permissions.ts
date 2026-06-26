import type { PhaseContext, PhaseResult } from '@engineering-copilot/types'
import { streamText } from 'ai'
import { getProvider } from '../providers'

export const PHASE_INDEX = 6
export const PHASE_KEY = 'iam-permissions' as const
export const PHASE_LABEL = 'IAM & Permissions Audit'

/**
 * Phase 6: IAM & Permissions Audit
 *
 * Audits every IAM role, secret, API key, service account, and permission
 * boundary touched by this change. Enforces least-privilege principle review.
 */
export async function runPhase(ctx: PhaseContext): Promise<PhaseResult> {
  const startedAt = new Date()

  const systemPrompt = `You are a staff security and platform engineer auditing IAM and permissions changes.
Apply the principle of least privilege to all analysis.
Flag any permission that is broader than strictly necessary as a risk.`

  const userPrompt = `## Task Description
${ctx.ticketText}
${ctx.repoContext ? `\n## Repository Context\n${ctx.repoContext}` : ''}

## Phase 6: IAM & Permissions Audit

### 6.1 IAM Role Changes
List every IAM role (AWS, GCP, Azure, or custom RBAC) that needs to be created or modified.

For each role change:
| Role Name | Current Permissions | Permissions Added | Permissions Removed | Least Privilege? |
|-----------|--------------------|--------------------|---------------------|-----------------|
| ...       | ...                | ...                | ...                 | ✅ / ⚠️ / 🔴    |

### 6.2 Secrets & API Keys
New secrets or API keys needed:
- Secret name and purpose
- Storage location (Vault, AWS Secrets Manager, K8s Secret, env var)
- Rotation policy
- Who has read access?

Secrets being deprecated / rotated:

### 6.3 Service Accounts
New service accounts needed:
- Name, purpose, and owning team
- Minimum required permissions (scoped down)
- Token/key lifetime

### 6.4 Network Access Controls
New firewall rules, security groups, or VPC peering needed?
Any service-to-service mTLS certificates?

### 6.5 Compliance Flags
Does this change touch:
- PII or sensitive data? (GDPR / CCPA implications)
- Payment data? (PCI-DSS scope)
- Healthcare data? (HIPAA scope)
- Audit log requirements?

### 6.6 Least-Privilege Gaps
List any existing permissions that are broader than needed and should be
tightened as part of this change (tech debt opportunity).`

  const model = getProvider(ctx.aiProvider, ctx.aiModel)
  let content = ''

  const { textStream } = await streamText({
    model,
    system: systemPrompt,
    prompt: userPrompt,
    maxTokens: 2000,
    temperature: 0.2,
  })

  for await (const chunk of textStream) {
    content += chunk
  }

  return {
    phaseIndex: PHASE_INDEX,
    phaseKey: PHASE_KEY,
    phaseLabel: PHASE_LABEL,
    content,
    status: 'COMPLETE',
    startedAt,
    completedAt: new Date(),
  }
}
