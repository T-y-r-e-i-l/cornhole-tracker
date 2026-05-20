import type { BagThrow, Game, PlayerSlotKey, Round, TeamId } from '../types/game'
import { sumRawPoints } from './scoring'
import {
  getDoublesThrowSequence,
  getNextRoundLeadPlayerKey,
  getRoundScoringTeam,
  isPlayerTwoFrame,
} from './doublesTurnOrder'

const ALL_PLAYER_KEYS: PlayerSlotKey[] = ['A1', 'A2', 'B1', 'B2']

export function formatPlayerAvgPerRound(avg: number | null): string {
  if (avg == null) return ''
  return ` (${avg})`
}

export function playerPlaysRound(key: PlayerSlotKey, roundIndex: number): boolean {
  const isP2 = isPlayerTwoFrame(roundIndex)
  return key.endsWith('2') ? isP2 : !isP2
}

/** Reconstruct who led each round from submitted round results. */
export function buildRoundLeadMap(
  game: Pick<Game, 'firstThrowPlayerKey'>,
  rounds: Round[],
): Map<number, PlayerSlotKey> {
  const map = new Map<number, PlayerSlotKey>()
  let lead: PlayerSlotKey = game.firstThrowPlayerKey ?? 'A1'
  map.set(0, lead)

  const sorted = [...rounds].sort((a, b) => a.index - b.index)
  for (const round of sorted) {
    const roundFirst = lead.startsWith('A') ? 'A' : 'B'
    const scoring = getRoundScoringTeam(round.awardedA, round.awardedB, roundFirst)
    const nextIdx = round.index + 1
    lead = getNextRoundLeadPlayerKey(nextIdx, scoring)
    map.set(nextIdx, lead)
  }

  return map
}

export function getBagPlayerKey(
  bag: BagThrow,
  roundLeadKey: PlayerSlotKey,
  roundIndex: number,
): PlayerSlotKey {
  return getDoublesThrowSequence(roundLeadKey, roundIndex)[bag.sequence]!
}

export function getRoundIndicesForGame(
  game: Pick<Game, 'status' | 'currentRoundIndex'>,
  rounds: Round[],
): number[] {
  const indices = rounds.map((r) => r.index)
  if (game.status === 'in_progress' && !indices.includes(game.currentRoundIndex)) {
    indices.push(game.currentRoundIndex)
  }
  return indices.sort((a, b) => a - b)
}

/** Raw points per round averaged over rounds each player has played. */
export function computeDoublesPlayerAvgPerRound(
  game: Pick<
    Game,
    'firstThrowPlayerKey' | 'roundLeadPlayerKey' | 'status' | 'currentRoundIndex'
  >,
  rounds: Round[],
  allBags: BagThrow[],
): Record<PlayerSlotKey, number | null> {
  const totals = Object.fromEntries(
    ALL_PLAYER_KEYS.map((k) => [k, 0]),
  ) as Record<PlayerSlotKey, number>
  const roundCounts = Object.fromEntries(
    ALL_PLAYER_KEYS.map((k) => [k, 0]),
  ) as Record<PlayerSlotKey, number>

  const leadMap = buildRoundLeadMap(game, rounds)
  const roundIndices = getRoundIndicesForGame(game, rounds)

  for (const roundIndex of roundIndices) {
    for (const key of ALL_PLAYER_KEYS) {
      if (playerPlaysRound(key, roundIndex)) {
        roundCounts[key] += 1
      }
    }

    const lead =
      leadMap.get(roundIndex) ??
      (roundIndex === game.currentRoundIndex
        ? game.roundLeadPlayerKey
        : undefined) ??
      game.firstThrowPlayerKey ??
      'A1'

    const roundBags = allBags.filter((b) => b.roundIndex === roundIndex)
    for (const bag of roundBags) {
      const playerKey = getBagPlayerKey(bag, lead, roundIndex)
      totals[playerKey] += bag.rawPoints
    }
  }

  return Object.fromEntries(
    ALL_PLAYER_KEYS.map((key) => [
      key,
      roundCounts[key] > 0
        ? Math.round((totals[key] / roundCounts[key]) * 10) / 10
        : null,
    ]),
  ) as Record<PlayerSlotKey, number | null>
}

/** Team raw points per round (singles / team-level display). */
export function computeTeamRawAvgPerRound(
  game: Pick<Game, 'status' | 'currentRoundIndex'>,
  rounds: Round[],
  currentRoundBags: BagThrow[],
): { A: number | null; B: number | null } {
  const roundIndices = getRoundIndicesForGame(game, rounds)
  const totals = { A: 0, B: 0 }
  const counts = { A: 0, B: 0 }

  for (const roundIndex of roundIndices) {
    counts.A += 1
    counts.B += 1
    const completed = rounds.find((r) => r.index === roundIndex)
    if (completed) {
      totals.A += completed.rawPointsA
      totals.B += completed.rawPointsB
    } else {
      const bags = currentRoundBags.filter((b) => b.roundIndex === roundIndex)
      totals.A += sumRawPoints(bags, 'A')
      totals.B += sumRawPoints(bags, 'B')
    }
  }

  const fmt = (team: TeamId) =>
    counts[team] > 0 ? Math.round((totals[team] / counts[team]) * 10) / 10 : null

  return { A: fmt('A'), B: fmt('B') }
}
