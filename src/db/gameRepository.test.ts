import { beforeEach, describe, expect, it, vi } from 'vitest'
import { db } from './schema'
import { gameRepository } from './gameRepository'
import { setCurrentUserId, resetCurrentUserForTests } from '../lib/currentUser'
import type { Game } from '../types/game'

vi.mock('./syncService', () => ({
  afterGameMutation: vi.fn(),
  deleteGameRemote: vi.fn(),
}))

const USER_A = 'user-a-1111-1111-1111-111111111111'
const USER_B = 'user-b-2222-2222-2222-222222222222'

function makeGame(overrides: Partial<Game> = {}): Game {
  const now = new Date().toISOString()
  return {
    id: overrides.id ?? 'game-1',
    userId: overrides.userId ?? USER_A,
    createdAt: now,
    updatedAt: now,
    mode: 'singles',
    teamAName: 'A',
    teamBName: 'B',
    scoreA: 0,
    scoreB: 0,
    status: 'in_progress',
    currentRoundIndex: 0,
    currentThrowIndex: 0,
    nextTeamId: 'A',
    firstThrowTeamId: 'A',
    roundFirstTeamId: 'A',
    avgPointsA: null,
    avgPointsB: null,
    completedAt: null,
    syncStatus: 'pending',
    remoteId: null,
    ...overrides,
  }
}

describe('gameRepository user scoping', () => {
  beforeEach(async () => {
    resetCurrentUserForTests()
    await db.games.clear()
    await db.rounds.clear()
    await db.bagThrows.clear()
  })

  it('lists only games for the signed-in user', async () => {
    await db.games.bulkAdd([
      makeGame({ id: 'g1', userId: USER_A }),
      makeGame({ id: 'g2', userId: USER_B }),
      makeGame({ id: 'g3', userId: USER_A, status: 'completed' }),
    ])

    setCurrentUserId(USER_A)
    const list = await gameRepository.listGames()
    expect(list.map((g) => g.id).sort()).toEqual(['g1', 'g3'])
  })

  it('does not return another user game from getGame', async () => {
    await db.games.add(makeGame({ id: 'other', userId: USER_B }))
    setCurrentUserId(USER_A)
    const game = await gameRepository.getGame('other')
    expect(game).toBeNull()
  })

  it('creates a game with the current user id', async () => {
    setCurrentUserId(USER_A)
    const game = await gameRepository.createGame({
      mode: 'singles',
      teamAName: 'Alice',
      teamBName: 'Bob',
      firstThrowTeamId: 'A',
    })
    expect(game.userId).toBe(USER_A)
    expect(game.syncStatus).toBe('pending')
  })

  it('throws when creating a game without a signed-in user', async () => {
    await expect(
      gameRepository.createGame({
        mode: 'singles',
        teamAName: 'A',
        teamBName: 'B',
        firstThrowTeamId: 'A',
      }),
    ).rejects.toThrow('Not signed in')
  })
})
