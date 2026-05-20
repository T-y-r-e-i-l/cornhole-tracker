import { db } from './schema'
import { markGamePending, pushGame } from './syncService'
import { requireCurrentUserId } from '../lib/currentUser'

const SKIP_KEY = 'cornhole_orphan_import_skipped'

export async function countOrphanGames(): Promise<number> {
  return db.games.filter((g) => g.userId == null).count()
}

export function hasSkippedOrphanImport(): boolean {
  return localStorage.getItem(SKIP_KEY) === '1'
}

export function skipOrphanImport(): void {
  localStorage.setItem(SKIP_KEY, '1')
}

export async function importOrphanGames(): Promise<number> {
  const userId = requireCurrentUserId()
  const orphans = await db.games.filter((g) => g.userId == null).toArray()

  for (const game of orphans) {
    await db.games.update(game.id, {
      userId,
      syncStatus: 'pending',
      remoteId: null,
    })
    await markGamePending(game.id)
    await pushGame(game.id)
  }

  return orphans.length
}

export function shouldShowOrphanPrompt(): boolean {
  return !hasSkippedOrphanImport()
}
