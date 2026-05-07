import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useScroll, useSpring } from 'framer-motion'
import { FileText, Menu as MenuIcon, Moon, Sun, X as CloseIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface NavbarProps {
  isResumeRoute: boolean
  theme: 'light' | 'dark'
  onToggleTheme: () => void
}

const sections = [
  { id: 'hero', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'projects', label: 'Projects' },
  { id: 'skills', label: 'Skills' },
  { id: 'experience', label: 'Experience' },
  { id: 'contact', label: 'Contact' },
]

export default function Navbar({ isResumeRoute, theme, onToggleTheme }: NavbarProps) {
  const [active, setActive] = useState('hero')
  const [mobileOpen, setMobileOpen] = useState(false)
  const { scrollYProgress } = useScroll()
  // Spring smooths the progress bar. Direct scroll values are jittery.
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 })

  useEffect(() => {
    if (isResumeRoute) return
    const onScroll = () => {
      let current = 'hero'
      for (const s of sections) {
        const el = document.getElementById(s.id)
        if (el && el.getBoundingClientRect().top <= 140) current = s.id
      }
      setActive(current)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [isResumeRoute])

  return (
    <>
      {/* Top scroll progress bar (Framer Motion useScroll + useSpring). */}
      <motion.div
        className="no-print fixed top-0 left-0 right-0 h-[2px] origin-left bg-primary z-[60]"
        style={{ scaleX: progress }}
      />

      <header className="no-print fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[min(960px,calc(100%-1.5rem))]">
        <nav className="flex items-center justify-between gap-3 rounded-full border border-border bg-background/70 px-4 py-2 backdrop-blur-xl shadow-lg shadow-black/5">
          <a
            href="#/"
            className="font-sans text-sm font-semibold tracking-tight pl-2 pr-1 hover:text-primary transition-colors whitespace-nowrap"
          >
            Michael Fillalan
          </a>

          {!isResumeRoute && (
            <ul className="hidden md:flex items-center gap-1 text-sm">
              {sections.map((s) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    className={cn(
                      'relative px-3 py-1.5 rounded-full transition-colors',
                      active === s.id
                        ? 'text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground',
                    )}
                  >
                    {/* layoutId animates a single pill between active items */}
                    {active === s.id && (
                      <motion.span
                        layoutId="nav-pill"
                        className="absolute inset-0 bg-primary rounded-full -z-10"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          )}

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleTheme}
              aria-label="Toggle theme"
              className="rounded-full"
            >
              {theme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
            </Button>

            {/* Desktop-only resume button. On mobile the resume link lives in the
                drop-down sheet so we don't crowd the pill. */}
            <Button asChild variant="outline" size="sm" className="rounded-full hidden md:inline-flex">
              <a href="#/resume">
                <FileText className="size-3.5" />
                Resume
              </a>
            </Button>

            {/* Mobile hamburger. Hidden on the resume route since there's
                nothing to navigate to from there. */}
            {!isResumeRoute && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileOpen((o) => !o)}
                aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={mobileOpen}
                className="md:hidden rounded-full"
              >
                <AnimatePresence mode="wait" initial={false}>
                  {mobileOpen ? (
                    <motion.span
                      key="close"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className="inline-flex"
                    >
                      <CloseIcon className="size-4" />
                    </motion.span>
                  ) : (
                    <motion.span
                      key="menu"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className="inline-flex"
                    >
                      <MenuIcon className="size-4" />
                    </motion.span>
                  )}
                </AnimatePresence>
              </Button>
            )}
          </div>
        </nav>

        {/* Mobile drop-down sheet. Sits below the pill, same blurred surface
            so it reads as part of the navbar. Tapping any link closes it. */}
        <AnimatePresence>
          {mobileOpen && !isResumeRoute && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.97 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              style={{ transformOrigin: 'top center' }}
              className="md:hidden mt-2 overflow-hidden rounded-2xl border border-border bg-background/85 backdrop-blur-xl shadow-lg shadow-black/5"
            >
              <ul className="p-2">
                {sections.map((s) => (
                  <li key={s.id}>
                    <a
                      href={`#${s.id}`}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        'block px-4 py-2.5 rounded-xl text-sm transition-colors',
                        active === s.id
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:text-foreground hover:bg-accent',
                      )}
                    >
                      {s.label}
                    </a>
                  </li>
                ))}
                <li className="mt-1 border-t border-border pt-1">
                  <a
                    href="#/resume"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm text-foreground hover:bg-accent transition-colors"
                  >
                    <FileText className="size-3.5" />
                    Resume
                  </a>
                </li>
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  )
}
