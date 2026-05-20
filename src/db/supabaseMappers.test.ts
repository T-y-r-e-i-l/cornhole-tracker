import { describe, expect, it } from 'vitest'
import { gameToRemote, remoteToGame } from './supabaseMappers'
import type { Game } from '../types/game'

const sampleGame: Game = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  userId: '660e8400-e29b-41d4-a716-446655440001',
  createdAt: '2026-01-01T12:00:00.000Z',
  updatedAt: '2026-01-02T12:00:00.000Z',
  mode: 'doubles',
  teamAName: 'Team A',
  teamBName: 'Team B',
  scoreA: 5,
  scoreB: 3,
  status: 'in_progress',
  currentRoundIndex: 2,
  currentThrowIndex: 1,
  nextTeamId: 'B',
  firstThrowTeamId: 'A',
  roundFirstTeamId: 'B',
  playerA1Name: 'Pat',
  firstThrowPlayerKey: 'A1',
  roundLeadPlayerKey: 'B1',
  avgPointsA: 2.5,
  avgPointsB: 1.5,
  completedAt: null,
  syncStatus: 'synced',
  remoteId: '550e8400-e29b-41d4-a716-446655440000',
}

describe('supabaseMappers', () => {
  it('round-trips game fields', () => {
    const remote = gameToRemote(sampleGame, sampleGame.userId!)
    const back = remoteToGame(remote)
    expect(back.id).toBe(sampleGame.id)
    expect(back.userId).toBe(sampleGame.userId)
    expect(back.teamAName).toBe(sampleGame.teamAName)
    expect(back.mode).toBe(sampleGame.mode)
    expect(back.firstThrowPlayerKey).toBe('A1')
    expect(back.syncStatus).toBe('synced')
  })
})
