export type GameMode = 'singles' | 'doubles' | 'solo'
export type GameStatus = 'in_progress' | 'completed'
export type TeamId = 'A' | 'B'
export type PlayerSlotKey = 'A1' | 'A2' | 'B1' | 'B2'
export type SyncStatus = 'local' | 'pending' | 'synced'

export interface Team {
  id: TeamId
  name: string
}

export interface BagThrow {
  id: string
  gameId: string
  roundIndex: number
  sequence: number
  teamId: TeamId
  xNorm: number
  yNorm: number
  rotationDeg: number
  rawPoints: number
  createdAt: string
}

export interface Round {
  id: string
  gameId: string
  index: number
  rawPointsA: number
  rawPointsB: number
  awardedA: number
  awardedB: number
  submittedAt: string
}

export interface Game {
  id: string
  createdAt: string
  updatedAt: string
  mode: GameMode
  teamAName: string
  teamBName: string
  scoreA: number
  scoreB: number
  status: GameStatus
  currentRoundIndex: number
  currentThrowIndex: number
  nextTeamId: TeamId
  /** Team chosen to throw first at game start */
  firstThrowTeamId: TeamId
  /** Team that leads off the current round */
  roundFirstTeamId: TeamId
  /** Doubles: individual player names */
  playerA1Name?: string
  playerA2Name?: string
  playerB1Name?: string
  playerB2Name?: string
  /** Doubles: who threw first at game start */
  firstThrowPlayerKey?: PlayerSlotKey
  /** Doubles: who leads the current round (P1/P2 frame) */
  roundLeadPlayerKey?: PlayerSlotKey
  avgPointsA: number | null
  avgPointsB: number | null
  completedAt: string | null
  syncStatus: SyncStatus
  remoteId: string | null
}

export interface GameWithDetails extends Game {
  rounds: Round[]
  currentRoundBags: BagThrow[]
  allBags: BagThrow[]
}

export interface GameSummary {
  id: string
  createdAt: string
  mode: GameMode
  teamAName: string
  teamBName: string
  scoreA: number
  scoreB: number
  status: GameStatus
  avgPointsA: number | null
  avgPointsB: number | null
  completedAt: string | null
}

export const BAGS_PER_TEAM = 4
export const BAGS_PER_ROUND = 8
export const WINNING_SCORE = 21

/** @deprecated Use getBagsPerRound(mode) from lib/gameMode */
export const SOLO_BAGS_PER_ROUND = 4
