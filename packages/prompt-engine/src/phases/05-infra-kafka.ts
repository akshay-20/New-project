import type { PhaseContext, PhaseResult } from '@engineering-copilot/types'
import { streamText } from 'ai'
import { getProvider } from '../providers'

export const PHASE_INDEX = 5
export const PHASE_KEY = 'infra-kafka' as const
export const PHASE_LABEL = 'Infrastructure & Event Streaming'

/**
 * Phase 5: Infrastructure & Event Streaming
 *
 * Analyzes Kafka topics, queues, event contracts, and infrastructure
 * components (cloud resources, Terraform, Kubernetes) affected by the change.
 */
export async function runPhase(ctx: PhaseContext): Promise<PhaseResult> {
  const startedAt = new Date()

  const systemPrompt = `You are a staff platform engineer analyzing infrastructure and event-driven system changes.
Cover Kafka, queues, cloud resources, and container orchestration.
If infrastructure components are not relevant, state so explicitly and move on.`

  const userPrompt = `## Task Description
${ctx.ticketText}
${ctx.repoContext ? `\n## Repository Context\n${ctx.repoContext}` : ''}

## Phase 5: Infrastructure & Event Streaming

### 5.1 Kafka / Event Streaming Impact
List every Kafka topic, SQS queue, Pub/Sub topic, or event stream affected.

For each topic/queue:
| Topic/Queue | Change Type | Producers | Consumers | Schema Change? |
|-------------|-------------|-----------|-----------|----------------|
| ...         | ...         | ...       | ...       | ...            |

### 5.2 Event Schema Changes
For any event schema being modified:
- Current schema (describe key fields)
- Proposed schema
- Schema registry update needed? (Avro/Protobuf/JSON Schema)
- Consumer compatibility: BACKWARD / FORWARD / FULL / NONE
- Recommended compatibility mode

### 5.3 Infrastructure Changes Required
What cloud resources need to be created, modified, or destroyed?
- Compute (EC2, Lambda, Cloud Run, pods)
- Storage (S3 buckets, GCS, blob storage)
- Networking (VPC rules, security groups, load balancer rules)
- Managed services (RDS, ElastiCache, managed Kafka)

### 5.4 Terraform / IaC Changes
Which Terraform modules or IaC files need updates?
Any state migration risks?

### 5.5 Kubernetes / Container Changes
New deployments, config maps, secrets, HPA rules, resource limit changes?

### 5.6 CDN / Cache Invalidation
Does this change require cache invalidation? Which CDN edge nodes?`

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
