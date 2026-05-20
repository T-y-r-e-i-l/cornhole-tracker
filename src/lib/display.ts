import type { Game, GameSummary } from '../types/game'
import { isSoloGame } from './gameMode'

export function formatGameScore(
  game: Pick<GameSummary, 'mode' | 'teamAName' | 'teamBName' | 'scoreA' | 'scoreB'>,
): string {
  if (isSoloGame(game)) {
    return String(game.scoreA)
  }
  return `${game.scoreA} – ${game.scoreB}`
}

export function formatGameTitle(
  game: Pick<GameSummary, 'mode' | 'teamAName' | 'teamBName'>,
): string {
  if (isSoloGame(game)) {
    return game.teamAName
  }
  return `${game.teamAName} vs ${game.teamBName}`
}

export function formatModeLabel(mode: Game['mode']): string {
  if (mode === 'solo') return 'Solo'
  return mode.charAt(0).toUpperCase() + mode.slice(1)
}
