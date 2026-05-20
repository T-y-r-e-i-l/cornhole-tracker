import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ResumeGameCard } from '../components/home/ResumeGameCard'
import { AppShell } from '../components/layout/AppShell'
import { Button } from '../components/ui/Button'
import { Input, PlayerRow } from '../components/ui/Input'
import { PickToggle } from '../components/ui/PickToggle'
import { SegmentedControl } from '../components/ui/SegmentedControl'
import { useAuth } from '../contexts/AuthContext'
import { gameRepository } from '../db/gameRepository'
import {
  countOrphanGames,
  importOrphanGames,
  shouldShowOrphanPrompt,
  skipOrphanImport,
} from '../db/orphanGames'
import { formatGameTitle } from '../lib/display'
import { SOLO_MAX_SCORE, SOLO_ROUNDS } from '../lib/gameMode'
import type { GameMode, GameSummary, TeamId } from '../types/game'

function buildTeamName(players: string[], fallback: string) {
  const names = players.map((p) => p.trim()).filter(Boolean)
  if (names.length === 0) return fallback
  if (names.length === 1) return names[0]!
  return names.join(' & ')
}

type FirstThrowPlayerKey = 'A1' | 'A2' | 'B1' | 'B2'

function playerKeyToTeamId(key: FirstThrowPlayerKey): TeamId {
  return key.startsWith('B') ? 'B' : 'A'
}

function buildFirstThrowOptions(
  mode: 'singles' | 'doubles',
  players: { a1: string; a2: string; b1: string; b2: string },
) {
  const label = (name: string, fallback: string) => name.trim() || fallback

  if (mode === 'singles') {
    return [
      { value: 'A1' as const, label: label(players.a1, 'Team A') },
      { value: 'B1' as const, label: label(players.b1, 'Team B') },
    ]
  }

  return [
    { value: 'A1' as const, label: label(players.a1, 'Team A · Player 1') },
    { value: 'A2' as const, label: label(players.a2, 'Team A · Player 2') },
    { value: 'B1' as const, label: label(players.b1, 'Team B · Player 1') },
    { value: 'B2' as const, label: label(players.b2, 'Team B · Player 2') },
  ]
}

