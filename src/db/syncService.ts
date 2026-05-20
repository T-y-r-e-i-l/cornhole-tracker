import { db } from './schema'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import {
  bagToRemote,
  gameToRemote,
  remoteToBag,
  remoteToGame,
  remoteToRound,
  roundToRemote,
  type RemoteBagThrowRow,
  type RemoteGameRow,
  type RemoteRoundRow,
} from './supabaseMappers'

const pushTimers = new Map<string, ReturnType<typeof setTimeout>>()
const PUSH_DEBOUNCE_MS = 800

function canSync(): boolean {
  return isSupabaseConfigured && supabase !== null && navigator.onLine
}

export async function markGamePending(gameId: string): Promise<void> {
  const game = await db.games.get(gameId)
  if (!game || game.syncStatus === 'pending') return
  await db.games.update(gameId, { syncStatus: 'pending' })
  schedulePush(gameId)
}

function schedulePush(gameId: string): void {
  const existing = pushTimers.get(gameId)
  if (existing) clearTimeout(existing)
  pushTimers.set(
    gameId,
    setTimeout(() => {
      pushTimers.delete(gameId)
      void pushGame(gameId)
    }, PUSH_DEBOUNCE_MS),
  )
}

export async function pushGame(gameId: string): Promise<void> {
  if (!canSync()) return

  const game = await db.games.get(gameId)
  if (!game || !game.userId) return

  const rounds = await db.rounds.where('gameId').equals(gameId).toArray()
  const bags = await db.bagThrows.where('gameId').equals(gameId).toArray()

  const remoteGame = gameToRemote(game, game.userId)

  const { error: gameError } = await supabase!.from('games').upsert(remoteGame)
  if (gameError) {
    console.error('Failed to push game', gameError)
    return
  }

  if (rounds.length > 0) {
    const { error: roundsError } = await supabase!
      .from('rounds')
      .upsert(rounds.map(roundToRemote))
    if (roundsError) {
      console.error('Failed to push rounds', roundsError)
      return
    }
  }

  if (bags.length > 0) {
    const { error: bagsError } = await supabase!
      .from('bag_throws')
      .upsert(bags.map(bagToRemote))
    if (bagsError) {
      console.error('Failed to push bag throws', bagsError)
      return
    }
  }

  await db.games.update(gameId, {
    syncStatus: 'synced',
    remoteId: game.id,
  })
}

export async function pushPendingForUser(userId: string): Promise<void> {
  const pending = await db.games
    .where('userId')
    .equals(userId)
    .filter((g) => g.syncStatus === 'pending')
    .toArray()

  for (const game of pending) {
    await pushGame(game.id)
  }
}

export async function pullForUser(userId: string): Promise<void> {
  if (!canSync()) return

  const { data: remoteGames, error: gamesError } = await supabase!
    .from('games')
    .select('*')
    .eq('user_id', userId)

  if (gamesError) {
    console.error('Failed to pull games', gamesError)
    return
  }

  const gameRows = (remoteGames ?? []) as RemoteGameRow[]
  if (gameRows.length === 0) return

  const gameIds = gameRows.map((g) => g.id)

  const [{ data: remoteRounds }, { data: remoteBags }] = await Promise.all([
    supabase!.from('rounds').select('*').in('game_id', gameIds),
    supabase!.from('bag_throws').select('*').in('game_id', gameIds),
  ])

  const roundRows = (remoteRounds ?? []) as RemoteRoundRow[]
  const bagRows = (remoteBags ?? []) as RemoteBagThrowRow[]

  await db.transaction('rw', db.games, db.rounds, db.bagThrows, async () => {
    for (const row of gameRows) {
      const remote = remoteToGame(row)
      const local = await db.games.get(remote.id)

      if (!local) {
        await db.games.put(remote)
        continue
      }

      if (new Date(remote.updatedAt) >= new Date(local.updatedAt)) {
        await db.games.put(remote)
      }
    }

    for (const row of roundRows) {
      const round = remoteToRound(row)
      const local = await db.rounds.get(round.id)
      if (!local) {
        await db.rounds.put(round)
      }
    }

    for (const row of bagRows) {
      const bag = remoteToBag(row)
      const local = await db.bagThrows.get(bag.id)
      if (!local) {
        await db.bagThrows.put(bag)
      }
    }
  })
}

export async function deleteGameRemote(gameId: string): Promise<void> {
  if (!canSync()) return

  await supabase!.from('bag_throws').delete().eq('game_id', gameId)
  await supabase!.from('rounds').delete().eq('game_id', gameId)
  await supabase!.from('games').delete().eq('id', gameId)
}

export async function onAuthSignedIn(userId: string): Promise<void> {
  await pullForUser(userId)
  await pushPendingForUser(userId)
}

export function setupOnlineSyncListener(userId: string | null): () => void {
  const handler = () => {
    if (!userId || !navigator.onLine) return
    void pushPendingForUser(userId)
  }
  window.addEventListener('online', handler)
  return () => window.removeEventListener('online', handler)
}

export async function afterGameMutation(gameId: string): Promise<void> {
  await markGamePending(gameId)
}
