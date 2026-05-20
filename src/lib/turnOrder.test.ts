import { describe, expect, it } from 'vitest'
import { getNextRoundFirstTeam } from './turnOrder'

describe('getNextRoundFirstTeam', () => {
  it('team that scored throws first next round', () => {
    expect(getNextRoundFirstTeam('B', 3, 0)).toBe('A')
    expect(getNextRoundFirstTeam('A', 0, 2)).toBe('B')
  })

  it('keeps same leadoff when no points awarded', () => {
    expect(getNextRoundFirstTeam('A', 0, 0)).toBe('A')
    expect(getNextRoundFirstTeam('B', 0, 0)).toBe('B')
  })
})