export function HomePage() {
  const navigate = useNavigate()
  const { user, signOut } = useAuth()
  const [playerA1, setPlayerA1] = useState('')
  const [playerA2, setPlayerA2] = useState('')
  const [playerB1, setPlayerB1] = useState('')
  const [playerB2, setPlayerB2] = useState('')
  const [soloPlayer, setSoloPlayer] = useState('')
  const [mode, setMode] = useState<GameMode>('doubles')
  const [firstThrowPlayerKey, setFirstThrowPlayerKey] =
    useState<FirstThrowPlayerKey>('A1')
  const [inProgress, setInProgress] = useState<GameSummary[]>([])
  const [creating, setCreating] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [orphanCount, setOrphanCount] = useState(0)
  const [importingOrphans, setImportingOrphans] = useState(false)

  const refreshInProgress = () => {
    gameRepository.listInProgress().then(setInProgress)
  }

  useEffect(() => {
    refreshInProgress()
  }, [])

  useEffect(() => {
    if (!shouldShowOrphanPrompt()) return
    countOrphanGames().then(setOrphanCount)
  }, [])

  async function handleImportOrphans() {
    setImportingOrphans(true)
    try {
      await importOrphanGames()
      setOrphanCount(0)
      refreshInProgress()
    } finally {
      setImportingOrphans(false)
    }
  }

  function handleSkipOrphans() {
    skipOrphanImport()
    setOrphanCount(0)
  }

  const isSolo = mode === 'solo'

  const teamAName = isSolo
    ? soloPlayer.trim() || 'Player'
    : buildTeamName(
        mode === 'doubles' ? [playerA1, playerA2] : [playerA1],
        'Team A',
      )
  const teamBName = buildTeamName(
    mode === 'doubles' ? [playerB1, playerB2] : [playerB1],
    'Team B',
  )

  const firstThrowOptions = useMemo(
    () =>
      mode === 'solo'
        ? []
        : buildFirstThrowOptions(mode, {
            a1: playerA1,
            a2: playerA2,
            b1: playerB1,
            b2: playerB2,
          }),
    [mode, playerA1, playerA2, playerB1, playerB2],
  )

  useEffect(() => {
    if (mode === 'solo') return
    const valid = firstThrowOptions.map((o) => o.value)
    if (!valid.includes(firstThrowPlayerKey)) {
      setFirstThrowPlayerKey(valid[0]!)
    }
  }, [firstThrowOptions, firstThrowPlayerKey, mode])

  const firstThrowTeamId = playerKeyToTeamId(firstThrowPlayerKey)

  async function handleDeleteGame(gameId: string) {
    const game = inProgress.find((g) => g.id === gameId)
    const label = game ? formatGameTitle(game) : 'this game'
    if (!window.confirm(`Delete ${label}? This cannot be undone.`)) return

    setDeletingId(gameId)
    try {
      await gameRepository.deleteGame(gameId)
      refreshInProgress()
    } finally {
      setDeletingId(null)
    }
  }

  async function handleStart() {
    setCreating(true)
    try {
      const game = await gameRepository.createGame({
        mode,
        teamAName,
        teamBName: isSolo ? 'Solo' : teamBName,
        firstThrowTeamId: isSolo ? 'A' : firstThrowTeamId,
        firstThrowPlayerKey: isSolo ? undefined : firstThrowPlayerKey,
        playerA1Name: isSolo ? soloPlayer : playerA1,
        playerA2Name: mode === 'doubles' ? playerA2 : undefined,
        playerB1Name: isSolo ? undefined : playerB1,
        playerB2Name: mode === 'doubles' ? playerB2 : undefined,
      })
      navigate(`/game/${game.id}`)
    } finally {
      setCreating(false)
    }
  }

  return (
    <AppShell
      title="Cornhole Tracker"
      theme="light"
      inverseHeader
      actions={
        <div className="flex flex-col items-end gap-0.5 text-xs font-bold tracking-widest uppercase">
          <Link to="/history">History</Link>
          <button
            type="button"
            onClick={() => void signOut()}
            className="text-white/70 hover:text-white"
          >
            Sign out
          </button>
        </div>
      }
    >
      <section className="w-full flex-1 space-y-6">
        {user?.email && (
          <p className="text-xs text-ink-muted text-center">Signed in as {user.email}</p>
        )}

        {orphanCount > 0 && (
          <div className="w-full border-2 border-team-blue-deep rounded-lg bg-team-blue/10 p-4 space-y-3">
            <p className="text-sm text-ink leading-relaxed">
              Import {orphanCount} game{orphanCount === 1 ? '' : 's'} from this device to your
              account? They will sync to the cloud.
            </p>
            <div className="flex gap-2">
              <Button fullWidth onClick={handleImportOrphans} disabled={importingOrphans}>
                {importingOrphans ? 'Importing…' : 'Import'}
              </Button>
              <Button variant="ghost-light" fullWidth onClick={handleSkipOrphans}>
                Skip
              </Button>
            </div>
          </div>
        )}

        <div className="w-full border-2 border-ink rounded-lg bg-white p-4 space-y-5">
          <h2 className="text-base font-extrabold uppercase tracking-wide text-ink">
            New game
          </h2>

          <SegmentedControl
            theme="light"
            label="Mode"
            value={mode}
            onChange={setMode}
            options={[
              { value: 'singles', label: 'Singles' },
              { value: 'doubles', label: 'Doubles' },
              { value: 'solo', label: 'Solo' },
            ]}
          />

          {isSolo ? (
            <>
              <Input
                theme="light"
                label="Player"
                value={soloPlayer}
                onChange={(e) => setSoloPlayer(e.target.value)}
                placeholder="Your name"
              />
              <p className="text-xs text-ink-muted text-center leading-relaxed uppercase tracking-wide">
                {SOLO_ROUNDS} rounds · 4 bags · max {SOLO_MAX_SCORE} pts
              </p>
            </>
          ) : (
            <>
              <PlayerRow
                label="Team A"
                values={mode === 'doubles' ? [playerA1, playerA2] : [playerA1]}
                placeholders={mode === 'doubles' ? ['Player 1', 'Player 2'] : ['Name']}
                onChange={(i, v) => (i === 0 ? setPlayerA1(v) : setPlayerA2(v))}
              />

              <PlayerRow
                label="Team B"
                values={mode === 'doubles' ? [playerB1, playerB2] : [playerB1]}
                placeholders={mode === 'doubles' ? ['Player 1', 'Player 2'] : ['Name']}
                onChange={(i, v) => (i === 0 ? setPlayerB1(v) : setPlayerB2(v))}
              />

              <PickToggle
                label="Throwing first"
                value={firstThrowPlayerKey}
                onChange={(v) => setFirstThrowPlayerKey(v as FirstThrowPlayerKey)}
                options={firstThrowOptions}
              />
            </>
          )}

          <Button fullWidth onClick={handleStart} disabled={creating}>
            {creating ? 'Starting…' : 'Start game'}
          </Button>
        </div>
      </section>

      {inProgress.length > 0 && (
        <section className="w-full space-y-3 pb-2">
          <h2 className="text-base font-extrabold uppercase tracking-wide text-ink">
            Resume game
          </h2>
          <ul className="space-y-3">
            {inProgress.map((g) => (
              <li key={g.id}>
                <ResumeGameCard
                  game={g}
                  onDelete={handleDeleteGame}
                  deleting={deletingId === g.id}
                />
              </li>
            ))}
          </ul>
        </section>
      )}
    </AppShell>
  )
}
