import { useCallback, useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { AppShell } from '../components/layout/AppShell'
import { BoardCanvas } from '../components/board/BoardCanvas'
import { ReplayControls } from '../components/replay/ReplayControls'
import { gameRepository } from '../db/gameRepository'
import type { BagThrow, GameWithDetails } from '../types/game'
import { isSoloGame } from '../lib/gameMode'
import { sumRawPoints } from '../lib/scoring'

export function ReplayPage() {
  const { id } = useParams<{ id: string }>()
  const [game, setGame] = useState<GameWithDetails | null>(null)
  const [allBags, setAllBags] = useState<BagThrow[]>([])
  const [roundIndex, setRoundIndex] = useState(0)
  const [step, setStep] = useState(0)

  const load = useCallback(async () => {
    if (!id) return
    const data = await gameRepository.getGame(id)
    const bags = await gameRepository.getAllBags(id)
    setGame(data)
    setAllBags(bags)
    if (data) {
      const indices = [
        ...data.rounds.map((r) => r.index),
        ...(data.currentRoundBags.length > 0 ? [data.currentRoundIndex] : []),
      ]
      setRoundIndex(indices.length > 0 ? Math.max(...indices) : 0)
    }
  }, [id])

  useEffect(() => {
    load()
  }, [load])

  const roundBags = useMemo(
    () =>
      allBags
        .filter((b) => b.roundIndex === roundIndex)
        .sort((a, b) => a.sequence - b.sequence),
    [allBags, roundIndex],
  )

  const visibleBags = useMemo(() => roundBags.slice(0, step), [roundBags, step])
  const currentBag = roundBags[step - 1]

  useEffect(() => {
    setStep(0)
  }, [roundIndex])

  const runningRaw = useMemo(() => {
    const partial = roundBags.slice(0, step)
    return {
      A: sumRawPoints(partial, 'A'),
      B: sumRawPoints(partial, 'B'),
    }
  }, [roundBags, step])

  if (!game) {
    return (
      <AppShell title="Replay" theme="light" backTo="/">
        <p className="text-ink-muted">Loading…</p>
      </AppShell>
    )
  }

  const roundOptions = Array.from(
    new Set([
      ...game.rounds.map((r) => r.index),
      ...(game.currentRoundBags.length > 0 ? [game.currentRoundIndex] : []),
    ]),
  ).sort((a, b) => a - b)

  const teamName =
    currentBag?.teamId === 'A' ? game.teamAName : game.teamBName

  return (
    <AppShell title="Replay" theme="light" backTo={`/game/${game.id}`}>
      <label className="w-full max-w-md">
        <span className="label-caps text-ink-muted">Round</span>
        <select
          value={roundIndex}
          onChange={(e) => setRoundIndex(Number(e.target.value))}
          className="mt-1 w-full min-h-11 rounded-xl border border-ink/15 bg-surface-cream-muted px-3 text-ink focus:outline-none focus:ring-2 focus:ring-mint/40"
        >
          {roundOptions.map((idx) => (
            <option key={idx} value={idx}>
              Round {idx + 1}
              {idx === game.currentRoundIndex && game.status === 'in_progress'
                ? ' (current)'
                : ''}
            </option>
          ))}
        </select>
      </label>

      <div className="w-full max-w-md text-sm text-center min-h-[3rem] text-ink">
        {step === 0 ? (
          <p className="text-ink-muted">Press Next to step through bags</p>
        ) : (
          <p>
            <span className="font-semibold">
              {isSoloGame(game) ? game.teamAName : teamName}
            </span>{' '}
            · {currentBag?.rawPoints} pts
            {!isSoloGame(game) && (
              <>
                {' '}
                · Raw {runningRaw.A}–{runningRaw.B}
              </>
            )}
            {isSoloGame(game) && (
              <>
                {' '}
                · Round {runningRaw.A} pts
              </>
            )}
          </p>
        )}
      </div>

      <BoardCanvas
        bags={visibleBags}
        mode={game.mode}
        nextTeamId="A"
        disabled
        onPlaceBag={() => {}}
      />

      <ReplayControls
        step={step}
        maxStep={roundBags.length}
        onPrev={() => setStep((s) => Math.max(0, s - 1))}
        onNext={() => setStep((s) => Math.min(roundBags.length, s + 1))}
        onSlider={setStep}
      />
    </AppShell>
  )
}
