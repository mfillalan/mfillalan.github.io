import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import {
  Braces,
  Database,
  Layers,
  Sparkles,
  Wrench,
} from 'lucide-react'

// Skill chips that act as boid shelters. The color (rgb string) is used to
// tint sheltered boids so the eye is drawn to these "feature" technologies.
const SHELTERED_SKILLS: Record<string, string> = {
  'shadcn/ui': '150, 180, 220',
  'VS Code': '70, 150, 240',
  'AI-Native Development': '180, 140, 255',
  'Claude Code': '230, 130, 75',
}

const groups = [
  {
    icon: Braces,
    category: 'Languages',
    skills: ['TypeScript', 'JavaScript', 'C#', 'VB.NET', 'HTML', 'CSS'],
    span: 'md:col-span-2',
  },
  {
    icon: Layers,
    category: 'Frameworks',
    skills: ['React', 'ASP.NET Core', 'Next.js', 'Vue', 'Knockout.js', 'Vite'],
  },
  {
    icon: Database,
    category: 'Data',
    skills: ['MSSQL', 'Oracle', 'SQL Server'],
  },
  {
    icon: Wrench,
    category: 'UI & Tooling',
    skills: ['shadcn/ui', 'Tailwind CSS', 'Framer Motion', 'VS Code', 'Git', 'GitHub', 'REST', 'MVC'],
    span: 'md:col-span-2',
    aboveBoids: true,
  },
  {
    icon: Sparkles,
    category: 'AI & Emerging',
    skills: [
      'AI-Native Development',
      'MCP (Model Context Protocol)',
      'LLM Integration',
      'Prompt Engineering',
      'Claude Code',
      'Codex',
      'GitHub Copilot',
    ],
    span: 'md:col-span-3',
    accent: true,
    aboveBoids: true,
  },
]

export default function Skills() {
  return (
    <section id="skills" className="py-32 px-6">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mb-16"
        >
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary mb-4">
            03 / Toolkit
          </p>
          <h2 className="font-display text-4xl sm:text-5xl tracking-tight text-balance">
            What I reach for.
          </h2>
        </motion.div>

        {/* viewport.once + staggerChildren = each card slides in once on scroll */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.07 } },
          }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          {groups.map((g) => (
            <motion.div
              key={g.category}
              variants={{
                hidden: { opacity: 0, y: 24 },
                show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
              }}
              whileHover={{ y: -4 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className={`${g.span ?? ''} relative overflow-hidden rounded-2xl border border-border bg-card p-6 ${
                g.accent ? 'bg-gradient-to-br from-primary/10 via-card to-card border-primary/30' : ''
              }`}
            >
              {/* Per-card mirror canvas. Sits above the card body but below
                  the chips/title (which use a relative z-10 wrapper). The
                  global AmbientParticles tick draws into every canvas with
                  [data-boid-mirror] each frame. */}
              {g.aboveBoids && (
                <canvas
                  data-boid-mirror
                  aria-hidden
                  className="pointer-events-none absolute inset-0 size-full"
                  style={{ zIndex: 1 }}
                />
              )}
              <div className="relative" style={{ zIndex: 10 }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="rounded-lg bg-primary/10 text-primary p-2">
                    <g.icon className="size-4" />
                  </div>
                  <h3 className="font-medium text-base">{g.category}</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {g.skills.map((s) => {
                    const color = SHELTERED_SKILLS[s]
                    return (
                      <Badge
                        key={s}
                        variant="secondary"
                        className="font-normal"
                        {...(color
                          ? { 'data-boid-shelter': '', 'data-boid-shelter-color': color }
                          : {})}
                      >
                        {s}
                      </Badge>
                    )
                  })}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
