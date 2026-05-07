import { useCallback, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Maximize2, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface Screenshot {
  src: string
  caption: string
  alt?: string
}

interface Props {
  screenshots: Screenshot[]
}

/**
 * Inline gallery used inside the project modal. A large hero image swaps in
 * place when a thumbnail is clicked. Clicking the hero opens a fullscreen
 * lightbox with keyboard navigation (←/→/Esc).
 */
export default function ProjectGallery({ screenshots }: Props) {
  const [index, setIndex] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)

  const next = useCallback(
    () => setIndex((i) => (i + 1) % screenshots.length),
    [screenshots.length],
  )
  const prev = useCallback(
    () => setIndex((i) => (i - 1 + screenshots.length) % screenshots.length),
    [screenshots.length],
  )

  // Keyboard nav while the lightbox is open
  useEffect(() => {
    if (!lightboxOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxOpen(false)
      else if (e.key === 'ArrowRight') next()
      else if (e.key === 'ArrowLeft') prev()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lightboxOpen, next, prev])

  // Lock body scroll while lightbox is open so background doesn't move
  useEffect(() => {
    if (!lightboxOpen) return
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prevOverflow
    }
  }, [lightboxOpen])

  if (screenshots.length === 0) return null
  const current = screenshots[index]

  return (
    <div className="space-y-3">
      {/* Hero image */}
      <button
        type="button"
        onClick={() => setLightboxOpen(true)}
        className="group relative block w-full overflow-hidden rounded-xl border border-border bg-muted"
        aria-label="Open fullscreen"
      >
        <AnimatePresence mode="wait">
          <motion.img
            key={current.src}
            src={current.src}
            alt={current.alt ?? current.caption}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            loading="eager"
            className="block w-full object-contain max-h-[420px]"
          />
        </AnimatePresence>
        <div className="absolute right-3 top-3 rounded-md bg-black/55 px-2 py-1 text-white opacity-0 transition-opacity group-hover:opacity-100 backdrop-blur-sm">
          <Maximize2 className="size-3.5" />
        </div>
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/65 via-black/35 to-transparent p-3 pt-12">
          <p className="text-sm font-medium text-white">{current.caption}</p>
          <p className="mt-0.5 font-mono text-[10px] uppercase tracking-wider text-white/65">
            {index + 1} / {screenshots.length}
          </p>
        </div>
      </button>

      {/* Thumbnail strip */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 [scrollbar-width:thin]">
        {screenshots.map((s, i) => (
          <button
            key={s.src}
            type="button"
            onClick={() => setIndex(i)}
            aria-label={`Show: ${s.caption}`}
            className={cn(
              'relative shrink-0 overflow-hidden rounded-md border-2 transition-all',
              i === index
                ? 'border-primary opacity-100'
                : 'border-transparent opacity-55 hover:opacity-100',
            )}
          >
            <img
              src={s.src}
              alt=""
              loading="lazy"
              className="block h-14 w-24 object-cover"
            />
          </button>
        ))}
      </div>

      {/* Fullscreen lightbox — portaled to body so it escapes the project
          modal's stacking context (the modal sets willChange:transform, which
          would otherwise trap this `fixed` element inside the modal's bounds). */}
      {createPortal(
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            className="fixed inset-0 z-[60] flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            <div
              className="absolute inset-0 bg-black/92"
              onClick={() => setLightboxOpen(false)}
            />

            <button
              onClick={() => setLightboxOpen(false)}
              aria-label="Close"
              className="absolute right-4 top-4 z-10 rounded-full p-2 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
            >
              <X className="size-6" />
            </button>

            {screenshots.length > 1 && (
              <>
                <button
                  onClick={prev}
                  aria-label="Previous"
                  className="absolute left-4 z-10 rounded-full p-3 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <ChevronLeft className="size-7" />
                </button>
                <button
                  onClick={next}
                  aria-label="Next"
                  className="absolute right-4 z-10 rounded-full p-3 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <ChevronRight className="size-7" />
                </button>
              </>
            )}

            <AnimatePresence mode="wait">
              <motion.img
                key={current.src}
                src={current.src}
                alt={current.alt ?? current.caption}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className="relative max-h-[88vh] max-w-[92vw] object-contain"
              />
            </AnimatePresence>

            <div className="absolute inset-x-0 bottom-6 z-10 text-center">
              <p className="mx-auto max-w-2xl text-sm font-medium text-white">
                {current.caption}
              </p>
              <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-white/55">
                {index + 1} / {screenshots.length}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>,
        document.body,
      )}
    </div>
  )
}
