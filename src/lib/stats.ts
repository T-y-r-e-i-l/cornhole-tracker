import type { Round } from '../types/game'

/** Solo: average raw points per completed round */
export function computeSoloAvgPerRound(rounds: Round[]): number | null {
  if (rounds.length === 0) return null
  const total = rounds.reduce((s, r) => s + r.rawPointsA, 0)
  return Math.round((total / rounds.length) * 100) / 100
}

export function computeAvgPointsPerRound(
  rounds: Round[],
  team: 'A' | 'B',
): number | null {
  if (rounds.length === 0) return null
  const total =
    team === 'A'
      ? rounds.reduce((s, r) => s + r.awardedA, 0)
      : rounds.reduce((s, r) => s + r.awardedB, 0)
  return Math.round((total / rounds.length) * 100) / 100
}
