import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AppShell } from '../components/layout/AppShell'
import { gameRepository } from '../db/gameRepository'
import { formatGameScore, formatGameTitle, formatModeLabel } from '../lib/display'
import { isSoloGame } from '../lib/gameMode'
import type { GameSummary } from '../types/game'

function formatDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

export function HistoryPage() {
  const [games, setGames] = useState<GameSummary[]>([])

  useEffect(() => {
    gameRepository.listGames().then(setGames)
  }, [])

  return (
    <AppShell title="History" theme="dark" backTo="/">
      {games.length === 0 ? (
        <p className="text-on-dark-muted text-center">No games yet.</p>
      ) : (
        <ul className="w-full space-y-3">
          {games.map((g) => (
            <li key={g.id}>
              <Link
                to={`/history/${g.id}`}
                className="block rounded-2xl border border-on-dark/10 bg-surface-dark-elevated px-4 py-4 hover:border-mint/40 transition"
              >
                <div className="flex justify-between items-start gap-2 mb-2">
                  <span className="font-semibold text-sm truncate">
                    {formatGameTitle(g)}
                  </span>
                  <span
                    className={[
                      'text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide shrink-0',
                      g.status === 'completed'
                        ? 'bg-on-dark/10 text-on-dark-muted'
                        : 'bg-mint/20 text-mint',
                    ].join(' ')}
                  >
                    {g.status === 'completed' ? 'Final' : 'Live'}
                  </span>
                </div>
                <p className="text-xs text-on-dark-muted mb-1">{formatModeLabel(g.mode)}</p>
                <p className="text-3xl font-extrabold tabular-nums">{formatGameScore(g)}</p>
                <p className="text-sm text-on-dark-muted mt-2">{formatDate(g.createdAt)}</p>
                {g.avgPointsA != null && (
                  <p className="text-xs text-on-dark-muted mt-2">
                    Avg/round · {g.avgPointsA}
                    {!isSoloGame(g) && g.avgPointsB != null && ` / ${g.avgPointsB}`}
                  </p>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </AppShell>
  )
}
