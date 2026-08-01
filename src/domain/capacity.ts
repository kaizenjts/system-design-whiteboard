import type { NodeType } from './types'

/** PRD default Capacity (req/s). Client is Load source — no Capacity. */
export function defaultCapacity(type: NodeType): number | undefined {
  switch (type) {
    case 'cdn_dns':
      return 50_000
    case 'load_balancer':
      return 20_000
    case 'api':
      return 5_000
    case 'cache':
      return 20_000
    case 'database':
      return 2_000
    case 'queue':
      return 10_000
    case 'client':
      return undefined
  }
}
