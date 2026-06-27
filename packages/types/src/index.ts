// ─── Review Status ────────────────────────────────────────────────────────────

export type ReviewStatus =
  | 'ANALYZING'
  | 'AWAITING_APPROVAL'
  | 'GENERATING'
  | 'COMPLETE'
  | 'FAILED'

export type PhaseStatus = 'PENDING' | 'STREAMING' | 'COMPLETE' | 'FAILED'

export type ExportFormat = 'MARKDOWN' | 'PDF' | 'JIRA_COMMENT' | 'ADO_COMMENT'

// ─── Phase Context (passed into every phase function) ─────────────────────────

export interface PhaseContext {
  reviewId: string
  ticketText: string
  ticketUrl?: string
  repoContext?: string
  aiProvider: AIProvider
  aiModel: string
  previousPhases: PhaseResult[]
}

export type AIProvider = 'anthropic' | 'openai' | 'google' | 'ollama'

// ─── Phase Result ─────────────────────────────────────────────────────────────

export interface PhaseResult {
  phaseIndex: number
  phaseKey: PhaseKey
  phaseLabel: string
  content: string
  status: PhaseStatus
  startedAt: Date
  completedAt?: Date
}

export type PhaseKey =
  | 'context'
  | 'dependency-graph'
  | 'callers'
  | 'db-migrations'
  | 'infra-kafka'
  | 'iam-permissions'
  | 'risk-register'
  | 'slo-impact'
  | 'rollback-strategy'
  | 'canary-plan'

// ─── Implementation Options ───────────────────────────────────────────────────

export interface ImplementationOption {
  optionIndex: number // 1 | 2 | 3
  title: string
  summary: string
  tradeoffs: OptionTradeoffs
}

export interface OptionTradeoffs {
  pros: string[]
  cons: string[]
  effort: 'low' | 'medium' | 'high'
  risk: 'low' | 'medium' | 'high'
  estimatedDays?: number
}

// ─── Review Section ───────────────────────────────────────────────────────────

export interface ReviewSection {
  sectionIndex: number // 1–28
  sectionKey: string
  sectionTitle: string
  aiContent: string
  userContent?: string
  editedByUser: boolean
  editedAt?: Date
}

export type SectionKey =
  | 'executive-summary'
  | 'problem-statement'
  | 'scope-and-non-scope'
  | 'chosen-approach'
  | 'rejected-alternatives'
  | 'dependency-graph'
  | 'caller-impact-analysis'
  | 'api-contract-changes'
  | 'auth-iam-changes'
  | 'kafka-event-changes'
  | 'infra-terraform-changes'
  | 'migration-scripts'
  | 'test-strategy'
  | 'performance-considerations'
  | 'load-test-plan'
  | 'monitoring-alerts'
  | 'rollback-runbook'
  | 'canary-rollout-plan'
  | 'feature-flag-config'
  | 'slo-impact-assessment'
  | 'security-review'
  | 'data-privacy-impact'
  | 'observability-plan'
  | 'documentation-changes'
  | 'on-call-handoff'
  | 'acceptance-criteria'
  | 'open-questions'
  | 'sign-off-checklist'

// ─── Full Review (assembled) ──────────────────────────────────────────────────

export interface Review {
  id: string
  userId: string
  title: string
  ticketUrl?: string
  ticketText?: string
  repoContext?: string
  status: ReviewStatus
  selectedOption?: number
  aiProvider: AIProvider
  aiModel: string
  createdAt: Date
  updatedAt: Date
  phases: PhaseResult[]
  options: ImplementationOption[]
  sections: ReviewSection[]
}

// ─── API Payloads ─────────────────────────────────────────────────────────────

export interface CreateReviewInput {
  ticketText?: string
  ticketUrl?: string
  repoContext?: string
  aiProvider?: AIProvider
  aiModel?: string
}

export interface ApproveOptionInput {
  reviewId: string
  selectedOption: number // 1 | 2 | 3
}

export interface UpdateSectionInput {
  reviewId: string
  sectionIndex: number
  userContent: string
}

export interface ExportReviewInput {
  reviewId: string
  format: ExportFormat
}
