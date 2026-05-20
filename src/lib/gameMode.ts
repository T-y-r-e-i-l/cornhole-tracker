import type { Game, GameMode } from '../types/game'

export const SOLO_ROUNDS = 10
export const SOLO_MAX_SCORE = 120
export const SOLO_MAX_ROUND_SCORE = 12

export function isSoloMode(mode: GameMode): boolean {
  return mode === 'solo'
}

export function isDoublesMode(mode: GameMode): boolean {
  return mode === 'doubles'
}

export function isSoloGame(game: Pick<Game, 'mode'>): boolean {
  return isSoloMode(game.mode)
}

export function getBagsPerRound(mode: GameMode): number {
  return isSoloMode(mode) ? 4 : 8
}

export function getTotalRounds(mode: GameMode): number | null {
  return isSoloMode(mode) ? SOLO_ROUNDS : null
}

export function isCompetitiveGameComplete(
  scoreA: number,
  scoreB: number,
): boolean {
  return scoreA >= 21 || scoreB >= 21
}

export function isSoloGameComplete(
  game: Pick<Game, 'mode' | 'currentRoundIndex' | 'status'>,
): boolean {
  if (!isSoloGame(game)) return false
  return game.status === 'completed' || game.currentRoundIndex >= SOLO_ROUNDS
}

export function isGameComplete(game: Game): boolean {
  if (game.status === 'completed') return true
  if (isSoloGame(game)) return game.currentRoundIndex >= SOLO_ROUNDS
  return isCompetitiveGameComplete(game.scoreA, game.scoreB)
}

export function soloRoundPoints(rawPoints: number): number {
  return Math.min(rawPoints, SOLO_MAX_ROUND_SCORE)
}

/** Average from submitted solo rounds only (excludes round in progress). */
export function soloAvgPerRoundSoFar(
  totalScore: number,
  completedRounds: number,
): number | null {
  if (completedRounds <= 0) return null
  return Math.round((totalScore / completedRounds) * 10) / 10
}
