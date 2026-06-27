import NewReviewPage from '../review/new/page'

/**
 * /demo — same as /review/new but pre-wired with demo=1 flag.
 * No auth required. Reviews created here are isPublic=true and ephemeral.
 */
export default function DemoPage() {
  return <NewReviewPage />
}

export const metadata = {
  title: 'Live Demo — Engineering Copilot',
  description: 'Try Engineering Copilot with no sign-in required. Paste a ticket and watch 10 analysis phases run live.',
}
