import { v4 as uuid } from 'uuid'
import { db } from './schema'
import { getCurrentUserId, requireCurrentUserId } from '../lib/currentUser'
import { afterGameMutation, deleteGameRemote } from './syncService'
import type {
  BagThrow,
  Game,
  GameMode,
  GameSummary,
  GameWithDetails,
  Round,
} from '../types/game'
import { classifyBagPlacement } from '../lib/boardGeometry'
import {
  getBagsPerRound,
  isSoloGame,
  SOLO_ROUNDS,
} from '../lib/gameMode'
import {
  computeRoundAwarded,
  getOtherTeam,
  isGameOver,
  sumRawPoints,
} from '../lib/scoring'
import { computeAvgPointsPerRound, computeSoloAvgPerRound } from '../lib/stats'
import {
  getNextRoundLeadPlayerKey,
  getRoundScoringTeam,
} from '../lib/doublesTurnOrder'
import { getNextRoundFirstTeam } from '../lib/turnOrder'
import { isDoublesMode } from '../lib/gameMode'
import type { PlayerSlotKey, TeamId } from '../types/game'

export interface CreateGameInput {
  mode: GameMode
  teamAName: string
  teamBName: string
  firstThrowTeamId: TeamId
  firstThrowPlayerKey?: PlayerSlotKey
  playerA1Name?: string
  playerA2Name?: string
  playerB1Name?: string
  playerB2Name?: string
}

export interface PlaceBagInput {
  gameId: string
  xNorm: number
  yNorm: number
  rotationDeg: number
}

export interface RepositionBagInput {
  gameId: string
  bagId: string
  xNorm: number
  yNorm: number
  rotationDeg: number
}

function belongsToCurrentUser(game: Game | undefined): boolean {
  if (!game) return false
  const userId = getCurrentUserId()
  if (!userId) return false
  return game.userId === userId
}

