import type { TeamId } from '../types/game'

/** Who throws first in the next round (ACL rules). */
export function getNextRoundFirstTeam(
  currentRoundFirst: TeamId,
  awardedA: number,
  awardedB: number,
): TeamId {
  if (awardedA > 0) return 'A'
  if (awardedB > 0) return 'B'
  return currentRoundFirst
}
