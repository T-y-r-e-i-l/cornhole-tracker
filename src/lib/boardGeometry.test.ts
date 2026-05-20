import { describe, expect, it } from 'vitest'
import {
  BAG_HIT_RADIUS,
  BAG_SIZE,
  BOARD_HEIGHT,
  BOARD_WIDTH,
  classifyBagPlacement,
  clientToNormalized,
  findBagAtPoint,
  HOLE_BAG_SCALE,
  HOLE_CENTER_X,
  HOLE_CENTER_Y,
  HOLE_RADIUS,
  isPointInHole,
  isPointOnBoard,
  VIEW_MIN_X,
  VIEW_MIN_Y,
} from './boardGeometry'

describe('classifyBagPlacement', () => {
  it('returns 0 off board', () => {
    expect(classifyBagPlacement(-0.1, BOARD_HEIGHT / 2)).toBe(0)
    expect(classifyBagPlacement(BOARD_WIDTH / 2, BOARD_HEIGHT + 0.1)).toBe(0)
    expect(classifyBagPlacement(VIEW_MIN_X, VIEW_MIN_Y)).toBe(0)
  })

  it('returns 3 in hole', () => {
    expect(classifyBagPlacement(HOLE_CENTER_X, HOLE_CENTER_Y)).toBe(3)
  })

  it('returns 1 on board but not hole', () => {
    expect(classifyBagPlacement(HOLE_CENTER_X, 1.5)).toBe(1)
  })
})

describe('isPointInHole', () => {
  it('detects hole center', () => {
    expect(isPointInHole(HOLE_CENTER_X, HOLE_CENTER_Y)).toBe(true)
  })

  it('hole radius is scaled from regulation base', () => {
    expect(HOLE_RADIUS).toBeCloseTo(0.0625 * HOLE_BAG_SCALE, 5)
  })
})

describe('isPointOnBoard', () => {
  it('bounds check', () => {
    expect(isPointOnBoard(0, 0)).toBe(true)
    expect(isPointOnBoard(BOARD_WIDTH, BOARD_HEIGHT)).toBe(true)
    expect(isPointOnBoard(BOARD_WIDTH, BOARD_HEIGHT + 0.1)).toBe(false)
  })
})

describe('clientToNormalized', () => {
  it('maps center of svg to board center', () => {
    const rect = new DOMRect(0, 0, 200, 400)
    const p = clientToNormalized(100, 200, rect)
    expect(p.x).toBeCloseTo(BOARD_WIDTH / 2, 2)
    expect(p.y).toBeCloseTo(BOARD_HEIGHT / 2, 2)
  })

  it('maps corners to off-board dirt', () => {
    const rect = new DOMRect(0, 0, 200, 400)
    const topLeft = clientToNormalized(0, 0, rect)
    expect(classifyBagPlacement(topLeft.x, topLeft.y)).toBe(0)
    expect(isPointOnBoard(topLeft.x, topLeft.y)).toBe(false)
  })
})

describe('findBagAtPoint', () => {
  const bags = [
    { id: 'a', xNorm: 0.5, yNorm: 1 },
    { id: 'b', xNorm: 0.52, yNorm: 1.02 },
  ]

  it('returns topmost bag when hits overlap', () => {
    expect(findBagAtPoint(bags, 0.52, 1.02)?.id).toBe('b')
  })

  it('returns undefined when outside hit radius', () => {
    expect(findBagAtPoint(bags, 0, 0)).toBeUndefined()
  })

  it('uses generous touch radius', () => {
    expect(BAG_HIT_RADIUS).toBeGreaterThan(BAG_SIZE / 2)
  })
})

describe('scale', () => {
  it('board stays regulation size', () => {
    expect(BOARD_WIDTH).toBe(1)
    expect(BOARD_HEIGHT).toBe(2)
  })

  it('bags match hole/bag scale', () => {
    expect(BAG_SIZE).toBeCloseTo(0.09 * HOLE_BAG_SCALE, 5)
    expect(HOLE_BAG_SCALE).toBeCloseTo(2.1, 5)
  })
})
