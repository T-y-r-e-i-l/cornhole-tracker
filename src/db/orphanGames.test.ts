import { beforeEach, describe, expect, it, vi } from 'vitest'
import { db } from './schema'
import {
  countOrphanGames,
  importOrphanGames,
  skipOrphanImport,
  shouldShowOrphanPrompt,
} from './orphanGames'
import { setCurrentUserId, resetCurrentUserForTests } from '../lib/currentUser'
import type { Game } from '../types/game'

vi.mock('./syncService', () => ({
  markGamePending: vi.fn(),
  pushGame: vi.fn(),
}))

const USER = 'user-aaaa-bbbb-cccc-dddddddddddd'

function orphanGame(id: string): Game {
  const now = new Date().toISOString()
  return {
    id,
    userId: null,
    createdAt: now,
    updatedAt: now,
    mode: 'singles',
    teamAName: 'A',
    teamBName: 'B',
    scoreA: 0,
    scoreB: 0,
    status: 'completed',
    currentRoundIndex: 1,
    currentThrowIndex: 0,
    nextTeamId: 'A',
    firstThrowTeamId: 'A',
    roundFirstTeamId: 'A',
    avgPointsA: 1,
    avgPointsB: 0,
    completedAt: now,
    syncStatus: 'local',
    remoteId: null,
  }
}

describe('orphanGames', () => {
  beforeEach(async () => {
    resetCurrentUserForTests()
    localStorage.clear()
    await db.games.clear()
  })

  it('counts games without userId', async () => {
    await db.games.bulkAdd([orphanGame('o1'), orphanGame('o2')])
    expect(await countOrphanGames()).toBe(2)
  })

  it('imports orphans and assigns current user', async () => {
    await db.games.add(orphanGame('o1'))
    setCurrentUserId(USER)
    const count = await importOrphanGames()
    expect(count).toBe(1)
    const game = await db.games.get('o1')
    expect(game?.userId).toBe(USER)
    expect(game?.syncStatus).toBe('pending')
  })

  it('skip sets flag so prompt is hidden', () => {
    expect(shouldShowOrphanPrompt()).toBe(true)
    skipOrphanImport()
    expect(shouldShowOrphanPrompt()).toBe(false)
  })
})
