import { motion } from 'framer-motion'
import { ArrowLeft, Globe, Mail, MapPin, Printer } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { GithubIcon, LinkedinIcon } from './icons'

const highlights = [
  '14 years of professional software engineering experience',
  'Led WILD 2.0 modernization from legacy Web Forms to React + TypeScript + ASP.NET Core',
  'AI-native engineering workflow with durable memory, MCP, and agent tooling',
]

const skills = [
  'C# / .NET',
  'ASP.NET Core',
  'React',
  'TypeScript',
  'JavaScript',
  'MSSQL / Oracle',
  'REST API Design',
  'Legacy Modernization',
  'AI-Native Dev',
  'MCP Protocol',
  'GitHub / CI/CD',
]

const selectedProjects = [
  {
    name: 'DendriteMCP',
    tagline:
      'Rust memory daemon that gives coding agents durable, searchable context across sessions. SQLite + sqlite-vec for vector recall, a relationship graph with per-edge decay, and a tokio-scheduled subconscious that consolidates memories using a local Ollama model. Ships with an MCP stdio bridge and a React dashboard.',
    stack: 'Rust · Tokio · Axum · SQLite · MCP · Ollama · React',
  },
]

const experience = [
  {
    company: 'Serco',
    role: 'Software Engineer',
    period: 'May 2022 – Present',
    details: [
      'Core engineer on WILD, a mission-critical naval web-based inventory management system.',
      'Led WILD 2.0 modernization from VB.NET / ASP.NET 3.5 Web Forms + Oracle to React + TypeScript + ASP.NET Core + MSSQL.',
      'Defined architecture direction, migration strategy, and feature delivery for a live production environment.',
    ],
  },
  {
    company: 'Valiant Integrated Services',
    role: 'Software Engineer',
    period: 'Sep 2021 – May 2022',
    details: [
      'Maintained and enhanced the WILD platform under active contract transition.',
      'Delivered production features and defect fixes on ASP.NET Web Forms + Oracle stack.',
    ],
  },
  {
    company: 'Alliance Technical Services, Inc.',
    role: 'Software Engineer',
    period: 'Feb 2019 – Sep 2021',
    details: [
      'Built and maintained inventory-management features supporting naval operational workflows.',
      'Partnered with stakeholders to turn requirements into production-ready features.',
    ],
  },
  {
    company: 'Serco',
    role: 'Programmer I',
    period: 'Feb 2013 – Nov 2017',
    details: [
      'Developed functionality for WILD inventory management modules.',
      'Supported VB.NET and ASP.NET Web Forms code paths in a long-running production system.',
    ],
  },
  {
    company: 'L-3 Communications',
    role: 'Programmer',
    period: '2009 – 2011',
    details: [
      'Developed new features for SABER, a naval inventory management system using ASP.NET + VB.NET.',
      'Performed SQL Server data cleanup and maintenance to improve data integrity.',
    ],
  },
]

