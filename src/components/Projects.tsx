import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUpRight, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { GithubIcon } from './icons'
import ProjectGallery, { type Screenshot } from './ProjectGallery'

interface Project {
  title: string
  summary: string
  role: string
  details: string
  impact?: string
  tags: string[]
  repoUrl?: string
  liveUrl?: string
  accent: string
  /** "r, g, b" tint applied to fish that shelter at the title card. */
  shelterColor: string
  screenshots?: Screenshot[]
}

const BASE = import.meta.env.BASE_URL

const projects: Project[] = [
  {
    title: 'DendriteMCP',
    summary:
      'A Rust memory daemon that gives coding agents durable, searchable context across sessions. Built on SQLite with vector search and a graph relationship layer, plus a background scheduler that autonomously consolidates, prunes, and reconciles memories using a local LLM.',
    role:
      'Creator and sole engineer. I own the architecture and every layer of the implementation: the Rust core daemon, the MCP stdio bridge, the SQLite schema with vector indexes, the React dashboard, and the Ollama integration. Currently building out the memory-decay, drift-detection, and assumption-checking systems.',
    details:
      "Most coding agents reset between sessions. Project context, prior decisions, and reusable knowledge get rebuilt from scratch every time, which causes drift between runs, repeated explanations, and wasted tool calls. DendriteMCP fixes that by running a single local daemon agents can write to and recall from over the standard MCP transport.\n\nThe core is a Rust service built on Axum and tokio. It owns all state behind an r2d2-pooled SQLite database that uses sqlite-vec for 384-dimensional vector search and FTS5 for full-text, plus a relationship graph in a `node_edges` table with per-edge-type evaporation rates. A small TypeScript stdio bridge proxies JSON-RPC traffic from agents (Claude Code, Cursor, Copilot, Codex) to the daemon's HTTP endpoints, with auto-restart and binary lookup baked in.\n\nMemory is organized into three tiers: working (session-scoped), episodic (time-series), and semantic (consolidated facts), each with its own decay and embedding rules. Recall is a two-phase pipeline: keyword + embedding pulls candidates, then an LLM rerank scores them. A physarum-inspired path-flux algorithm walks the relationship graph to surface related quests and memories that aren't directly connected.\n\nA background subconscious scheduler runs every few minutes inside the same tokio runtime. It replays related memories, scans for contradictions against pillar drift signals, and consolidates episodic chunks into semantic facts using a local Ollama model. When Ollama is unavailable, the same operations fall back to algorithmic keyword and embedding scoring so the system stays useful offline.\n\nThe same daemon also serves a React + Vite dashboard at /dashboard, themed as a starship bridge with quests, skills, knowledge graph, and a live SSE activity feed, which makes the underlying engineering legible at a glance instead of buried in logs.",
    impact:
      "Turns AI-assisted coding from disposable chat into a continuous engineering workflow, with persistent context, decision traceability, and a body of reusable project knowledge that compounds over time.",
    tags: ['Rust', 'Tokio', 'Axum', 'SQLite', 'Vector Search', 'React', 'TypeScript', 'MCP', 'Ollama', 'Knowledge Graph'],
    accent: 'from-violet-500/30 via-fuchsia-500/15 to-transparent',
    shelterColor: '200, 130, 240',
    screenshots: [
      {
        src: `${BASE}projects/dendritemcp/01-bridge.png`,
        caption: 'Bridge: the Constellation view shows the active mission spread.',
      },
      {
        src: `${BASE}projects/dendritemcp/02-skill-tree.png`,
        caption: 'Skill Tree: weekly progression heatmap across capability areas.',
      },
      {
        src: `${BASE}projects/dendritemcp/03-knowledge-graph.png`,
        caption: 'Knowledge Graph: skills as nodes, relationships as edges.',
      },
      {
        src: `${BASE}projects/dendritemcp/04-quest-beat.png`,
        caption: 'Quest Heat: heatmap grouping quests by recent activity.',
      },
      {
        src: `${BASE}projects/dendritemcp/05-throughput.png`,
        caption: 'Throughput: quest velocity with projected completion.',
      },
      {
        src: `${BASE}projects/dendritemcp/06-library.png`,
        caption: 'Library: captured artifacts, patterns, and runbooks.',
      },
      {
        src: `${BASE}projects/dendritemcp/07-article.png`,
        caption: 'Article: full-text drill-down with chunked sections.',
      },
      {
        src: `${BASE}projects/dendritemcp/08-skill-detail.png`,
        caption: 'Skill detail: observations gathered from real work over time.',
      },
      {
        src: `${BASE}projects/dendritemcp/09-chronicle.png`,
        caption: 'Chronicle: the live activity stream of completed quests.',
      },
    ],
  },
  {
    title: 'WILD 2.0',
    summary:
      'Lead engineer on the ground-up rebuild of a mission-critical naval inventory platform: a complete rewrite of the legacy VB.NET / ASP.NET 3.5 Web Forms / Oracle stack on .NET 8, EF Core, React 19, and a Vite-built offline-first PWA. Currently in testing ahead of full cutover.',
    role:
      "Lead engineer. I own the architecture direction, the rebuild plan, and core feature delivery. Most decisions involve balancing engineering ideal against the operational reality that the legacy system has to stay in production until the new platform is fully ready.",
    details:
      "WILD supports real naval inventory operations and was sitting on a stack that had outlived its useful life: VB.NET on ASP.NET 3.5 Web Forms talking to Oracle. Maintainability, security posture, hiring, and integration runway were all degrading. The legacy system stays in production until the new platform is ready, so the goal was not patching around it; it was building a clean replacement that earns the cutover.\n\nWILD 2.0 is a ground-up rebuild rather than a patchwork modernization. The design isn't constrained by legacy decisions. A new ASP.NET Core API on .NET 8 sits behind a generic repository layer over Entity Framework Core 8 against MSSQL, with a Dapper-backed data project for hand-tuned SQL where the ergonomics of an ORM get in the way. Multitenancy is handled at the query layer with a runtime DbContext factory that resolves per-user schemas, with TTL caching and semaphore-protected concurrency.\n\nThe front end is React 19 + TypeScript 5 built with Vite, using Material-UI and Kendo for component primitives, Zustand for client state, and TanStack Query for server state. Because field operations sometimes happen in low-connectivity environments, the app is delivered as an offline-first PWA: Dexie / IndexedDB for local state, a delta queue for outbound writes, and a Workbox service worker with per-asset-type caching policies and Background Sync for write reconciliation when connectivity returns.\n\nOn the operational side: structured Serilog logging with correlation-ID middleware for cross-service tracing, a custom AppException + ExceptionMiddleware pattern that maps domain errors cleanly to HTTP semantics, real-time SignalR hubs backed by hosted background services for status updates and notifications, embedded Swagger, and a Docusaurus docs site served from the API. The platform is currently in testing ahead of cutover. Because this is an active government-adjacent system, public detail is intentionally limited, but the engineering shape is a full modern rewrite under live operational constraints.",
    impact:
      "Replaces the legacy stack entirely at cutover: restores hiring viability on a modern platform, clears the legacy security and integration tech-debt, and unlocks capabilities (offline operation, real-time status, modern auth) that weren't realistically deliverable on the old stack.",
    tags: ['.NET 8', 'C#', 'ASP.NET Core', 'EF Core', 'React 19', 'TypeScript', 'MSSQL', 'Dapper', 'Vite', 'PWA', 'SignalR'],
    accent: 'from-cyan-500/30 via-blue-500/15 to-transparent',
    shelterColor: '90, 180, 230',
    screenshots: [
      {
        src: `${BASE}projects/wild2/01-dashboard.png`,
        caption: 'Dashboard: operational overview at a glance.',
      },
      {
        src: `${BASE}projects/wild2/02-warehouse-editor.png`,
        caption: 'Warehouse editor: configure storage layout and zones.',
      },
      {
        src: `${BASE}projects/wild2/03-location-selector.png`,
        caption: 'Location selector: drill into specific warehouse positions.',
      },
    ],
  },
]

