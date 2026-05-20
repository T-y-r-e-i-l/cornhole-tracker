import {
  getFramePlayerKeys,
  getPlayerDisplayName,
} from '../../lib/doublesTurnOrder'
import { formatPlayerAvgPerRound } from '../../lib/playerStats'
import type { Game, PlayerSlotKey, TeamId } from '../../types/game'

interface ScoreboardMatchupLineProps {
  game: Game
  leftLabel: string
  rightLabel: string
  leftAvg: number | null
  rightAvg: number | null
  activeTeam?: TeamId
  activePlayerKey?: PlayerSlotKey | null
  isDoubles?: boolean
}

function Side({
  label,
  avg,
  align,
  active,
  teamColorClass,
}: {
  label: string
  avg: number | null
  align: 'left' | 'right'
  active: boolean
  teamColorClass: string
}) {
  return (
    <span
      className={[
        'truncate max-w-[42%] text-[0.625rem] font-bold uppercase tracking-wide',
        align === 'right' ? 'text-right' : 'text-left',
        active ? teamColorClass : 'text-ink-muted',
      ].join(' ')}
    >
      {label}
      {formatPlayerAvgPerRound(avg)}
    </span>
  )
}

export function ScoreboardMatchupLine({
  game,
  leftLabel,
  rightLabel,
  leftAvg,
  rightAvg,
  activeTeam,
  activePlayerKey,
  isDoubles,
}: ScoreboardMatchupLineProps) {
  if (isDoubles) {
    const [aKey, bKey] = getFramePlayerKeys(game.currentRoundIndex)
    return (
      <div className="flex items-center justify-between gap-2 w-full px-1">
        <Side
          label={getPlayerDisplayName(game, aKey)}
          avg={leftAvg}
          align="left"
          active={activePlayerKey === aKey}
          teamColorClass="text-team-red-deep"
        />
        <span className="text-ink-faint font-medium shrink-0 text-[0.625rem]">vs</span>
        <Side
          label={getPlayerDisplayName(game, bKey)}
          avg={rightAvg}
          align="right"
          active={activePlayerKey === bKey}
          teamColorClass="text-team-blue-deep"
        />
      </div>
    )
  }

  return (
    <p className="flex items-center justify-between gap-2 w-full px-1">
      <Side
        label={leftLabel}
        avg={leftAvg}
        align="left"
        active={activeTeam === 'A'}
        teamColorClass="text-team-red-deep"
      />
      <span className="text-ink-faint font-medium shrink-0">vs</span>
      <Side
        label={rightLabel}
        avg={rightAvg}
        align="right"
        active={activeTeam === 'B'}
        teamColorClass="text-team-blue-deep"
      />
    </p>
  )
}
