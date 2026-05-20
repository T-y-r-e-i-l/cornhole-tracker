import { Link } from 'react-router-dom'
import { BagTracker, padScore } from '../game/BagTracker'
import type { GameSummary } from '../../types/game'
import { isSoloGame } from '../../lib/gameMode'

interface ResumeGameCardProps {
  game: GameSummary
  onDelete?: (gameId: string) => void
  deleting?: boolean
}

export function ResumeGameCard({ game, onDelete, deleting }: ResumeGameCardProps) {
  const solo = isSoloGame(game)

  return (
    <div className="relative w-full rounded-lg border-2 border-ink bg-white hover:bg-surface-cream-muted transition">
      {onDelete && (
        <button
          type="button"
          disabled={deleting}
          aria-label="Delete game"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            onDelete(game.id)
          }}
          className="absolute top-2 right-2 z-10 min-h-9 min-w-9 flex items-center justify-center rounded-lg text-ink-muted hover:text-ink hover:bg-ink/5 disabled:opacity-40"
        >
          {deleting ? (
            <span className="text-xs font-bold">…</span>
          ) : (
            <span className="text-lg leading-none" aria-hidden>
              ×
            </span>
          )}
        </button>
      )}

      <Link
        to={`/game/${game.id}`}
        className="block p-4 pr-12"
      >
        <div className="flex items-start gap-3">
          {!solo && (
            <BagTracker used={0} total={4} colorClass="bg-team-red" />
          )}

          <div className="flex-1 text-center min-w-0 pt-1">
            <p className="text-4xl font-extrabold tabular-nums tracking-tight text-ink">
              {solo ? (
                padScore(game.scoreA)
              ) : (
                <>
                  {padScore(game.scoreA)}
                  <span className="mx-2 text-ink/25 font-light">-</span>
                  {padScore(game.scoreB)}
                </>
              )}
            </p>
          </div>

          {!solo && <BagTracker used={0} total={4} colorClass="bg-team-blue" />}
        </div>

        {!solo && (
          <div className="mt-3 flex justify-between gap-2 text-[0.625rem] font-semibold uppercase tracking-wide text-ink-muted">
            <span className="truncate max-w-[45%]">{game.teamAName}</span>
            <span className="truncate max-w-[45%] text-right">{game.teamBName}</span>
          </div>
        )}

        {solo && (
          <p className="mt-3 text-center text-[0.625rem] font-semibold uppercase tracking-wide text-ink-muted truncate">
            {game.teamAName}
          </p>
        )}
      </Link>
    </div>
  )
}
