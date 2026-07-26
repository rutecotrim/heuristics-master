# Heuristics Master

A polished browser-based educational board game that teaches **Nielsen's 10 Usability Heuristics** through fast local multiplayer gameplay.

Inspired by Monopoly GO, Mario Party, and Duolingo — not a corporate e-learning module.

## Stack

- React + TypeScript
- Tailwind CSS
- Framer Motion
- Lucide Icons
- Vite

No backend. No database. Questions live in JSON. Progress stays in memory (banner preference in `localStorage`).

## Run

```bash
npm install
npm run dev
```

## Play

1. Open on a **desktop** browser
2. Both players roll — highest starts
3. Answer a heuristic question each turn
4. Correct → roll dice → race the snake board
5. First to FINISH wins

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
  components/   UI screens & game widgets
  data/         Board layout + questions JSON
  engine/       Question & tile effect logic
  hooks/        Game state machine
  types/        Shared TypeScript types
  utils/        Sound-ready helpers
```
