import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { AppShell } from '../components/layout/AppShell'
import { BoardCanvas } from '../components/board/BoardCanvas'
import { GameHeader } from '../components/game/GameHeader'
import { gameRepository } from '../db/gameRepository'
import { getBagsPerRound } from '../lib/gameMode'
import type { GameWithDetails } from '../types/game'

export function GamePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [game, setGame] = useState<GameWithDetails | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [undoing, setUndoing] = useState(false)

  const load = useCallback(async () => {
    if (!id) return
    const data = await gameRepository.getGame(id)
    setGame(data)
  }, [id])

  useEffect(() => {
    load()
  }, [load])

  const handlePlaceBag = async (x: number, y: number, rotationDeg: number) => {
    if (!id || !game || game.status !== 'in_progress') return
    await gameRepository.placeBag({ gameId: id, xNorm: x, yNorm: y, rotationDeg })
    const updated = await gameRepository.getGame(id)
    setGame(updated)
  }

  const handleRepositionBag = async (
    bagId: string,
    x: number,
    y: number,
    rotationDeg: number,
  ) => {
    if (!id || !game || game.status !== 'in_progress') return
    await gameRepository.repositionBag({
      gameId: id,
      bagId,
      xNorm: x,
      yNorm: y,
      rotationDeg,
    })
    const updated = await gameRepository.getGame(id)
    setGame(updated)
  }

  const handleUndo = async () => {
    if (!id || !game || game.status !== 'in_progress') return
    setUndoing(true)
    try {
      await gameRepository.undoLastBag(id)
      await load()
    } finally {
      setUndoing(false)
    }
  }

  const handleSubmitRound = async () => {
    if (!id) return
    setSubmitting(true)
    try {
      const updated = await gameRepository.submitRound(id)
      if (updated?.status === 'completed') {
        navigate(`/game/${id}/complete`)
      } else {
        await load()
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (!game) {
    return (
      <AppShell title="Loading" theme="light" backTo="/">
        <p className="text-ink-muted">Loading game…</p>
      </AppShell>
    )
  }

  const bags = game.currentRoundBags
  const bagsPerRound = getBagsPerRound(game.mode)
  const roundComplete = game.currentThrowIndex >= bagsPerRound
  const canPlace = game.status === 'in_progress' && !roundComplete
  const canReposition = game.status === 'in_progress' && bags.length > 0
  const canUndo = game.status === 'in_progress' && bags.length > 0

  return (
    <AppShell theme="light" hideHeader backTo="/">
      <div className="w-full flex items-center justify-between shrink-0 mb-2">
        <Link
          to="/"
          className="text-2xl font-light text-ink min-h-11 min-w-11 flex items-center justify-center -ml-2"
          aria-label="Back to menu"
        >
          ←
        </Link>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleUndo}
            disabled={!canUndo || undoing}
            className="text-xs font-semibold text-ink-muted min-h-11 px-3 disabled:opacity-40"
          >
            {undoing ? '…' : 'Undo'}
          </button>
          <Link
            to={`/game/${game.id}/review`}
            className="text-xs font-semibold text-ink-muted min-h-11 flex items-center"
          >
            Review
          </Link>
        </div>
      </div>

      <GameHeader
        game={game}
        bags={bags}
        allBags={game.allBags}
        rounds={game.rounds}
        roundComplete={roundComplete}
        onSubmit={handleSubmitRound}
        submitting={submitting}
      />

      <BoardCanvas
        bags={bags}
        mode={game.mode}
        disabled={!canPlace}
        canReposition={canReposition}
        nextTeamId={game.nextTeamId}
        onPlaceBag={handlePlaceBag}
        onRepositionBag={handleRepositionBag}
      />
    </AppShell>
  )
}
