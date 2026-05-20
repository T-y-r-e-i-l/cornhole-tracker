import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AppShell } from '../components/layout/AppShell'
import { Button } from '../components/ui/Button'
import { gameRepository } from '../db/gameRepository'
import { formatGameScore, formatGameTitle, formatModeLabel } from '../lib/display'
import { isSoloGame } from '../lib/gameMode'
import type { GameWithDetails } from '../types/game'
import { computeAvgPointsPerRound, computeSoloAvgPerRound } from '../lib/stats'

function formatDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

export function HistoryDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [game, setGame] = useState<GameWithDetails | null>(null)

  useEffect(() => {
    if (id) gameRepository.getGame(id).then(setGame)
  }, [id])

  if (!game) {
    return (
      <AppShell title="Game" theme="dark" backTo="/history">
        <p className="text-on-dark-muted">Loading…</p>
      </AppShell>
    )
  }

  const solo = isSoloGame(game)
  const avgA = solo
    ? (game.avgPointsA ?? computeSoloAvgPerRound(game.rounds))
    : (game.avgPointsA ?? computeAvgPointsPerRound(game.rounds, 'A'))
  const avgB = solo ? null : (game.avgPointsB ?? computeAvgPointsPerRound(game.rounds, 'B'))

  return (
    <AppShell title="Game" theme="dark" backTo="/history">
      <div className="w-full text-center">
        <p className="label-caps text-on-dark-muted">{formatModeLabel(game.mode)}</p>
        <h2 className="text-lg font-bold uppercase tracking-wide mt-1">
          {formatGameTitle(game)}
        </h2>
        <p className="text-5xl font-extrabold tabular-nums mt-3">{formatGameScore(game)}</p>
        <p className="text-sm text-on-dark-muted mt-2">{formatDate(game.createdAt)}</p>
      </div>

      {avgA != null && (
        <div
          className={[
            'w-full gap-3',
            solo ? 'flex justify-center' : 'grid grid-cols-2',
          ].join(' ')}
        >
          <div className="rounded-2xl bg-surface-dark-elevated border border-on-dark/10 p-4 text-center min-w-[8rem]">
            <p className="label-caps text-on-dark-muted">
              {solo ? 'Player' : game.teamAName}
            </p>
            <p className="text-2xl font-bold mt-1">{avgA}</p>
            <p className="text-xs text-on-dark-muted mt-1">avg / round</p>
          </div>
          {!solo && avgB != null && (
            <div className="rounded-2xl bg-surface-dark-elevated border border-on-dark/10 p-4 text-center">
              <p className="label-caps text-on-dark-muted">{game.teamBName}</p>
              <p className="text-2xl font-bold mt-1">{avgB}</p>
              <p className="text-xs text-on-dark-muted mt-1">avg / round</p>
            </div>
          )}
        </div>
      )}

      {game.status === 'completed' && (
        <Link to={`/game/${game.id}/complete`} className="w-full">
          <Button fullWidth variant="mint">
            View summary
          </Button>
        </Link>
      )}

      <Link to={`/game/${game.id}/review`} className="w-full">
        <Button fullWidth variant={game.status === 'completed' ? 'outline-dark' : 'mint'}>
          Watch replay
        </Button>
      </Link>

      {game.status === 'in_progress' && (
        <Link to={`/game/${game.id}`} className="w-full">
          <Button fullWidth variant="outline-dark">
            Continue game
          </Button>
        </Link>
      )}

      <section className="w-full">
        <h3 className="label-caps text-on-dark-muted mb-3">Rounds</h3>
        {game.rounds.length === 0 ? (
          <p className="text-on-dark-muted text-sm">No completed rounds yet.</p>
        ) : (
          <div className="rounded-2xl border border-on-dark/10 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="label-caps text-on-dark-muted bg-surface-dark-elevated text-left">
                  <th className="py-2.5 px-3">#</th>
                  <th className="py-2.5 px-3">{solo ? 'Points' : 'Raw'}</th>
                  {!solo && <th className="py-2.5 px-3">+</th>}
                </tr>
              </thead>
              <tbody>
                {game.rounds.map((r) => (
                  <tr key={r.id} className="border-t border-on-dark/10">
                    <td className="py-2.5 px-3">{r.index + 1}</td>
                    <td className="py-2.5 px-3 font-mono tabular-nums">
                      {solo ? r.rawPointsA : `${r.rawPointsA}–${r.rawPointsB}`}
                    </td>
                    {!solo && (
                      <td className="py-2.5 px-3 font-mono tabular-nums text-mint">
                        +{r.awardedA}/+{r.awardedB}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </AppShell>
  )
}
