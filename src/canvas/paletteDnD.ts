import type { NodeType } from '../domain/types'
import { PALETTE_TYPES } from '../domain/catalog'

/** HTML5 DnD mime for palette → canvas place. */
export const PALETTE_DND_MIME = 'application/sds-node-type'

export function isPaletteNodeType(value: string): value is NodeType {
  return (PALETTE_TYPES as readonly string[]).includes(value)
}
