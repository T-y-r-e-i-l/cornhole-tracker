import {
  BAG_CORNER_RADIUS,
  BAG_SIZE,
  bagOutlinePerimeter,
  HOLE_BAG_SCALE,
} from '../../lib/boardGeometry'
import type { TeamId } from '../../types/game'

const BAG_STROKE_WIDTH = 0.006 * HOLE_BAG_SCALE
const BAG_OUTLINE_PERIMETER = bagOutlinePerimeter()

interface BagMarkerProps {
  x: number
  y: number
  rotationDeg: number
  teamId: TeamId
  opacity?: number
  ghost?: boolean
  /** 0–1 remaining hold time; draws a depleting reposition lock ring */
  holdProgress?: number
}

export function BagMarker({
  x,
  y,
  rotationDeg,
  teamId,
  opacity = 1,
  ghost = false,
  holdProgress,
}: BagMarkerProps) {
  const fill = teamId === 'A' ? 'var(--color-team-red)' : 'var(--color-team-blue)'
  const half = BAG_SIZE / 2
  const transform = `rotate(${rotationDeg} ${x} ${y})`
  const showHoldRing = holdProgress != null && holdProgress > 0
  const visibleStroke = BAG_OUTLINE_PERIMETER * holdProgress!

  return (
    <g transform={transform}>
      <rect
        x={x - half}
        y={y - half}
        width={BAG_SIZE}
        height={BAG_SIZE}
        rx={BAG_CORNER_RADIUS}
        ry={BAG_CORNER_RADIUS}
        fill={fill}
        stroke={ghost ? 'var(--color-ink)' : 'transparent'}
        strokeWidth={ghost ? BAG_STROKE_WIDTH : 0}
        strokeDasharray={ghost ? '0.015 0.008' : undefined}
        opacity={ghost ? 0.8 : opacity}
      />
      {showHoldRing && (
        <rect
          x={x - half}
          y={y - half}
          width={BAG_SIZE}
          height={BAG_SIZE}
          rx={BAG_CORNER_RADIUS}
          ry={BAG_CORNER_RADIUS}
          fill="none"
          stroke="var(--color-ink)"
          strokeWidth={BAG_STROKE_WIDTH}
          strokeLinecap="round"
          strokeDasharray={`${visibleStroke} ${BAG_OUTLINE_PERIMETER}`}
        />
      )}
    </g>
  )
}
