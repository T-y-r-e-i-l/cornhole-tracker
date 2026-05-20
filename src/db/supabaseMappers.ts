import type { BagThrow, Game, Round } from '../types/game'

export interface RemoteGameRow {
  id: string
  user_id: string
  created_at: string
  updated_at: string
  mode: Game['mode']
  team_a_name: string
  team_b_name: string
  score_a: number
  score_b: number
  status: Game['status']
  current_round_index: number
  current_throw_index: number
  next_team_id: Game['nextTeamId']
  first_throw_team_id: Game['firstThrowTeamId']
  round_first_team_id: Game['roundFirstTeamId']
  player_a1_name: string | null
  player_a2_name: string | null
  player_b1_name: string | null
  player_b2_name: string | null
  first_throw_player_key: Game['firstThrowPlayerKey'] | null
  round_lead_player_key: Game['roundLeadPlayerKey'] | null
  avg_points_a: number | null
  avg_points_b: number | null
  completed_at: string | null
}

export interface RemoteRoundRow {
  id: string
  game_id: string
  index: number
  raw_points_a: number
  raw_points_b: number
  awarded_a: number
  awarded_b: number
  submitted_at: string
}

export interface RemoteBagThrowRow {
  id: string
  game_id: string
  round_index: number
  sequence: number
  team_id: BagThrow['teamId']
  x_norm: number
  y_norm: number
  rotation_deg: number
  raw_points: number
  created_at: string
}

export function gameToRemote(game: Game, userId: string): RemoteGameRow {
  return {
    id: game.id,
    user_id: userId,
    created_at: game.createdAt,
    updated_at: game.updatedAt,
    mode: game.mode,
    team_a_name: game.teamAName,
    team_b_name: game.teamBName,
    score_a: game.scoreA,
    score_b: game.scoreB,
    status: game.status,
    current_round_index: game.currentRoundIndex,
    current_throw_index: game.currentThrowIndex,
    next_team_id: game.nextTeamId,
    first_throw_team_id: game.firstThrowTeamId,
    round_first_team_id: game.roundFirstTeamId,
    player_a1_name: game.playerA1Name ?? null,
    player_a2_name: game.playerA2Name ?? null,
    player_b1_name: game.playerB1Name ?? null,
    player_b2_name: game.playerB2Name ?? null,
    first_throw_player_key: game.firstThrowPlayerKey ?? null,
    round_lead_player_key: game.roundLeadPlayerKey ?? null,
    avg_points_a: game.avgPointsA,
    avg_points_b: game.avgPointsB,
    completed_at: game.completedAt,
  }
}

export function remoteToGame(row: RemoteGameRow): Game {
  return {
    id: row.id,
    userId: row.user_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    mode: row.mode,
    teamAName: row.team_a_name,
    teamBName: row.team_b_name,
    scoreA: row.score_a,
    scoreB: row.score_b,
    status: row.status,
    currentRoundIndex: row.current_round_index,
    currentThrowIndex: row.current_throw_index,
    nextTeamId: row.next_team_id,
    firstThrowTeamId: row.first_throw_team_id,
    roundFirstTeamId: row.round_first_team_id,
    playerA1Name: row.player_a1_name ?? undefined,
    playerA2Name: row.player_a2_name ?? undefined,
    playerB1Name: row.player_b1_name ?? undefined,
    playerB2Name: row.player_b2_name ?? undefined,
    firstThrowPlayerKey: row.first_throw_player_key ?? undefined,
    roundLeadPlayerKey: row.round_lead_player_key ?? undefined,
    avgPointsA: row.avg_points_a,
    avgPointsB: row.avg_points_b,
    completedAt: row.completed_at,
    syncStatus: 'synced',
    remoteId: row.id,
  }
}

export function roundToRemote(round: Round): RemoteRoundRow {
  return {
    id: round.id,
    game_id: round.gameId,
    index: round.index,
    raw_points_a: round.rawPointsA,
    raw_points_b: round.rawPointsB,
    awarded_a: round.awardedA,
    awarded_b: round.awardedB,
    submitted_at: round.submittedAt,
  }
}

export function remoteToRound(row: RemoteRoundRow): Round {
  return {
    id: row.id,
    gameId: row.game_id,
    index: row.index,
    rawPointsA: row.raw_points_a,
    rawPointsB: row.raw_points_b,
    awardedA: row.awarded_a,
    awardedB: row.awarded_b,
    submittedAt: row.submitted_at,
  }
}

export function bagToRemote(bag: BagThrow): RemoteBagThrowRow {
  return {
    id: bag.id,
    game_id: bag.gameId,
    round_index: bag.roundIndex,
    sequence: bag.sequence,
    team_id: bag.teamId,
    x_norm: bag.xNorm,
    y_norm: bag.yNorm,
    rotation_deg: bag.rotationDeg,
    raw_points: bag.rawPoints,
    created_at: bag.createdAt,
  }
}

export function remoteToBag(row: RemoteBagThrowRow): BagThrow {
  return {
    id: row.id,
    gameId: row.game_id,
    roundIndex: row.round_index,
    sequence: row.sequence,
    teamId: row.team_id,
    xNorm: row.x_norm,
    yNorm: row.y_norm,
    rotationDeg: row.rotation_deg,
    rawPoints: row.raw_points,
    createdAt: row.created_at,
  }
}
