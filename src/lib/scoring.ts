import type { BagThrow, TeamId } from '../types/game'
import { WINNING_SCORE } from '../types/game'

export function sumRawPoints(bags: BagThrow[], teamId: TeamId): number {
  return bags
    .filter((b) => b.teamId === teamId)
    .reduce((sum, b) => sum + b.rawPoints, 0)
}

export function computeRoundAwarded(
  rawA: number,
  rawB: number,
): { awardedA: number; awardedB: number } {
  return {
    awardedA: Math.max(rawA - rawB, 0),
    awardedB: Math.max(rawB - rawA, 0),
  }
}

export function isGameOver(scoreA: number, scoreB: number): boolean {
  return scoreA >= WINNING_SCORE || scoreB >= WINNING_SCORE
}

export function getOtherTeam(teamId: TeamId): TeamId {
  return teamId === 'A' ? 'B' : 'A'
}
