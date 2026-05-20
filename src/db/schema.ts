import Dexie, { type Table } from 'dexie'
import type { BagThrow, Game, Round } from '../types/game'

export class CornholeDatabase extends Dexie {
  games!: Table<Game, string>
  rounds!: Table<Round, string>
  bagThrows!: Table<BagThrow, string>

  constructor() {
    super('CornholeTracker')
    this.version(1).stores({
      games: 'id, status, createdAt, updatedAt',
      rounds: 'id, gameId, index',
      bagThrows: 'id, gameId, roundIndex, sequence, [gameId+roundIndex]',
    })
    this.version(2)
      .stores({
        games: 'id, status, createdAt, updatedAt',
        rounds: 'id, gameId, index',
        bagThrows: 'id, gameId, roundIndex, sequence, [gameId+roundIndex]',
      })
      .upgrade((tx) =>
        tx
          .table('games')
          .toCollection()
          .modify((game: Game) => {
            if (!game.firstThrowTeamId) game.firstThrowTeamId = 'A'
            if (!game.roundFirstTeamId) game.roundFirstTeamId = 'A'
          }),
      )
    this.version(3)
      .stores({
        games: 'id, status, createdAt, updatedAt',
        rounds: 'id, gameId, index',
        bagThrows: 'id, gameId, roundIndex, sequence, [gameId+roundIndex]',
      })
      .upgrade((tx) =>
        tx
          .table('games')
          .toCollection()
          .modify((game: Game) => {
            if (game.mode === 'doubles' && !game.firstThrowPlayerKey) {
              game.firstThrowPlayerKey = game.firstThrowTeamId === 'B' ? 'B1' : 'A1'
            }
            if (game.mode === 'doubles' && !game.roundLeadPlayerKey) {
              game.roundLeadPlayerKey = game.firstThrowPlayerKey ?? 'A1'
            }
          }),
      )
  }
}

export const db = new CornholeDatabase()
