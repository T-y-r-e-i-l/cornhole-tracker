/** Visual scale for hole and bags (board size unchanged); 3× base, then −30% */
export const HOLE_BAG_SCALE = 3 * 0.7

/** Regulation proportions: 2′ × 4′ portrait */
export const BOARD_WIDTH = 1
export const BOARD_HEIGHT = 2

/** Extra SVG margin for placing bags in the dirt around the board */
export const VIEW_PADDING_X = 0.4
export const VIEW_PADDING_Y = 0.5
export const VIEW_MIN_X = -VIEW_PADDING_X
export const VIEW_MIN_Y = -VIEW_PADDING_Y
export const VIEW_WIDTH = BOARD_WIDTH + VIEW_PADDING_X * 2
export const VIEW_HEIGHT = BOARD_HEIGHT + VIEW_PADDING_Y * 2

/** Hole radius: regulation 6″ on 24″ width, then ×3 */
const BASE_HOLE_RADIUS = 0.0625
export const HOLE_RADIUS = BASE_HOLE_RADIUS * HOLE_BAG_SCALE
export const HOLE_CENTER_X = BOARD_WIDTH / 2
/** 9″ from top on 48″ board */
export const HOLE_CENTER_Y = (9 / 48) * BOARD_HEIGHT

/** Bag footprint in normalized units */
export const BAG_SIZE = 0.09 * HOLE_BAG_SCALE
export const BAG_CORNER_RADIUS = 0.022 * HOLE_BAG_SCALE

/** Perimeter of the bag outline (rounded square) for stroke-dash countdown UI */
export function bagOutlinePerimeter(
  size = BAG_SIZE,
  corner = BAG_CORNER_RADIUS,
): number {
  const r = Math.min(corner, size / 2)
  return 4 * (size - 2 * r) + 2 * Math.PI * r
}
/** Touch target for selecting a placed bag to reposition */
export const BAG_HIT_RADIUS = BAG_SIZE * 0.65

export interface BagHitTarget {
  id: string
  xNorm: number
  yNorm: number
}

export const BOARD_INSET_X = 0.02
export const BOARD_INSET_Y = 0.04
export const BOARD_CORNER_RADIUS = 0.06

export interface Point {
  x: number
  y: number
}

export interface BoardRect {
  left: number
  top: number
  width: number
  height: number
}

export function isPointOnBoard(x: number, y: number): boolean {
  return x >= 0 && x <= BOARD_WIDTH && y >= 0 && y <= BOARD_HEIGHT
}

export function isPointInHole(x: number, y: number): boolean {
  const dx = x - HOLE_CENTER_X
  const dy = y - HOLE_CENTER_Y
  return dx * dx + dy * dy <= HOLE_RADIUS * HOLE_RADIUS
}

/** Topmost bag wins when pointers overlap. */
export function findBagAtPoint<T extends BagHitTarget>(
  bags: T[],
  x: number,
  y: number,
): T | undefined {
  for (let i = bags.length - 1; i >= 0; i--) {
    const bag = bags[i]
    const dx = x - bag.xNorm
    const dy = y - bag.yNorm
    if (dx * dx + dy * dy <= BAG_HIT_RADIUS * BAG_HIT_RADIUS) return bag
  }
  return undefined
}

export function classifyBagPlacement(x: number, y: number): 0 | 1 | 3 {
  if (!isPointOnBoard(x, y)) return 0
  if (isPointInHole(x, y)) return 3
  return 1
}

/** Map pointer position across the full SVG to normalized coords (includes off-board dirt). */
export function clientToNormalized(
  clientX: number,
  clientY: number,
  rect: DOMRect,
): Point {
  const localX = clientX - rect.left
  const localY = clientY - rect.top

  return {
    x: VIEW_MIN_X + (localX / rect.width) * VIEW_WIDTH,
    y: VIEW_MIN_Y + (localY / rect.height) * VIEW_HEIGHT,
  }
}

/** Angle from bag center to pointer (for bag rotation while dragging) */
export function rotationFromPointer(
  pointer: Point,
  bagCenter: Point,
): number {
  const dx = pointer.x - bagCenter.x
  const dy = pointer.y - bagCenter.y
  return (Math.atan2(dy, dx) * 180) / Math.PI
}

export const VIEWBOX = `${VIEW_MIN_X} ${VIEW_MIN_Y} ${VIEW_WIDTH} ${VIEW_HEIGHT}`
