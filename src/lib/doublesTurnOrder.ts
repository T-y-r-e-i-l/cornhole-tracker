import type { Game, PlayerSlotKey, TeamId } from '../types/game'
import { BAGS_PER_ROUND } from '../types/game'

export type { PlayerSlotKey }

/** Round 1, 3, … = player 1 from each team; round 2, 4, … = player 2. */
export function isPlayerTwoFrame(roundIndex: number): boolean {
  return roundIndex % 2 === 1
}

export function getFramePlayerKeys(roundIndex: number): [PlayerSlotKey, PlayerSlotKey] {
  return isPlayerTwoFrame(roundIndex) ? ['A2', 'B2'] : ['A1', 'B1']
}

/** Team that scored the round (tie → team that led the round). */
export function getRoundScoringTeam(
  awardedA: number,
  awardedB: number,
  roundFirstTeamId: TeamId,
): TeamId {
  if (awardedA > awardedB) return 'A'
  if (awardedB > awardedA) return 'B'
  return roundFirstTeamId
}

/** Who leads off the next round after submit. */
export function getNextRoundLeadPlayerKey(
  nextRoundIndex: number,
  scoringTeam: TeamId,
): PlayerSlotKey {
  const slot = isPlayerTwoFrame(nextRoundIndex) ? 2 : 1
  return `${scoringTeam}${slot}` as PlayerSlotKey
}

/**
 * Eight-bag round: one player per team (P1 vs P1 or P2 vs P2), alternating throws.
 */
export function getDoublesThrowSequence(
  roundLeadPlayerKey: PlayerSlotKey,
  roundIndex: number,
): PlayerSlotKey[] {
  const [aKey, bKey] = getFramePlayerKeys(roundIndex)
  const aFirst = roundLeadPlayerKey.startsWith('A')

  const seq: PlayerSlotKey[] = []
  for (let i = 0; i < BAGS_PER_ROUND; i++) {
    const isTeamA = aFirst ? i % 2 === 0 : i % 2 === 1
    seq.push(isTeamA ? aKey : bKey)
  }
  return seq
}

export function getActivePlayerKey(
  game: Pick<Game, 'mode' | 'currentThrowIndex' | 'roundLeadPlayerKey' | 'currentRoundIndex'>,
): PlayerSlotKey | null {
  if (game.mode !== 'doubles' || !game.roundLeadPlayerKey) return null
  if (game.currentThrowIndex >= BAGS_PER_ROUND) return null

  const sequence = getDoublesThrowSequence(
    game.roundLeadPlayerKey,
    game.currentRoundIndex,
  )
  return sequence[game.currentThrowIndex] ?? null
}

export function getPlayerDisplayName(
  game: Pick<Game, 'playerA1Name' | 'playerA2Name' | 'playerB1Name' | 'playerB2Name'>,
  key: PlayerSlotKey,
): string {
  const names: Record<PlayerSlotKey, string | undefined> = {
    A1: game.playerA1Name,
    A2: game.playerA2Name,
    B1: game.playerB1Name,
    B2: game.playerB2Name,
  }
  const name = names[key]?.trim()
  if (name) return name
  return `Team ${key[0]} · P${key[1]}`
}

export function getFrameMatchupLabel(
  game: Pick<
    Game,
    'currentRoundIndex' | 'playerA1Name' | 'playerA2Name' | 'playerB1Name' | 'playerB2Name'
  >,
): string {
  const [aKey, bKey] = getFramePlayerKeys(game.currentRoundIndex)
  return `${getPlayerDisplayName(game, aKey)} vs ${getPlayerDisplayName(game, bKey)}`
}
