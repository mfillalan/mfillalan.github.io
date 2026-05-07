import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import About from './components/About'
import Projects from './components/Projects'
import Skills from './components/Skills'
import Education from './components/Education'
import Experience from './components/Experience'
import Contact from './components/Contact'
import ResumePage from './components/ResumePage'
import KonamiMatrix from './components/KonamiMatrix'
import AmbientParticles from './components/AmbientParticles'

type Theme = 'light' | 'dark'

function App() {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('theme') as Theme | null
    if (saved) return saved
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })

  const [isResumeRoute, setIsResumeRoute] = useState(() =>
    window.location.hash.startsWith('#/resume'),
  )

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    localStorage.setItem('theme', theme)
  }, [theme])

  useEffect(() => {
    const onHashChange = () => {
      const nextIsResume = window.location.hash.startsWith('#/resume')
      // Only reset scroll when entering/leaving the resume route,
      // not on every section anchor change.
      setIsResumeRoute((prev) => {
        if (prev !== nextIsResume) window.scrollTo(0, 0)
        return nextIsResume
      })
    }
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))

  // Long-press alternative to the keyboard Konami code, so touch users can
  // trigger the easter egg too. 1.5s feels deliberate without being tedious.
  // konamiPressed drives a progress bar (rendered below) that fills to 100%
  // exactly as the timer completes, giving real-time visual feedback.
  const KONAMI_HOLD_MS = 1500
  const konamiHoldTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [konamiPressed, setKonamiPressed] = useState(false)
  const beginKonamiHold = () => {
    if (konamiHoldTimer.current) return
    setKonamiPressed(true)
    konamiHoldTimer.current = setTimeout(() => {
      window.dispatchEvent(new CustomEvent('konami:activate'))
      konamiHoldTimer.current = null
      setKonamiPressed(false)
    }, KONAMI_HOLD_MS)
  }
  const endKonamiHold = () => {
    if (konamiHoldTimer.current) {
      clearTimeout(konamiHoldTimer.current)
      konamiHoldTimer.current = null
    }
    setKonamiPressed(false)
  }

  return (
    <div className="relative min-h-screen text-foreground">
      {!isResumeRoute && <AmbientParticles />}
      <KonamiMatrix />
      <Navbar isResumeRoute={isResumeRoute} theme={theme} onToggleTheme={toggleTheme} />

      <main>
        {isResumeRoute ? (
          <ResumePage />
        ) : (
          <>
            <Hero />
            <About />
            <Projects />
            <Skills />
            <Experience />
            <Education />
            <Contact />
          </>
        )}
      </main>

      {!isResumeRoute && (
        <footer className="border-t border-border py-10 px-6">
          <div className="container mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} Michael Fillalan.</p>
            <div className="relative">
              <p
                data-boid-orbit
                className="font-mono text-xs select-none cursor-pointer transition-all active:scale-110 active:text-primary touch-none"
                title="Try the Konami code, or hold to trigger"
                onTouchStart={beginKonamiHold}
                onTouchEnd={endKonamiHold}
                onTouchCancel={endKonamiHold}
                onTouchMove={endKonamiHold}
                onMouseDown={beginKonamiHold}
                onMouseUp={endKonamiHold}
                onMouseLeave={endKonamiHold}
              >
                ↑↑↓↓←→←→BA
              </p>
              {/* Progress bar that fills 0→100% over the hold duration. Lives
                  in the same relative wrapper, animates scaleX from 0 to 1
                  via Framer Motion so it stays GPU-accelerated. */}
              <motion.div
                className="pointer-events-none absolute -bottom-1.5 left-0 right-0 h-[2px] origin-left rounded-full bg-primary"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: konamiPressed ? 1 : 0 }}
                transition={{
                  duration: konamiPressed ? KONAMI_HOLD_MS / 1000 : 0.22,
                  ease: konamiPressed ? 'linear' : 'easeOut',
                }}
              />
            </div>
          </div>
        </footer>
      )}
    </div>
  )
}

export default App
