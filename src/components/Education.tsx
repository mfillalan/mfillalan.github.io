import { motion } from 'framer-motion'
import { GraduationCap } from 'lucide-react'

const degrees = [
  {
    school: 'ECPI University',
    degree: 'Master of Science, Information Systems',
    period: '2011 – 2012',
    detail:
      'Graduate studies focused on enterprise systems, software architecture, and information management.',
  },
  {
    school: 'ECPI University',
    degree: 'B.S. Computer Information Science',
    concentration: 'Simulation & Game Programming',
    period: '2006 – 2009',
    detail:
      'Undergraduate program covering software engineering fundamentals, systems design, and applied programming.',
  },
]

export default function Education() {
  return (
    <section id="education" className="py-32 px-6 bg-card/30">
      <div className="container mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mb-12"
        >
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary mb-4">
            05 / Background
          </p>
          <h2 className="font-display text-4xl sm:text-5xl tracking-tight">Background.</h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 gap-4">
          {degrees.map((d, i) => (
            <motion.div
              key={d.degree}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ y: -4 }}
              className="rounded-2xl border border-border bg-card p-6"
            >
              <div className="flex items-start gap-4">
                <div className="rounded-lg bg-primary/10 text-primary p-2 shrink-0">
                  <GraduationCap className="size-5" />
                </div>
                <div>
                  <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-1">
                    {d.period}
                  </p>
                  <h3 className="font-medium text-lg leading-tight mb-1">{d.degree}</h3>
                  {d.concentration && (
                    <p className="text-sm text-primary mb-2">{d.concentration}</p>
                  )}
                  <p className="text-sm text-muted-foreground mb-3">{d.school}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{d.detail}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
