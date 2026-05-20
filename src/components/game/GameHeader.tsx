import type { BagThrow, Game, Round } from '../../types/game'
import { BAGS_PER_TEAM } from '../../types/game'
import {
  getActivePlayerKey,
  getFramePlayerKeys,
} from '../../lib/doublesTurnOrder'
import {
  getTotalRounds,
  isDoublesMode,
  isSoloGame,
  soloAvgPerRoundSoFar,
} from '../../lib/gameMode'
import {
  computeDoublesPlayerAvgPerRound,
  computeTeamRawAvgPerRound,
} from '../../lib/playerStats'
import { computeRoundAwarded, sumRawPoints } from '../../lib/scoring'
import { padScore } from './BagTracker'
import { ScoreboardMatchupLine } from './ScoreboardMatchupLine'
import { TeamStripeBlock } from './TeamStripeBlock'

interface GameHeaderProps {
  game: Game
  bags: BagThrow[]
  allBags?: BagThrow[]
  rounds?: Round[]
  roundComplete: boolean
  onSubmit?: () => void
  submitting?: boolean
}

function SoloGameHeader({
  game,
  bags,
  roundComplete,
  onSubmit,
  submitting,
}: GameHeaderProps) {
  const roundPoints = sumRawPoints(bags, 'A')
  const bagNumber = bags.length + 1
  const totalRounds = getTotalRounds('solo')!
  const roundNum = game.currentRoundIndex + 1
  const avgPerRound = soloAvgPerRoundSoFar(game.scoreA, game.currentRoundIndex)

  return (
    <header className="w-full max-w-md space-y-2 px-1 shrink-0">
      <p className="text-sm font-bold tracking-wide text-ink uppercase text-center">
        {roundComplete ? `Round ${roundNum} · End` : `${game.teamAName}'s turn`}
      </p>

      <div className="flex items-center justify-center gap-4">
        <TeamStripeBlock
          used={bags.length}
          total={4}
          colorClass="bg-team-red"
        />
        <div className="text-center min-w-[8rem]">
          {roundComplete ? (
            <div className="space-y-2">
              <p className="text-4xl font-extrabold tabular-nums text-team-red-deep">
                +{roundPoints}
              </p>
              <button
                type="button"
                onClick={onSubmit}
                disabled={submitting}
                className="w-full min-h-11 px-4 rounded-2xl bg-mint text-ink text-xs font-bold tracking-widest uppercase hover:bg-mint-hover disabled:opacity-50"
              >
                {submitting ? '…' : 'Submit'}
              </button>
            </div>
          ) : (
            <p className="text-5xl font-extrabold tabular-nums tracking-tight text-ink">
              {padScore(game.scoreA)}
            </p>
          )}
        </div>
        <div className="w-11 shrink-0" aria-hidden />
      </div>

      <p className="text-center text-[0.625rem] font-bold uppercase tracking-wide text-ink-muted">
        {game.teamAName}
        {avgPerRound != null ? ` (${avgPerRound})` : ''}
      </p>

      {!roundComplete && (
        <p className="label-caps text-ink-muted text-center">
          Round {roundNum}/{totalRounds} · Bag {bagNumber}/4
        </p>
      )}

      {roundComplete && (
        <p className="text-center text-xs text-ink-muted tabular-nums">
          Total after submit: {game.scoreA + roundPoints}
        </p>
      )}
    </header>
  )
}

function CompetitiveGameHeader({
  game,
  bags,
  allBags = [],
  rounds = [],
  roundComplete,
  onSubmit,
  submitting,
}: GameHeaderProps) {
  const rawA = sumRawPoints(bags, 'A')
  const rawB = sumRawPoints(bags, 'B')
  const { awardedA, awardedB } = computeRoundAwarded(rawA, rawB)

  const isDoubles = isDoublesMode(game.mode)
  const activePlayerKey = isDoubles ? getActivePlayerKey(game) : null
  const playerAvgs = isDoubles
    ? computeDoublesPlayerAvgPerRound(game, rounds, allBags)
    : undefined
  const teamAvgs = computeTeamRawAvgPerRound(game, rounds, bags)

  const activeTeam = game.nextTeamId
  const bagsA = bags.filter((b) => b.teamId === 'A').length
  const bagsB = bags.filter((b) => b.teamId === 'B').length
  const teamColorLabel = activeTeam === 'A' ? 'RED' : 'BLUE'
  const turnLabel = `${teamColorLabel} team's turn`

  const [aKey, bKey] = isDoubles
    ? getFramePlayerKeys(game.currentRoundIndex)
    : (['A1', 'B1'] as const)

  return (
    <header className="w-full max-w-md space-y-2 px-1 shrink-0">
      <p className="text-sm font-bold tracking-wide text-ink uppercase text-center">
        {roundComplete ? `Round ${game.currentRoundIndex + 1} · End` : turnLabel}
      </p>

      <div className="flex items-center justify-center gap-4">
        <TeamStripeBlock
          used={bagsA}
          total={BAGS_PER_TEAM}
          colorClass="bg-team-red"
        />

        <div className="text-center min-w-[8.5rem] shrink-0">
          {roundComplete ? (
            <div className="flex items-center justify-center gap-2">
              <span className="text-4xl font-extrabold tabular-nums text-team-red-deep">
                {padScore(rawA)}
              </span>
              <button
                type="button"
                onClick={onSubmit}
                disabled={submitting}
                className="min-h-11 px-3 rounded-2xl bg-mint text-ink text-xs font-bold tracking-widest uppercase hover:bg-mint-hover disabled:opacity-50 shrink-0"
              >
                {submitting ? '…' : 'Submit'}
              </button>
              <span className="text-4xl font-extrabold tabular-nums text-team-blue-deep">
                {padScore(rawB)}
              </span>
            </div>
          ) : (
            <p className="text-5xl font-extrabold tabular-nums tracking-tight text-ink whitespace-nowrap">
              {padScore(game.scoreA)}
              <span className="mx-2 text-ink/25 font-light">-</span>
              {padScore(game.scoreB)}
            </p>
          )}
        </div>

        <TeamStripeBlock
          used={bagsB}
          total={BAGS_PER_TEAM}
          colorClass="bg-team-blue"
        />
      </div>

      <ScoreboardMatchupLine
        game={game}
        leftLabel={game.teamAName}
        rightLabel={game.teamBName}
        leftAvg={isDoubles ? playerAvgs?.[aKey] ?? null : teamAvgs.A}
        rightAvg={isDoubles ? playerAvgs?.[bKey] ?? null : teamAvgs.B}
        activeTeam={activeTeam}
        activePlayerKey={activePlayerKey}
        isDoubles={isDoubles}
      />

      {!roundComplete && (
        <p className="label-caps text-ink-muted text-center">
          Round {game.currentRoundIndex + 1} · Bag{' '}
          {bags.filter((b) => b.teamId === activeTeam).length + 1}
        </p>
      )}

      {roundComplete && (
        <p className="text-center text-xs text-ink-muted">
          Awarded +{awardedA} / +{awardedB} · Total{' '}
          {padScore(game.scoreA + awardedA)}–{padScore(game.scoreB + awardedB)}
        </p>
      )}
    </header>
  )
}

export function GameHeader(props: GameHeaderProps) {
  if (isSoloGame(props.game)) {
    return <SoloGameHeader {...props} />
  }
  return <CompetitiveGameHeader {...props} />
}
