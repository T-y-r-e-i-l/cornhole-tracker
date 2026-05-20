import { describe, expect, it } from 'vitest'
import { getGameCompleteSummary } from './gameStats'
import type { GameWithDetails } from '../types/game'

function game(overrides: Partial<GameWithDetails>): GameWithDetails {
  return {
    id: 'g1',
    userId: null,
    createdAt: '',
    updatedAt: '',
    mode: 'singles',
    teamAName: 'A',
    teamBName: 'B',
    scoreA: 21,
    scoreB: 15,
    status: 'completed',
    currentRoundIndex: 5,
    currentThrowIndex: 0,
    nextTeamId: 'A',
    firstThrowTeamId: 'A',
    roundFirstTeamId: 'A',
    avgPointsA: 4,
    avgPointsB: 3,
    completedAt: '',
    syncStatus: 'local',
    remoteId: null,
    rounds: [
      {
        id: 'r1',
        gameId: 'g1',
        index: 0,
        rawPointsA: 7,
        rawPointsB: 4,
        awardedA: 3,
        awardedB: 0,
        submittedAt: '',
      },
    ],
    currentRoundBags: [],
    allBags: [],
    ...overrides,
  }
}

describe('getGameCompleteSummary', () => {
  it('solo stats', () => {
    const summary = getGameCompleteSummary(
      game({ mode: 'solo', teamBName: 'Solo', scoreB: 0, scoreA: 87, rounds: [] }),
    )
    expect(summary.headline).toBe('Solo complete')
    expect(summary.stats.some((s) => s.label === 'Total score')).toBe(true)
  })

  it('competitive winner', () => {
    const summary = getGameCompleteSummary(game({}))
    expect(summary.headline).toBe('A wins')
  })
})