export default function ResumePage() {
  return (
    <div className="min-h-screen bg-muted/40 pt-28 pb-16 px-4 print:min-h-0 print:pt-0 print:pb-0 print:px-0">
      <div className="no-print mx-auto mb-6 max-w-[8.5in] flex items-center justify-between">
        <Button asChild variant="ghost" size="sm">
          <a href="#/">
            <ArrowLeft className="size-4" /> Back to Portfolio
          </a>
        </Button>
        <Button onClick={() => window.print()} size="sm">
          <Printer className="size-4" /> Print / Save as PDF
        </Button>
      </div>

      <motion.article
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mx-auto max-w-[8.5in] bg-white text-zinc-900 rounded-lg shadow-2xl p-12 print:shadow-none print:rounded-none print:p-0 print:max-w-none print:overflow-hidden"
      >
        <header className="border-b border-zinc-200 pb-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <h1 className="font-display text-5xl tracking-tight text-zinc-900">
                Michael Fillalan
              </h1>
              <p className="text-lg text-zinc-600 mt-1">Software Engineer</p>
            </div>
            <div className="space-y-1 text-sm text-zinc-700">
              <ContactRow icon={MapPin}>Virginia Beach, Virginia</ContactRow>
              <ContactRow icon={Mail}>
                <a href="mailto:mfillalan@gmail.com" className="hover:underline">
                  mfillalan@gmail.com
                </a>
              </ContactRow>
              <ContactRow icon={Globe}>
                <a
                  href="https://mfillalan.github.io/"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:underline"
                >
                  mfillalan.github.io
                </a>
              </ContactRow>
              <ContactRow icon={LinkedinIcon}>
                <a
                  href="https://www.linkedin.com/in/michael-fillalan/"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:underline"
                >
                  linkedin.com/in/michael-fillalan
                </a>
              </ContactRow>
              <ContactRow icon={GithubIcon}>
                <a
                  href="https://github.com/mfillalan"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:underline"
                >
                  github.com/mfillalan
                </a>
              </ContactRow>
            </div>
          </div>
          <p className="mt-6 text-zinc-700 leading-relaxed max-w-3xl">
            Full-stack engineer with 14 years of production experience and a drive to build
            things that feel as good as they function. I bring a creative, hands-on approach to
            every layer of the stack, from architecture decisions to the small UI details that
            make software genuinely enjoyable to use. Currently deep in AI-native development
            and looking for teams solving interesting problems. Project write-ups and screenshots at{' '}
            <a
              href="https://mfillalan.github.io/"
              target="_blank"
              rel="noreferrer"
              className="text-zinc-900 underline underline-offset-2 hover:text-zinc-700"
            >
              mfillalan.github.io
            </a>
            .
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-10 print:block">
          <aside className="space-y-8">
            <Section title="Highlights">
              <ul className="space-y-2 text-sm text-zinc-700">
                {highlights.map((h) => (
                  <li key={h} className="flex gap-2">
                    <span className="text-zinc-400 mt-1.5 size-1 rounded-full bg-current shrink-0" />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </Section>

            <Section title="Core Skills">
              <div className="flex flex-wrap gap-1.5">
                {skills.map((s) => (
                  <Badge key={s} variant="outline" className="font-normal text-zinc-700 border-zinc-300">
                    {s}
                  </Badge>
                ))}
              </div>
            </Section>

            <Section title="Education">
              <div className="space-y-3 text-sm">
                <div>
                  <p className="font-medium text-zinc-900">M.S. Information Systems</p>
                  <p className="text-zinc-600">ECPI University · 2011 – 2012</p>
                </div>
                <div>
                  <p className="font-medium text-zinc-900">B.S. Computer Information Science</p>
                  <p className="text-zinc-600">Simulation & Game Programming</p>
                  <p className="text-zinc-600">ECPI University · 2006 – 2009</p>
                </div>
              </div>
            </Section>
          </aside>

          <div className="print:break-before-page space-y-8">
            <Section title="Professional Experience">
              <div className="space-y-6">
                {experience.map((job) => (
                  <div key={`${job.company}-${job.role}`} className="print:break-inside-avoid">
                    <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
                      <h3 className="font-medium text-zinc-900">{job.role}</h3>
                      <span className="text-xs font-mono text-zinc-500">{job.period}</span>
                    </div>
                    <p className="text-sm text-zinc-600 mb-2">{job.company}</p>
                    <ul className="space-y-1.5 text-sm text-zinc-700">
                      {job.details.map((d) => (
                        <li key={d} className="flex gap-2">
                          <span className="text-zinc-400 mt-1.5 size-1 rounded-full bg-current shrink-0" />
                          <span className="leading-relaxed">{d}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </Section>

            <Section title="Selected Projects">
              <div className="space-y-4">
                {selectedProjects.map((p) => (
                  <div key={p.name} className="print:break-inside-avoid">
                    <h3 className="font-medium text-zinc-900">{p.name}</h3>
                    <p className="text-sm text-zinc-700 leading-relaxed mt-1">{p.tagline}</p>
                    <p className="text-xs font-mono text-zinc-500 mt-1.5">{p.stack}</p>
                  </div>
                ))}
              </div>
            </Section>
          </div>
        </div>
      </motion.article>
    </div>
  )
}

function ContactRow({
  icon: Icon,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>
  children: React.ReactNode
}) {
  return (
    <div className="flex items-center gap-2 justify-end sm:justify-start">
      <Icon className="size-3.5 text-zinc-500" />
      {children}
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500 mb-3 pb-2 border-b border-zinc-200">
        {title}
      </h2>
      {children}
    </section>
  )
}
