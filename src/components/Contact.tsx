import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, Copy, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { GithubIcon, LinkedinIcon } from './icons'
import { Magnetic } from './Magnetic'

const EMAIL = 'mfillalan@gmail.com'

export default function Contact() {
  const [copied, setCopied] = useState(false)

  const copyEmail = () => {
    navigator.clipboard.writeText(EMAIL).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    })
  }

  return (
    <section id="contact" className="py-32 px-6">
      <div className="container mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.7 }}
          className="relative overflow-hidden rounded-3xl border border-border bg-card p-10 sm:p-16 text-center"
        >
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[120%] h-64 bg-gradient-to-b from-primary/20 to-transparent blur-3xl pointer-events-none" />

          <div className="relative">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary mb-4">
              06 / Contact
            </p>
            <h2 className="font-display text-4xl sm:text-6xl tracking-tight text-balance mb-4">
              Let's build something <em className="italic text-primary">good.</em>
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto mb-10">
              Open to new opportunities, collaboration, or just a good conversation about AI,
              craft, and what software could be.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 items-center justify-center">
              <Magnetic shelter>
                <Button size="lg" onClick={copyEmail} className="rounded-full min-w-56 relative overflow-hidden">
                <AnimatePresence mode="wait" initial={false}>
                  {copied ? (
                    <motion.span
                      key="copied"
                      initial={{ y: 12, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -12, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="flex items-center gap-2"
                    >
                      <Check className="size-4" /> Copied!
                    </motion.span>
                  ) : (
                    <motion.span
                      key="copy"
                      initial={{ y: 12, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -12, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="flex items-center gap-2"
                    >
                      <Copy className="size-4" /> {EMAIL}
                    </motion.span>
                  )}
                </AnimatePresence>
                </Button>
              </Magnetic>

              <Magnetic shelter>
                <Button asChild size="lg" variant="outline" className="rounded-full">
                  <a href={`mailto:${EMAIL}`}>
                    <Mail className="size-4" /> Email me
                  </a>
                </Button>
              </Magnetic>
            </div>

            <div className="mt-12 flex items-center justify-center gap-2">
              <Button asChild variant="ghost" size="icon" className="rounded-full">
                <a href="https://github.com/mfillalan" target="_blank" rel="noreferrer" aria-label="GitHub">
                  <GithubIcon className="size-5" />
                </a>
              </Button>
              <Button asChild variant="ghost" size="icon" className="rounded-full">
                <a
                  href="https://linkedin.com/in/michael-fillalan"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="LinkedIn"
                >
                  <LinkedinIcon className="size-5" />
                </a>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
