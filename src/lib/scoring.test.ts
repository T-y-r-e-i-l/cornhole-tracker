import { describe, expect, it } from 'vitest'
import {
  computeRoundAwarded,
  isGameOver,
  sumRawPoints,
} from './scoring'
import type { BagThrow } from '../types/game'

function bag(teamId: 'A' | 'B', rawPoints: number): BagThrow {
  return {
    id: '1',
    gameId: 'g',
    roundIndex: 0,
    sequence: 0,
    teamId,
    xNorm: 0.5,
    yNorm: 0.5,
    rotationDeg: 0,
    rawPoints,
    createdAt: '',
  }
}

describe('computeRoundAwarded', () => {
  it('awards difference to higher team', () => {
    expect(computeRoundAwarded(7, 4)).toEqual({ awardedA: 3, awardedB: 0 })
    expect(computeRoundAwarded(4, 7)).toEqual({ awardedA: 0, awardedB: 3 })
  })

  it('awards nothing on tie', () => {
    expect(computeRoundAwarded(5, 5)).toEqual({ awardedA: 0, awardedB: 0 })
  })
})

describe('sumRawPoints', () => {
  it('sums per team', () => {
    const bags = [bag('A', 3), bag('B', 1), bag('A', 1), bag('B', 0)]
    expect(sumRawPoints(bags, 'A')).toBe(4)
    expect(sumRawPoints(bags, 'B')).toBe(1)
  })
})

describe('isGameOver', () => {
  it('ends at 21+', () => {
    expect(isGameOver(21, 10)).toBe(true)
    expect(isGameOver(10, 21)).toBe(true)
    expect(isGameOver(20, 20)).toBe(false)
  })
})