export const gameRepository = {
  async createGame(input: CreateGameInput): Promise<Game> {
    const userId = requireCurrentUserId()
    const now = new Date().toISOString()
    const solo = input.mode === 'solo'
    const game: Game = {
      id: uuid(),
      userId,
      createdAt: now,
      updatedAt: now,
      mode: input.mode,
      teamAName: input.teamAName.trim() || (solo ? 'Player' : 'Team A'),
      teamBName: solo ? 'Solo' : input.teamBName.trim() || 'Team B',
      scoreA: 0,
      scoreB: 0,
      status: 'in_progress',
      currentRoundIndex: 0,
      currentThrowIndex: 0,
      nextTeamId: input.firstThrowTeamId,
      firstThrowTeamId: input.firstThrowTeamId,
      roundFirstTeamId: input.firstThrowTeamId,
      firstThrowPlayerKey:
        input.mode === 'doubles' ? input.firstThrowPlayerKey ?? 'A1' : undefined,
      roundLeadPlayerKey:
        input.mode === 'doubles' ? input.firstThrowPlayerKey ?? 'A1' : undefined,
      playerA1Name: input.playerA1Name?.trim() || undefined,
      playerA2Name: input.playerA2Name?.trim() || undefined,
      playerB1Name: input.playerB1Name?.trim() || undefined,
      playerB2Name: input.playerB2Name?.trim() || undefined,
      avgPointsA: null,
      avgPointsB: null,
      completedAt: null,
      syncStatus: 'pending',
      remoteId: null,
    }
    await db.games.add(game)
    await afterGameMutation(game.id)
    return game
  },

  async getGame(id: string): Promise<GameWithDetails | null> {
    const game = await db.games.get(id)
    if (!game || !belongsToCurrentUser(game)) return null

    const rounds = await db.rounds
      .where('gameId')
      .equals(id)
      .sortBy('index')

    const currentRoundBags = await db.bagThrows
      .where('[gameId+roundIndex]')
      .equals([id, game.currentRoundIndex])
      .sortBy('sequence')

    const allBags = await this.getAllBags(id)

    return { ...game, rounds, currentRoundBags, allBags }
  },

  async listGames(): Promise<GameSummary[]> {
    const userId = requireCurrentUserId()
    const games = await db.games.where('userId').equals(userId).toArray()
    games.sort((a, b) => (a.createdAt < b.createdAt ? 1 : a.createdAt > b.createdAt ? -1 : 0))
    return games.map((g) => ({
      id: g.id,
      createdAt: g.createdAt,
      mode: g.mode ?? 'singles',
      teamAName: g.teamAName,
      teamBName: g.teamBName,
      scoreA: g.scoreA,
      scoreB: g.scoreB,
      status: g.status,
      avgPointsA: g.avgPointsA,
      avgPointsB: g.avgPointsB,
      completedAt: g.completedAt,
    }))
  },

  async listInProgress(): Promise<GameSummary[]> {
    const all = await this.listGames()
    return all.filter((g) => g.status === 'in_progress')
  },

  async placeBag(input: PlaceBagInput): Promise<BagThrow | null> {
    const game = await db.games.get(input.gameId)
    if (!game || !belongsToCurrentUser(game) || game.status !== 'in_progress') return null

    const bagsPerRound = getBagsPerRound(game.mode)
    if (game.currentThrowIndex >= bagsPerRound) return null

    const rawPoints = classifyBagPlacement(input.xNorm, input.yNorm)
    const bag: BagThrow = {
      id: uuid(),
      gameId: game.id,
      roundIndex: game.currentRoundIndex,
      sequence: game.currentThrowIndex,
      teamId: isSoloGame(game) ? 'A' : game.nextTeamId,
      xNorm: input.xNorm,
      yNorm: input.yNorm,
      rotationDeg: input.rotationDeg,
      rawPoints,
      createdAt: new Date().toISOString(),
    }

    await db.transaction('rw', db.games, db.bagThrows, async () => {
      await db.bagThrows.add(bag)
      const nextThrow = game.currentThrowIndex + 1
      await db.games.update(game.id, {
        currentThrowIndex: nextThrow,
        nextTeamId: isSoloGame(game) ? 'A' : getOtherTeam(game.nextTeamId),
        updatedAt: new Date().toISOString(),
      })
    })

    await afterGameMutation(game.id)
    return bag
  },

  async repositionBag(input: RepositionBagInput): Promise<BagThrow | null> {
    const game = await db.games.get(input.gameId)
    if (!game || !belongsToCurrentUser(game) || game.status !== 'in_progress') return null

    const bag = await db.bagThrows.get(input.bagId)
    if (!bag || bag.gameId !== input.gameId) return null
    if (bag.roundIndex !== game.currentRoundIndex) return null

    const rawPoints = classifyBagPlacement(input.xNorm, input.yNorm)
    const updated: BagThrow = {
      ...bag,
      xNorm: input.xNorm,
      yNorm: input.yNorm,
      rotationDeg: input.rotationDeg,
      rawPoints,
    }

    await db.bagThrows.put(updated)
    await db.games.update(game.id, { updatedAt: new Date().toISOString() })
    await afterGameMutation(game.id)

    return updated
  },

  async undoLastBag(gameId: string): Promise<Game | null> {
    const game = await db.games.get(gameId)
    if (!game || !belongsToCurrentUser(game) || game.status !== 'in_progress') return null
    if (game.currentThrowIndex <= 0) return null

    const bags = await this.getCurrentRoundBags(gameId, game.currentRoundIndex)
    const lastBag = bags[bags.length - 1]
    if (!lastBag) return null

    await db.transaction('rw', db.games, db.bagThrows, async () => {
      await db.bagThrows.delete(lastBag.id)
      await db.games.update(gameId, {
        currentThrowIndex: game.currentThrowIndex - 1,
        nextTeamId: lastBag.teamId,
        updatedAt: new Date().toISOString(),
      })
    })

    await afterGameMutation(gameId)
    return (await db.games.get(gameId)) ?? null
  },

  async getCurrentRoundBags(gameId: string, roundIndex: number): Promise<BagThrow[]> {
    return db.bagThrows
      .where('[gameId+roundIndex]')
      .equals([gameId, roundIndex])
      .sortBy('sequence')
  },

  async submitRound(gameId: string): Promise<Game | null> {
    const game = await db.games.get(gameId)
    if (!game || !belongsToCurrentUser(game) || game.status !== 'in_progress') return null

    const bagsPerRound = getBagsPerRound(game.mode)
    if (game.currentThrowIndex < bagsPerRound) return null

    const bags = await this.getCurrentRoundBags(gameId, game.currentRoundIndex)
    const now = new Date().toISOString()

    if (isSoloGame(game)) {
      const roundPoints = sumRawPoints(bags, 'A')
      const scoreA = game.scoreA + roundPoints

      const round: Round = {
        id: uuid(),
        gameId,
        index: game.currentRoundIndex,
        rawPointsA: roundPoints,
        rawPointsB: 0,
        awardedA: roundPoints,
        awardedB: 0,
        submittedAt: now,
      }

      const nextRoundIndex = game.currentRoundIndex + 1
      const completed = nextRoundIndex >= SOLO_ROUNDS

      await db.transaction('rw', db.games, db.rounds, async () => {
        await db.rounds.add(round)
        const rounds = await db.rounds.where('gameId').equals(gameId).toArray()
        const avgA = computeSoloAvgPerRound(rounds)

        await db.games.update(gameId, {
          scoreA,
          scoreB: 0,
          currentRoundIndex: nextRoundIndex,
          currentThrowIndex: 0,
          nextTeamId: 'A',
          roundFirstTeamId: 'A',
          status: completed ? 'completed' : 'in_progress',
          avgPointsA: avgA,
          avgPointsB: null,
          completedAt: completed ? now : null,
          updatedAt: now,
        })
      })

      await afterGameMutation(gameId)
      return (await db.games.get(gameId)) ?? null
    }

    const rawA = sumRawPoints(bags, 'A')
    const rawB = sumRawPoints(bags, 'B')
    const { awardedA, awardedB } = computeRoundAwarded(rawA, rawB)
    const scoreA = game.scoreA + awardedA
    const scoreB = game.scoreB + awardedB
    const completed = isGameOver(scoreA, scoreB)

    const round: Round = {
      id: uuid(),
      gameId,
      index: game.currentRoundIndex,
      rawPointsA: rawA,
      rawPointsB: rawB,
      awardedA,
      awardedB,
      submittedAt: now,
    }

    await db.transaction('rw', db.games, db.rounds, async () => {
      await db.rounds.add(round)
      const rounds = await db.rounds.where('gameId').equals(gameId).toArray()
      const avgA = computeAvgPointsPerRound(rounds, 'A')
      const avgB = computeAvgPointsPerRound(rounds, 'B')
      const scoringTeam = getRoundScoringTeam(
        awardedA,
        awardedB,
        game.roundFirstTeamId,
      )
      const nextRoundIndex = game.currentRoundIndex + 1
      const nextRoundLead = isDoublesMode(game.mode)
        ? getNextRoundLeadPlayerKey(nextRoundIndex, scoringTeam)
        : null
      const nextRoundFirst = isDoublesMode(game.mode)
        ? scoringTeam
        : getNextRoundFirstTeam(game.roundFirstTeamId, awardedA, awardedB)

      await db.games.update(gameId, {
        scoreA,
        scoreB,
        currentRoundIndex: nextRoundIndex,
        currentThrowIndex: 0,
        nextTeamId: nextRoundFirst,
        roundFirstTeamId: nextRoundFirst,
        roundLeadPlayerKey: nextRoundLead ?? undefined,
        status: completed ? 'completed' : 'in_progress',
        avgPointsA: avgA,
        avgPointsB: avgB,
        completedAt: completed ? now : null,
        updatedAt: now,
      })
    })

    await afterGameMutation(gameId)
    return (await db.games.get(gameId)) ?? null
  },

  async getBagsForRound(gameId: string, roundIndex: number): Promise<BagThrow[]> {
    return this.getCurrentRoundBags(gameId, roundIndex)
  },

  async getAllBags(gameId: string): Promise<BagThrow[]> {
    return db.bagThrows.where('gameId').equals(gameId).sortBy('sequence')
  },

  async deleteGame(gameId: string): Promise<boolean> {
    const game = await db.games.get(gameId)
    if (!game || !belongsToCurrentUser(game)) return false

    await db.transaction('rw', db.games, db.rounds, db.bagThrows, async () => {
      await db.bagThrows.where('gameId').equals(gameId).delete()
      await db.rounds.where('gameId').equals(gameId).delete()
      await db.games.delete(gameId)
    })

    await deleteGameRemote(gameId)
    return true
  },

  async createRematch(gameId: string): Promise<Game | null> {
    const source = await db.games.get(gameId)
    if (!source || !belongsToCurrentUser(source)) return null
    return this.createGame({
      mode: source.mode,
      teamAName: source.teamAName,
      teamBName: source.teamBName,
      firstThrowTeamId: source.firstThrowTeamId,
    })
  },
}
