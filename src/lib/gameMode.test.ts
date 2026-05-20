import { describe, expect, it } from 'vitest'
import {
  getBagsPerRound,
  isSoloGameComplete,
  soloAvgPerRoundSoFar,
  SOLO_MAX_SCORE,
  SOLO_ROUNDS,
} from './gameMode'

describe('solo mode', () => {
  it('uses 4 bags per round', () => {
    expect(getBagsPerRound('solo')).toBe(4)
    expect(getBagsPerRound('singles')).toBe(8)
  })

  it('completes after 10 rounds', () => {
    expect(
      isSoloGameComplete({
        mode: 'solo',
        currentRoundIndex: SOLO_ROUNDS,
        status: 'in_progress',
      }),
    ).toBe(true)
    expect(
      isSoloGameComplete({
        mode: 'solo',
        currentRoundIndex: 5,
        status: 'in_progress',
      }),
    ).toBe(false)
  })

  it('max score constant', () => {
    expect(SOLO_MAX_SCORE).toBe(SOLO_ROUNDS * 12)
  })

  it('averages completed rounds only', () => {
    expect(soloAvgPerRoundSoFar(0, 0)).toBeNull()
    expect(soloAvgPerRoundSoFar(15, 3)).toBe(5)
  })
})
