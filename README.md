# Heuristics Master

A polished browser based educational board game that teaches **Nielsen's 10 Usability Heuristics** through fast local and online multiplayer gameplay.

Inspired by Monopoly GO, Mario Party, and Duolingo, not a corporate learning module.

## Stack

* React + TypeScript
* Tailwind CSS
* Framer Motion
* Lucide Icons
* Vite
* PeerJS (online rooms)

No backend. No database. Questions live in JSON. Progress stays in memory (banner preference in `localStorage`).

## Run

```bash
npm install
npm run dev
```

## Play

1. Open on a **desktop** browser
2. Choose local (2 to 4 players) or online with a room code
3. Everyone rolls; highest starts
4. Answer a heuristic question each turn
5. Correct means roll dice and race the board
6. First to FINISH wins

## Extend questions

Edit `src/data/questions.json`:

```json
{
  "id": "q99",
  "question": "Your question?",
  "answers": ["A", "B", "C"],
  "correctIndex": 0,
  "explanation": "Why this is correct.",
  "difficulty": "medium"
}
```

## Project structure

```
src/
  components/   UI screens and game widgets
  data/         Board layout and questions JSON
  engine/       Question and tile effect logic
  hooks/        Game state machine
  net/          Online room and PeerJS helpers
  types/        Shared TypeScript types
  utils/        Sound ready helpers
```

## Live demo

https://rutecotrim.github.io/heuristics-master/
