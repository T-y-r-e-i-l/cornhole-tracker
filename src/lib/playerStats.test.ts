import { describe, expect, it } from 'vitest'
import { computeDoublesPlayerAvgPerRound } from './playerStats'
import type { BagThrow, Round } from '../types/game'

describe('computeDoublesPlayerAvgPerRound', () => {
  const game = {
    firstThrowPlayerKey: 'A1' as const,
    roundLeadPlayerKey: 'A1' as const,
    status: 'in_progress' as const,
    currentRoundIndex: 0,
  }

  it('averages raw points per round for players in frame', () => {
    const bags: BagThrow[] = [
      {
        id: '1',
        gameId: 'g',
        roundIndex: 0,
        sequence: 0,
        teamId: 'A',
        xNorm: 0.5,
        yNorm: 1,
        rotationDeg: 0,
        rawPoints: 3,
        createdAt: '',
      },
      {
        id: '2',
        gameId: 'g',
        roundIndex: 0,
        sequence: 1,
        teamId: 'B',
        xNorm: 0.5,
        yNorm: 1,
        rotationDeg: 0,
        rawPoints: 1,
        createdAt: '',
      },
    ]

    const avgs = computeDoublesPlayerAvgPerRound(game, [], bags)
    expect(avgs.A1).toBe(3)
    expect(avgs.B1).toBe(1)
    expect(avgs.A2).toBeNull()
    expect(avgs.B2).toBeNull()
  })

  it('uses completed rounds from history', () => {
    const rounds: Round[] = [
      {
        id: 'r0',
        gameId: 'g',
        index: 0,
        rawPointsA: 4,
        rawPointsB: 2,
        awardedA: 2,
        awardedB: 0,
        submittedAt: '',
      },
    ]
    const bags: BagThrow[] = [
      {
        id: '1',
        gameId: 'g',
        roundIndex: 0,
        sequence: 0,
        teamId: 'A',
        xNorm: 0.5,
        yNorm: 1,
        rotationDeg: 0,
        rawPoints: 4,
        createdAt: '',
      },
      {
        id: '2',
        gameId: 'g',
        roundIndex: 0,
        sequence: 1,
        teamId: 'B',
        xNorm: 0.5,
        yNorm: 1,
        rotationDeg: 0,
        rawPoints: 2,
        createdAt: '',
      },
    ]

    const avgs = computeDoublesPlayerAvgPerRound(
      { ...game, currentRoundIndex: 1, roundLeadPlayerKey: 'A2' },
      rounds,
      bags,
    )
    expect(avgs.A1).toBe(4)
    expect(avgs.B1).toBe(2)
    expect(avgs.A2).toBe(0)
    expect(avgs.B2).toBe(0)
  })
})
