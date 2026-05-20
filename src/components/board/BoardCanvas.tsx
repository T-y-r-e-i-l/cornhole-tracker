import { useCallback, useEffect, useRef, useState } from 'react'
import type { BagThrow } from '../../types/game'
import { getBagsPerRound } from '../../lib/gameMode'
import type { GameMode } from '../../types/game'
import {
  BOARD_CORNER_RADIUS,
  BOARD_HEIGHT,
  BOARD_INSET_X,
  BOARD_INSET_Y,
  BOARD_WIDTH,
  clientToNormalized,
  findBagAtPoint,
  HOLE_CENTER_X,
  HOLE_CENTER_Y,
  HOLE_RADIUS,
  rotationFromPointer,
  VIEW_HEIGHT,
  VIEW_MIN_X,
  VIEW_MIN_Y,
  VIEW_WIDTH,
  VIEWBOX,
} from '../../lib/boardGeometry'
import { BagMarker } from './BagMarker'

const DRAG_THRESHOLD_PX = 8
const REPOSITION_HOLD_MS = 1200

type InteractionMode = 'idle' | 'placing' | 'hold-pending' | 'repositioning'

interface BoardCanvasProps {
  bags: BagThrow[]
  nextTeamId: 'A' | 'B'
  mode: GameMode
  disabled?: boolean
  canReposition?: boolean
  onPlaceBag: (x: number, y: number, rotationDeg: number) => void
  onRepositionBag?: (bagId: string, x: number, y: number, rotationDeg: number) => void
}

interface DragState {
  x: number
  y: number
  rotationDeg: number
  teamId: 'A' | 'B'
}

