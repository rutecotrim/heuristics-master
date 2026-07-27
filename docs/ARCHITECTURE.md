# Architecture

This document describes the playable app on the `game` branch.

## Overview

Heuristics Master is a client only React app. There is no custom backend. Local play runs entirely in memory. Online play uses PeerJS for peer to peer rooms with host authority.

```
┌─────────────┐     intents      ┌──────────────────┐
│ Guest client│ ───────────────► │ Host (authority) │
└─────────────┘                  │  useGameState    │
       ▲                         │  tile/question   │
       │        state sync       │  engines         │
       └─────────────────────────┴──────────────────┘
```

## Layers

1. **components** — screens and widgets only. Call hooks; no game rules.
2. **hooks** — `useGameState` owns the reducer. `useNetworkBridge` wraps actions for online play.
3. **engine** — pure helpers for questions, dice, moves, tile effects.
4. **net** — PeerJS session, room codes, message protocol.
5. **data** — static board geometry, player presets, question bank.
6. **types** — shared contracts (`GameState`, `Player`, phases).
7. **utils** — sound mapping to UI SFX cues.

## Online flow

1. Host creates a room code and opens a PeerJS peer id.
2. Guests join and send `hello`; host assigns seats (up to 4 players).
3. Host starts dice off, then the match.
4. Guests send intents (`ready`, `answer`, `continue`, …).
5. Host validates, updates state, broadcasts snapshots.

## Deploy

GitHub Actions on `game` builds with Vite (`base: /heuristics-master/`) and publishes to GitHub Pages.
