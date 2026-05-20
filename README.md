# Cornhole Tracker

Mobile-friendly web app for tracking cornhole games in real time with a top-down board view, bag placement, round replay, and game history.

## Features

- Tap the board to place a bag; drag while holding to rotate before release
- Automatic scoring from bag position (center-point rules)
- ACL cancel scoring: only the round point difference is awarded
- Game ends when either team reaches 21+
- Step-through replay per round
- Local game history with average points per round

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

React, Vite, TypeScript, Tailwind CSS, Zustand (available), Dexie (IndexedDB), React Router.

Data is stored locally in the browser. The schema includes `syncStatus` and `remoteId` fields for future cloud sync.
