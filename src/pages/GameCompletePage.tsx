import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { AppShell } from '../components/layout/AppShell'
import { Button } from '../components/ui/Button'
import { gameRepository } from '../db/gameRepository'
import { getGameCompleteSummary } from '../lib/gameStats'
import type { GameWithDetails } from '../types/game'

export function GameCompletePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [game, setGame] = useState<GameWithDetails | null>(null)
  const [startingRematch, setStartingRematch] = useState(false)

  const load = useCallback(async () => {
    if (!id) return
    const data = await gameRepository.getGame(id)
    if (!data) {
      navigate('/')
      return
    }
    if (data.status === 'in_progress') {
      navigate(`/game/${id}`)
      return
    }
    setGame(data)
  }, [id, navigate])

  useEffect(() => {
    load()
  }, [load])

  async function handlePlayAgain() {
    if (!id) return
    setStartingRematch(true)
    try {
      const next = await gameRepository.createRematch(id)
      if (next) navigate(`/game/${next.id}`)
    } finally {
      setStartingRematch(false)
    }
  }

  if (!game) {
    return (
      <AppShell title="Game complete" theme="dark">
        <p className="text-on-dark-muted">Loading…</p>
      </AppShell>
    )
  }

  const summary = getGameCompleteSummary(game)

  return (
    <AppShell title="Game complete" theme="dark" hideHeader>
      <div className="w-full flex-1 flex flex-col items-center gap-6 py-4">
        <div className="w-full text-center space-y-2">
          <p className="label-caps text-mint">{summary.modeLabel}</p>
          <h2 className="text-2xl font-bold uppercase tracking-wide">{summary.headline}</h2>
          <p className="text-on-dark-muted">{summary.title}</p>
          <p className="text-6xl font-extrabold tabular-nums mt-4">{summary.finalScore}</p>
        </div>

        <ul className="w-full rounded-2xl border border-on-dark/10 bg-surface-dark-elevated divide-y divide-on-dark/10">
          {summary.stats.map((stat) => (
            <li
              key={stat.label}
              className="flex items-center justify-between gap-4 px-4 py-3.5 text-sm"
            >
              <span className="text-on-dark-muted">{stat.label}</span>
              <span className="font-semibold tabular-nums text-right">{stat.value}</span>
            </li>
          ))}
        </ul>

        <div className="w-full space-y-3 mt-auto pb-2">
          <Link to={`/game/${game.id}/review`} className="block w-full">
            <Button fullWidth variant="mint">
              Watch replay
            </Button>
          </Link>
          <Button
            fullWidth
            variant="outline-dark"
            onClick={handlePlayAgain}
            disabled={startingRematch}
          >
            {startingRematch ? 'Starting…' : 'Play again'}
          </Button>
          <Link to="/" className="block w-full">
            <Button fullWidth variant="outline-dark">
              Main Menu
            </Button>
          </Link>
        </div>
      </div>
    </AppShell>
  )
}
