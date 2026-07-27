# Heuristics Master

Educational browser board game that teaches **Nielsen's 10 Usability Heuristics**.

## Branch layout

| Branch | Purpose |
| --- | --- |
| `main` | Project overview and architecture entry point |
| `game` | Full playable implementation + GitHub Pages deploy |

**Play:** https://rutecotrim.github.io/heuristics-master/  
**Source (game):** https://github.com/rutecotrim/heuristics-master/tree/game

## Architecture (on `game`)

```
src/
  components/   UI screens and game widgets
  hooks/        Game state machine + online bridge
  engine/       Questions, dice, tile effects
  net/          PeerJS rooms and protocol
  data/         Board, players, questions JSON
  types/        Shared TypeScript contracts
  utils/        Sound (UI SFX) helpers
```

### Design choices

* **Local first domain logic** in `engine/` and `hooks/useGameState` so rules stay testable without the network.
* **Host authority online** via `useNetworkBridge` + `net/`: guests send intents, host applies and syncs state.
* **Data driven content** in `data/questions.json` (100 heuristic questions).
* **Presentation isolated** in `components/` (React + Framer Motion + Tailwind).

## Stack

* React + TypeScript + Vite
* Tailwind CSS + Framer Motion
* PeerJS (online rooms)
* UI SFX (arcade pack)

## Run the game locally

```bash
git checkout game
npm install
npm run dev
```

## License notes

App code is part of this repository. UI SFX runtime is MIT; bundled audio cues are CC0.
