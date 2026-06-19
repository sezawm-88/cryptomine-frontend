// Core game math + types for CRYPTOMINE: TURBO

export const GRID_SIZE = 25 // 5x5

export type TileState = "hidden" | "safe" | "trap" | "revealed-trap"

export type RoundStatus = "idle" | "active" | "busted" | "cashed"

/**
 * Multiplier for the *next* successful pick given how many tiles remain
 * and how many of those are safe, adjusted for house edge.
 *
 * Step multiplier = remainingTiles / remainingSafeTiles
 * Net is reduced by the house edge.
 */
export function stepMultiplier(remainingTiles: number, remainingSafe: number, houseEdge: number): number {
  if (remainingSafe <= 0) return 1
  return (remainingTiles / remainingSafe) * (1 - houseEdge)
}

/**
 * Cumulative multiplier after a number of safe picks have been made.
 * Compounds each individual step multiplier.
 */
export function cumulativeMultiplier(totalTiles: number, mines: number, picks: number, houseEdge: number): number {
  const safe = totalTiles - mines
  let mult = 1
  for (let i = 0; i < picks; i++) {
    const remainingTiles = totalTiles - i
    const remainingSafe = safe - i
    mult *= stepMultiplier(remainingTiles, remainingSafe, houseEdge)
  }
  return mult
}

/** Generate a random distribution of mine indices across the grid. */
export function generateMines(total: number, mineCount: number): Set<number> {
  const indices = Array.from({ length: total }, (_, i) => i)
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[indices[i], indices[j]] = [indices[j], indices[i]]
  }
  return new Set(indices.slice(0, mineCount))
}

export function formatMoney(value: number, currency = "£"): string {
  return `${currency}${value.toLocaleString("en-GB", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

export function formatMult(value: number): string {
  return `${value.toFixed(2)}x`
}