export function BoardCanvas({
  bags,
  nextTeamId,
  mode,
  disabled,
  canReposition = false,
  onPlaceBag,
  onRepositionBag,
}: BoardCanvasProps) {
  const bagsPerRound = getBagsPerRound(mode)
  const svgRef = useRef<SVGSVGElement>(null)
  const pointerIdRef = useRef<number | null>(null)
  const startClientRef = useRef<{ x: number; y: number } | null>(null)
  const draggedRef = useRef(false)
  const interactionModeRef = useRef<InteractionMode>('idle')
  const movingBagIdRef = useRef<string | null>(null)
  const anchorPointRef = useRef<{ x: number; y: number } | null>(null)
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const holdRafRef = useRef<number | null>(null)
  const holdStartRef = useRef<number | null>(null)
  const [drag, setDrag] = useState<DragState | null>(null)
  const [movingBagId, setMovingBagId] = useState<string | null>(null)
  const [holdTargetBagId, setHoldTargetBagId] = useState<string | null>(null)
  const [holdProgress, setHoldProgress] = useState(1)

  const resolvePoint = useCallback((clientX: number, clientY: number) => {
    const svg = svgRef.current
    if (!svg) return null
    return clientToNormalized(clientX, clientY, svg.getBoundingClientRect())
  }, [])

  const stopHoldProgress = useCallback(() => {
    holdStartRef.current = null
    if (holdRafRef.current != null) {
      cancelAnimationFrame(holdRafRef.current)
      holdRafRef.current = null
    }
    setHoldProgress(1)
  }, [])

  const startHoldProgress = useCallback(() => {
    stopHoldProgress()
    holdStartRef.current = performance.now()
    setHoldProgress(1)

    const tick = () => {
      const start = holdStartRef.current
      if (start == null) return
      const elapsed = performance.now() - start
      const remaining = Math.max(0, 1 - elapsed / REPOSITION_HOLD_MS)
      setHoldProgress(remaining)
      if (remaining > 0 && interactionModeRef.current === 'hold-pending') {
        holdRafRef.current = requestAnimationFrame(tick)
      }
    }

    holdRafRef.current = requestAnimationFrame(tick)
  }, [stopHoldProgress])

  const clearHoldTimer = useCallback(() => {
    if (holdTimerRef.current != null) {
      clearTimeout(holdTimerRef.current)
      holdTimerRef.current = null
    }
    stopHoldProgress()
  }, [stopHoldProgress])

  const resetInteraction = useCallback(() => {
    clearHoldTimer()
    pointerIdRef.current = null
    startClientRef.current = null
    draggedRef.current = false
    interactionModeRef.current = 'idle'
    movingBagIdRef.current = null
    anchorPointRef.current = null
    setMovingBagId(null)
    setHoldTargetBagId(null)
    setDrag(null)
  }, [clearHoldTimer])

  useEffect(
    () => () => {
      clearHoldTimer()
      stopHoldProgress()
    },
    [clearHoldTimer, stopHoldProgress],
  )

  const canPlaceNew = !disabled && bags.length < bagsPerRound

  const beginReposition = useCallback((bag: BagThrow) => {
    stopHoldProgress()
    interactionModeRef.current = 'repositioning'
    movingBagIdRef.current = bag.id
    setMovingBagId(bag.id)
    setHoldTargetBagId(null)
    setDrag({
      x: bag.xNorm,
      y: bag.yNorm,
      rotationDeg: bag.rotationDeg,
      teamId: bag.teamId,
    })
  }, [stopHoldProgress])

  const beginPlace = useCallback(
    (rotationDeg = 0) => {
      const anchor = anchorPointRef.current
      if (!anchor) return

      interactionModeRef.current = 'placing'
      movingBagIdRef.current = null
      setMovingBagId(null)
      setHoldTargetBagId(null)
      setDrag({
        x: anchor.x,
        y: anchor.y,
        rotationDeg,
        teamId: nextTeamId,
      })
    },
    [nextTeamId],
  )

  const handlePointerDown = (e: React.PointerEvent) => {
    const point = resolvePoint(e.clientX, e.clientY)
    if (!point) return

    anchorPointRef.current = { x: point.x, y: point.y }

    e.currentTarget.setPointerCapture(e.pointerId)
    pointerIdRef.current = e.pointerId
    startClientRef.current = { x: e.clientX, y: e.clientY }
    draggedRef.current = false

    const hit =
      canReposition && onRepositionBag
        ? findBagAtPoint(bags, point.x, point.y)
        : undefined

    if (hit) {
      interactionModeRef.current = 'hold-pending'
      setHoldTargetBagId(hit.id)
      clearHoldTimer()
      startHoldProgress()
      holdTimerRef.current = setTimeout(() => {
        holdTimerRef.current = null
        if (
          interactionModeRef.current === 'hold-pending' &&
          pointerIdRef.current === e.pointerId
        ) {
          beginReposition(hit)
        }
      }, REPOSITION_HOLD_MS)
      return
    }

    if (!canPlaceNew) {
      interactionModeRef.current = 'idle'
      return
    }

    beginPlace()
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (pointerIdRef.current !== e.pointerId || !startClientRef.current) return

    const dx = e.clientX - startClientRef.current.x
    const dy = e.clientY - startClientRef.current.y
    if (!draggedRef.current && Math.hypot(dx, dy) > DRAG_THRESHOLD_PX) {
      draggedRef.current = true
    }

    const point = resolvePoint(e.clientX, e.clientY)
    if (!point) return

    const mode = interactionModeRef.current

    if (mode === 'hold-pending' && draggedRef.current && canPlaceNew) {
      clearHoldTimer()
      setHoldTargetBagId(null)
      const anchor = anchorPointRef.current
      if (anchor) {
        beginPlace(rotationFromPointer(point, anchor))
      }
      return
    }

    if (!drag) return

    const anchor = { x: drag.x, y: drag.y }

    if (mode === 'repositioning') {
      const rotationDeg = draggedRef.current
        ? rotationFromPointer(point, anchor)
        : drag.rotationDeg
      setDrag({
        ...drag,
        x: point.x,
        y: point.y,
        rotationDeg,
      })
      return
    }

    if (mode === 'placing') {
      setDrag({
        ...drag,
        rotationDeg: rotationFromPointer(point, anchor),
      })
    }
  }

  const handlePointerUp = (e: React.PointerEvent) => {
    if (pointerIdRef.current !== e.pointerId) return

    const point = resolvePoint(e.clientX, e.clientY)
    const mode = interactionModeRef.current
    const bagId = movingBagIdRef.current
    const anchor = anchorPointRef.current

    e.currentTarget.releasePointerCapture(e.pointerId)
    clearHoldTimer()

    if (mode === 'repositioning' && bagId && drag && onRepositionBag) {
      onRepositionBag(bagId, drag.x, drag.y, drag.rotationDeg)
    } else if (canPlaceNew && anchor && (mode === 'placing' || mode === 'hold-pending')) {
      const rotationDeg =
        drag?.rotationDeg ??
        (point ? rotationFromPointer(point, anchor) : 0)
      onPlaceBag(anchor.x, anchor.y, rotationDeg)
    }

    resetInteraction()
  }

  const handlePointerCancel = () => {
    resetInteraction()
  }

  return (
    <div className="w-full flex-1 flex justify-center items-stretch min-h-0">
      <svg
        ref={svgRef}
        viewBox={VIEWBOX}
        className="w-full max-w-sm touch-none select-none"
        style={{ aspectRatio: `${VIEW_WIDTH} / ${VIEW_HEIGHT}`, maxHeight: 'min(72dvh, 520px)' }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
      >
        <rect
          x={VIEW_MIN_X}
          y={VIEW_MIN_Y}
          width={VIEW_WIDTH}
          height={VIEW_HEIGHT}
          fill="var(--color-surface-cream)"
        />
        <rect
          x={BOARD_INSET_X}
          y={BOARD_INSET_Y}
          width={BOARD_WIDTH - BOARD_INSET_X * 2}
          height={BOARD_HEIGHT - BOARD_INSET_Y * 2}
          rx={BOARD_CORNER_RADIUS}
          fill="var(--color-board-tan)"
        />
        <circle
          cx={HOLE_CENTER_X}
          cy={HOLE_CENTER_Y}
          r={HOLE_RADIUS}
          fill="var(--color-hole)"
        />
        {bags.map((bag) =>
          bag.id === movingBagId ? null : (
            <BagMarker
              key={bag.id}
              x={bag.xNorm}
              y={bag.yNorm}
              rotationDeg={bag.rotationDeg}
              teamId={bag.teamId}
              holdProgress={
                bag.id === holdTargetBagId ? holdProgress : undefined
              }
            />
          ),
        )}
        {drag && (
          <BagMarker
            x={drag.x}
            y={drag.y}
            rotationDeg={drag.rotationDeg}
            teamId={drag.teamId}
            ghost={movingBagId == null}
          />
        )}
      </svg>
    </div>
  )
}
