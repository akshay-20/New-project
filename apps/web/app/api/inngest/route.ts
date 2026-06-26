import { serve } from 'inngest/next'
import { inngest } from '../../lib/inngest'
import { analyzeReview } from '../../lib/functions/analyze-review'

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [analyzeReview],
})
