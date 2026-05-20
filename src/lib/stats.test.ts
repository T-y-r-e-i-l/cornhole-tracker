import { describe, expect, it } from 'vitest'
import { computeAvgPointsPerRound } from './stats'
import type { Round } from '../types/game'

function round(awardedA: number, awardedB: number): Round {
  return {
    id: 'r',
    gameId: 'g',
    index: 0,
    rawPointsA: 0,
    rawPointsB: 0,
    awardedA,
    awardedB,
    submittedAt: '',
  }
}

describe('computeAvgPointsPerRound', () => {
  it('returns null for no rounds', () => {
    expect(computeAvgPointsPerRound([], 'A')).toBeNull()
  })

  it('averages awarded points', () => {
    const rounds = [round(3, 0), round(2, 0), round(0, 4)]
    expect(computeAvgPointsPerRound(rounds, 'A')).toBe(1.67)
    expect(computeAvgPointsPerRound(rounds, 'B')).toBe(1.33)
  })
})
