import { motion } from 'framer-motion'
import { ExternalLink, FolderTree, Gamepad2, GitBranch, Layers } from 'lucide-react'

const LAYERS = [
  {
    name: 'UI',
    path: 'src/components',
    detail: 'Screens and widgets: board, modals, lobby, panels.',
  },
  {
    name: 'State',
    path: 'src/hooks',
    detail: 'Game reducer and online bridge (host authority).',
  },
  {
    name: 'Domain',
    path: 'src/engine',
    detail: 'Questions, dice, tile effects, movement rules.',
  },
  {
    name: 'Network',
    path: 'src/net',
    detail: 'PeerJS rooms, protocol messages, room codes.',
  },
  {
    name: 'Data',
    path: 'src/data',
    detail: 'Board layout, player presets, question bank (100).',
  },
  {
    name: 'Types',
    path: 'src/types',
    detail: 'Shared TypeScript contracts for game state.',
  },
]

export default function App() {
  return (
    <div className="game-bg min-h-dvh px-4 py-10 text-parchment sm:px-8 sm:py-14">
      <div className="mx-auto w-full max-w-3xl">
        <motion.header
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <p className="font-display mb-3 text-xs font-bold uppercase tracking-[0.22em] text-lime-pop">
            Project architecture
          </p>
          <h1 className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
            Heuristics Master
          </h1>
          <p className="mt-4 max-w-2xl text-base font-semibold text-parchment/75 sm:text-lg">
            Educational board game about Nielsen&apos;s usability heuristics. This branch (
            <code className="text-aqua">main</code>) documents the app structure. The playable game
            lives on <code className="text-aqua">game</code>.
          </p>
        </motion.header>

        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mb-8 grid gap-3 sm:grid-cols-2"
        >
          <a
            href="https://rutecotrim.github.io/heuristics-master/"
            target="_blank"
            rel="noreferrer"
            className="panel flex items-center gap-3 rounded-2xl p-5 text-ink transition hover:scale-[1.01]"
          >
            <Gamepad2 className="h-6 w-6 text-tangerine-deep" />
            <div className="min-w-0 flex-1">
              <p className="font-display font-extrabold">Play live demo</p>
              <p className="text-sm font-semibold text-ink-muted">GitHub Pages build from game</p>
            </div>
            <ExternalLink className="h-4 w-4 text-ink-muted" />
          </a>
          <a
            href="https://github.com/rutecotrim/heuristics-master/tree/game"
            target="_blank"
            rel="noreferrer"
            className="panel flex items-center gap-3 rounded-2xl p-5 text-ink transition hover:scale-[1.01]"
          >
            <GitBranch className="h-6 w-6 text-felt" />
            <div className="min-w-0 flex-1">
              <p className="font-display font-extrabold">Browse game branch</p>
              <p className="text-sm font-semibold text-ink-muted">Full implementation source</p>
            </div>
            <ExternalLink className="h-4 w-4 text-ink-muted" />
          </a>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="panel mb-8 rounded-[1.75rem] p-6 text-ink sm:p-8"
        >
          <div className="mb-5 flex items-center gap-2">
            <Layers className="h-5 w-5 text-tangerine-deep" />
            <h2 className="font-display text-xl font-extrabold">Layered architecture</h2>
          </div>
          <div className="space-y-3">
            {LAYERS.map((layer) => (
              <div
                key={layer.path}
                className="flex flex-col gap-1 rounded-xl bg-felt/8 px-4 py-3 sm:flex-row sm:items-center sm:gap-4"
              >
                <p className="font-display w-24 shrink-0 text-sm font-extrabold text-tangerine-deep">
                  {layer.name}
                </p>
                <code className="shrink-0 text-xs font-bold text-felt">{layer.path}</code>
                <p className="text-sm font-semibold text-ink-muted sm:flex-1">{layer.detail}</p>
              </div>
            ))}
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="panel rounded-[1.75rem] p-6 text-ink sm:p-8"
        >
          <div className="mb-4 flex items-center gap-2">
            <FolderTree className="h-5 w-5 text-tangerine-deep" />
            <h2 className="font-display text-xl font-extrabold">Branch strategy</h2>
          </div>
          <ul className="space-y-2 text-sm font-semibold text-ink-muted">
            <li>
              <span className="font-display text-ink">main</span> — project overview and architecture
              entry point for reviewers.
            </li>
            <li>
              <span className="font-display text-ink">game</span> — complete playable app (UI, engine,
              PeerJS multiplayer, sound, deploy).
            </li>
            <li>
              GitHub Pages builds from <span className="font-display text-ink">game</span> so the live
              demo always matches the product branch.
            </li>
          </ul>
        </motion.section>
      </div>
    </div>
  )
}
