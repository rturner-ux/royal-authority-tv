import 'server-only'
import { SquareClient, SquareEnvironment } from 'square'

export function squareClient() {
  return new SquareClient({
    token: process.env.SQUARE_ACCESS_TOKEN!,
    environment:
      process.env.SQUARE_ENVIRONMENT === 'production'
        ? SquareEnvironment.Production
        : SquareEnvironment.Sandbox,
  })
}

// Square's subscription statuses don't map 1:1 onto ours -- collapse them
// to the four states the `subscribers` table's check constraint allows.
export function mapSquareStatus(
  status: string | undefined
): 'active' | 'canceled' | 'past_due' | 'incomplete' {
  switch (status) {
    case 'ACTIVE':
      return 'active'
    case 'CANCELED':
    case 'DEACTIVATED':
      return 'canceled'
    case 'PAUSED':
      return 'past_due'
    default:
      return 'incomplete'
  }
}
