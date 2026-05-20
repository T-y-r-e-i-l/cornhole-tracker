import type { GameWithDetails } from '../types/game'
import { formatGameScore, formatGameTitle, formatModeLabel } from './display'
import { isSoloGame, SOLO_MAX_SCORE, SOLO_ROUNDS } from './gameMode'
import { computeAvgPointsPerRound, computeSoloAvgPerRound } from './stats'

export interface GameStat {
  label: string
  value: string
}

export interface GameCompleteSummary {
  modeLabel: string
  title: string
  headline: string
  finalScore: string
  stats: GameStat[]
}

function bestRoundPoints(game: GameWithDetails): number {
  if (game.rounds.length === 0) return 0
  return Math.max(...game.rounds.map((r) => r.rawPointsA))
}

function competitiveWinner(game: GameWithDetails): 'A' | 'B' | 'tie' {
  if (game.scoreA > game.scoreB) return 'A'
  if (game.scoreB > game.scoreA) return 'B'
  return 'tie'
}

export function getGameCompleteSummary(game: GameWithDetails): GameCompleteSummary {
  const modeLabel = formatModeLabel(game.mode)
  const title = formatGameTitle(game)
  const finalScore = formatGameScore(game)

  if (isSoloGame(game)) {
    const avg = game.avgPointsA ?? computeSoloAvgPerRound(game.rounds)
    const best = bestRoundPoints(game)
    return {
      modeLabel,
      title,
      headline: 'Solo complete',
      finalScore,
      stats: [
        { label: 'Total score', value: String(game.scoreA) },
        { label: 'Rounds played', value: `${game.rounds.length} / ${SOLO_ROUNDS}` },
        ...(avg != null ? [{ label: 'Avg pts / round', value: String(avg) }] : []),
        { label: 'Best round', value: `${best} pts` },
        {
          label: 'Of max possible',
          value: `${SOLO_MAX_SCORE} pts`,
        },
      ],
    }
  }

  const winner = competitiveWinner(game)
  const avgA = game.avgPointsA ?? computeAvgPointsPerRound(game.rounds, 'A')
  const avgB = game.avgPointsB ?? computeAvgPointsPerRound(game.rounds, 'B')
  const headline =
    winner === 'tie'
      ? 'Tie game'
      : winner === 'A'
        ? `${game.teamAName} wins`
        : `${game.teamBName} wins`

  return {
    modeLabel,
    title,
    headline,
    finalScore,
    stats: [
      { label: 'Final score', value: finalScore },
      { label: 'Rounds played', value: String(game.rounds.length) },
      ...(avgA != null ? [{ label: `${game.teamAName} avg / round`, value: String(avgA) }] : []),
      ...(avgB != null ? [{ label: `${game.teamBName} avg / round`, value: String(avgB) }] : []),
      {
        label: 'Mode',
        value: modeLabel,
      },
    ],
  }
}
