# Cornhole Tracker

Mobile-friendly web app for tracking cornhole games in real time with a top-down board view, bag placement, round replay, and game history.

## Features

- Tap the board to place a bag; drag while holding to rotate before release
- Automatic scoring from bag position (center-point rules)
- ACL cancel scoring: only the round point difference is awarded
- Game ends when either team reaches 21+
- Step-through replay per round
- Local game history with average points per round
- **Accounts:** sign in with email magic link; games sync to Supabase across devices

## Scoring assumptions

- **Bag center** determines points: in hole = 3, on board = 1, off board (dirt) = 0
- Place bags anywhere in the play area, including the ground around the board
- Hole is checked before board
- **Cancel scoring** each round: higher raw total minus lower; ties award 0
- **No win-by-2** in v1
- Singles and doubles modes are recorded; throws alternate by team each bag
- Choose who throws first when starting a game (or use random pick)
- Later rounds: the team that scored throws first; if no points, same leadoff as previous round
- **Solo mode:** 10 rounds, 4 bags per round, raw points summed (max 12 per round, 120 total)

## Supabase setup (accounts & cloud sync)

1. Create a project at [supabase.com](https://supabase.com).
2. In **Project Settings → API**, copy the project URL and anon (public) key.
3. Copy `.env.example` to `.env` and set:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Run the SQL in [`supabase/migrations/001_initial.sql`](supabase/migrations/001_initial.sql) in the Supabase SQL editor (or via CLI).
5. In **Authentication → Providers → Email**, enable email sign-in.
6. In **Authentication → URL configuration**, add redirect URLs:
   - Local: `http://localhost:5173/auth/callback`
   - Production: `https://your-domain/auth/callback`

The anon key is safe to embed in the client; **Row Level Security** ensures each user only reads and writes their own games.

### First login on an upgraded device

If you used the app before accounts existed, you may see a prompt to **import** local games into your account. Skipped games stay on the device but are hidden from your signed-in lists.

## Development

```bash
npm install
npm run dev
```

```bash
npm test
npm run build
```

## Stack

React, Vite, TypeScript, Tailwind CSS, Dexie (IndexedDB, offline-first), Supabase (auth + Postgres sync), React Router.

Games are written to IndexedDB immediately, then synced to Supabase when online. The schema includes `syncStatus` and `remoteId` for push/pull state.