export default function Projects() {
  const [selected, setSelected] = useState<Project | null>(null)

  // Pause the ambient boid simulation while a project modal is open. The
  // layoutId card→dialog morph is layout-measurement-heavy and the boid
  // canvas competes with it for main-thread time.
  useEffect(() => {
    if (!selected) return
    const root = document.documentElement
    root.dataset.boidsPaused = '1'
    return () => {
      delete root.dataset.boidsPaused
    }
  }, [selected])

  return (
    <section id="projects" className="py-32 px-6">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mb-16"
        >
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary mb-4">
            02 / Projects
          </p>
          <h2 className="font-display text-4xl sm:text-5xl tracking-tight text-balance">
            Selected work.
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {projects.map((p, i) => (
            <motion.button
              key={p.title}
              // layoutId: when this element shares an id with another animating
              // element (the dialog below), Framer Motion morphs between them.
              layoutId={`project-${p.title}`}
              onClick={() => setSelected(p)}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              whileHover={{ y: -4 }}
              className="group text-left relative overflow-hidden rounded-2xl border border-border bg-card p-7 hover:border-primary/40 transition-colors"
            >
              {/* Gradient wash specific to project */}
              <div
                className={`absolute -top-24 -right-24 w-64 h-64 rounded-full bg-gradient-to-br ${p.accent} blur-3xl opacity-60 pointer-events-none`}
              />
              {/* Mirror canvas so wandering fish are visible inside the
                  project card (without it, the card's bg-card occludes them
                  on the global background canvas). */}
              <canvas
                data-boid-mirror
                aria-hidden
                className="pointer-events-none absolute inset-0 size-full"
                style={{ zIndex: 1 }}
              />
              <div className="relative" style={{ zIndex: 10 }}>
                {/* Title "paper" — the actual shelter. Inline-block so it
                    hugs the title text and reads as a small floating card
                    that the fish hide behind. */}
                <div className="mb-4">
                  <div
                    className="inline-block rounded-lg bg-card border border-border px-4 py-1.5 shadow-lg shadow-black/20"
                    data-boid-shelter
                    data-boid-shelter-color={p.shelterColor}
                  >
                    <h3 className="font-display text-3xl tracking-tight">
                      {p.title}
                    </h3>
                  </div>
                </div>
                <p className="text-muted-foreground leading-relaxed mb-6">{p.summary}</p>
                <div className="flex flex-wrap gap-2 mb-6">
                  {p.tags.slice(0, 5).map((t) => (
                    <Badge key={t} variant="secondary" className="font-normal">
                      {t}
                    </Badge>
                  ))}
                  {p.tags.length > 5 && (
                    <Badge variant="outline" className="font-normal">
                      +{p.tags.length - 5}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm font-medium text-primary">
                  Read the case study
                  <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* AnimatePresence handles enter/exit animations for elements added/removed
          from the React tree, required for layoutId morph-out on close. */}
      <AnimatePresence>
        {selected && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Plain backdrop. No backdrop-blur during the morph (huge GPU
                cost stacked on top of layoutId scaling). */}
            <motion.div
              className="absolute inset-0 bg-black/80"
              onClick={() => setSelected(null)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <motion.div
              layoutId={`project-${selected.title}`}
              // will-change hints GPU promotion; prevents repaint thrash on
              // every frame of the layout animation.
              style={{ willChange: 'transform' }}
              // Snappier morph; the default spring overshoots and runs long.
              transition={{ type: 'spring', stiffness: 320, damping: 32 }}
              className="relative w-full max-w-3xl max-h-[88vh] overflow-y-auto rounded-2xl border border-border bg-card p-8 sm:p-10 shadow-xl"
            >
              {/* Gradient halo deferred until the morph is finished. blur-3xl
                  on a 384px element is ~64px backdrop blur, and recompositing
                  that 60×/sec while scaling is the dominant lag source. */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                transition={{ delay: 0.35, duration: 0.4 }}
                className={`absolute -top-32 -right-32 w-96 h-96 rounded-full bg-gradient-to-br ${selected.accent} blur-2xl pointer-events-none`}
              />
              <button
                onClick={() => setSelected(null)}
                aria-label="Close"
                className="absolute right-4 top-4 rounded-full p-2 hover:bg-accent transition-colors z-10"
              >
                <X className="size-5" />
              </button>
              <div className="relative">
                {/* Title fades in instead of layoutId-morphing, so there's
                    one less shared-element animation running concurrently. */}
                <motion.h3
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15, duration: 0.3 }}
                  className="font-display text-4xl sm:text-5xl tracking-tight mb-4"
                >
                  {selected.title}
                </motion.h3>
                <div className="flex flex-wrap gap-2 mb-8">
                  {selected.tags.map((t) => (
                    <Badge key={t} variant="secondary" className="font-normal">
                      {t}
                    </Badge>
                  ))}
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.18, duration: 0.3 }}
                  className="space-y-7"
                >
                  {selected.screenshots && selected.screenshots.length > 0 && (
                    <ProjectGallery screenshots={selected.screenshots} />
                  )}
                  <Section title="My Role">{selected.role}</Section>
                  <Section title="What I Built" preserveBreaks>
                    {selected.details}
                  </Section>
                  {selected.impact && <Section title="Impact">{selected.impact}</Section>}

                  {(selected.repoUrl || selected.liveUrl) && (
                    <div className="flex gap-3 pt-4">
                      {selected.repoUrl && (
                        <Button asChild variant="outline">
                          <a href={selected.repoUrl} target="_blank" rel="noreferrer">
                            <GithubIcon className="size-4" /> GitHub
                          </a>
                        </Button>
                      )}
                      {selected.liveUrl && (
                        <Button asChild>
                          <a href={selected.liveUrl} target="_blank" rel="noreferrer">
                            Live demo <ArrowUpRight className="size-4" />
                          </a>
                        </Button>
                      )}
                    </div>
                  )}
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}

function Section({
  title,
  children,
  preserveBreaks = false,
}: {
  title: string
  children: string
  preserveBreaks?: boolean
}) {
  return (
    <div>
      <h4 className="font-mono text-xs uppercase tracking-[0.18em] text-primary mb-3">
        {title}
      </h4>
      <p
        className={`text-muted-foreground leading-relaxed ${
          preserveBreaks ? 'whitespace-pre-line' : ''
        }`}
      >
        {children}
      </p>
    </div>
  )
}
