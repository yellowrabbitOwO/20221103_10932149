export const XP_PER_TODO = 10

/** XP required to go from `level` to `level + 1` (level starts at 1). */
function xpCostForLevel(level: number): number {
  return 50 + (level - 1) * 25
}

export interface LevelInfo {
  level: number
  xpIntoLevel: number
  xpForNextLevel: number
}

export function calcLevel(totalXp: number): LevelInfo {
  let level = 1
  let remaining = totalXp
  let cost = xpCostForLevel(level)
  while (remaining >= cost) {
    remaining -= cost
    level += 1
    cost = xpCostForLevel(level)
  }
  return { level, xpIntoLevel: remaining, xpForNextLevel: cost }
}
