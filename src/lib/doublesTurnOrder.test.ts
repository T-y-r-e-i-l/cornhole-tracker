import { describe, expect, it } from 'vitest'
import {
  getActivePlayerKey,
  getDoublesThrowSequence,
  getNextRoundLeadPlayerKey,
  getRoundScoringTeam,
} from './doublesTurnOrder'

describe('getDoublesThrowSequence', () => {
  it('round 1 is A1 vs B1 alternating from A1', () => {
    expect(getDoublesThrowSequence('A1', 0)).toEqual([
      'A1',
      'B1',
      'A1',
      'B1',
      'A1',
      'B1',
      'A1',
      'B1',
    ])
  })

  it('round 2 is A2 vs B2 alternating from A2', () => {
    expect(getDoublesThrowSequence('A2', 1)).toEqual([
      'A2',
      'B2',
      'A2',
      'B2',
      'A2',
      'B2',
      'A2',
      'B2',
    ])
  })

  it('round 2 can lead with B2', () => {
    expect(getDoublesThrowSequence('B2', 1).slice(0, 2)).toEqual(['B2', 'A2'])
  })
})

describe('getNextRoundLeadPlayerKey', () => {
  it('uses player 2 on round 2 when scoring team is A', () => {
    expect(getNextRoundLeadPlayerKey(1, 'A')).toBe('A2')
  })

  it('uses player 1 on round 3 when scoring team is B', () => {
    expect(getNextRoundLeadPlayerKey(2, 'B')).toBe('B1')
  })
})

describe('getRoundScoringTeam', () => {
  it('picks higher awarded team', () => {
    expect(getRoundScoringTeam(3, 1, 'B')).toBe('A')
  })

  it('keeps round leader on tie', () => {
    expect(getRoundScoringTeam(0, 0, 'A')).toBe('A')
  })
})

describe('getActivePlayerKey', () => {
  it('returns thrower for current index', () => {
    expect(
      getActivePlayerKey({
        mode: 'doubles',
        roundLeadPlayerKey: 'A2',
        currentRoundIndex: 1,
        currentThrowIndex: 3,
      }),
    ).toBe('B2')
  })
})
