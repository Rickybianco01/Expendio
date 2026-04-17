import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { Biscotto } from '../mascot/Biscotto'
import { SpiralArrow, type ArrowDirection } from './SpiralArrow'
import { it } from '@shared/i18n'

type Placement = 'top' | 'bottom' | 'left' | 'right'

interface TipBubbleProps {
  open: boolean
  targetSelector: string
  title: string
  body: string
  placement?: Placement
  spotlight?: boolean
  dismissLabel?: string
  ctaLabel?: string
  stepLabel?: string
  mood?: 'happy' | 'thinking' | 'cheer'
  onDismiss: () => void
  onCta?: () => void
}

interface Rect {
  top: number
  left: number
  width: number
  height: number
}

const BUBBLE_W = 320
const BUBBLE_H_EST = 200
const GAP = 28

function readRect(el: Element): Rect {
  const r = el.getBoundingClientRect()
  return { top: r.top, left: r.left, width: r.width, height: r.height }
}

function pickPlacement(pref: Placement, rect: Rect, vw: number, vh: number): Placement {
  const fitsAbove = rect.top >= BUBBLE_H_EST + GAP
  const fitsBelow = vh - (rect.top + rect.height) >= BUBBLE_H_EST + GAP
  const fitsRight = vw - (rect.left + rect.width) >= BUBBLE_W + GAP
  const fitsLeft = rect.left >= BUBBLE_W + GAP
  if (pref === 'top' && fitsAbove) return 'top'
  if (pref === 'bottom' && fitsBelow) return 'bottom'
  if (pref === 'right' && fitsRight) return 'right'
  if (pref === 'left' && fitsLeft) return 'left'
  if (fitsBelow) return 'bottom'
  if (fitsAbove) return 'top'
  if (fitsRight) return 'right'
  if (fitsLeft) return 'left'
  return 'bottom'
}

function bubblePos(place: Placement, rect: Rect, vw: number, vh: number): { top: number; left: number } {
  const cx = rect.left + rect.width / 2
  const cy = rect.top + rect.height / 2
  let top = 0
  let left = 0
  switch (place) {
    case 'top':
      top = rect.top - BUBBLE_H_EST - GAP
      left = cx - BUBBLE_W / 2
      break
    case 'bottom':
      top = rect.top + rect.height + GAP
      left = cx - BUBBLE_W / 2
      break
    case 'left':
      top = cy - BUBBLE_H_EST / 2
      left = rect.left - BUBBLE_W - GAP
      break
    case 'right':
      top = cy - BUBBLE_H_EST / 2
      left = rect.left + rect.width + GAP
      break
  }
  left = Math.max(12, Math.min(left, vw - BUBBLE_W - 12))
  top = Math.max(12, Math.min(top, vh - BUBBLE_H_EST - 12))
  return { top, left }
}

function arrowDir(place: Placement): ArrowDirection {
  switch (place) {
    case 'top':
      return 'down'
    case 'bottom':
      return 'up'
    case 'left':
      return 'right'
    case 'right':
      return 'left'
  }
}

export function TipBubble({
  open,
  targetSelector,
  title,
  body,
  placement = 'bottom',
  spotlight = true,
  dismissLabel,
  ctaLabel,
  stepLabel,
  mood = 'happy',
  onDismiss,
  onCta
}: TipBubbleProps) {
  const [rect, setRect] = useState<Rect | null>(null)
  const [vw, setVw] = useState<number>(typeof window === 'undefined' ? 1024 : window.innerWidth)
  const [vh, setVh] = useState<number>(typeof window === 'undefined' ? 768 : window.innerHeight)
  const rafRef = useRef<number | null>(null)

  useLayoutEffect(() => {
    if (!open) return
    const measure = () => {
      const el = document.querySelector(`[data-tip-target="${targetSelector}"]`)
      if (!el) {
        setRect(null)
        return
      }
      setRect(readRect(el))
      setVw(window.innerWidth)
      setVh(window.innerHeight)
    }
    measure()
    const schedule = () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current)
      rafRef.current = requestAnimationFrame(measure)
    }
    window.addEventListener('resize', schedule)
    window.addEventListener('scroll', schedule, true)
    const interval = window.setInterval(measure, 500)
    return () => {
      window.removeEventListener('resize', schedule)
      window.removeEventListener('scroll', schedule, true)
      window.clearInterval(interval)
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current)
    }
  }, [open, targetSelector])

  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onDismiss()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onDismiss])

  if (typeof document === 'undefined') return null

  const ready = open && rect != null
  const place = ready ? pickPlacement(placement, rect, vw, vh) : placement
  const pos = ready ? bubblePos(place, rect, vw, vh) : { top: 0, left: 0 }
  const arrow = arrowDir(place)

  const spotlightPath =
    ready && spotlight
      ? `M0,0 H${vw} V${vh} H0 Z M${rect.left - 8},${rect.top - 8} H${rect.left + rect.width + 8} V${rect.top + rect.height + 8} H${rect.left - 8} Z`
      : ''

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          key="tip-overlay"
          className="fixed inset-0 z-[60]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          {ready && spotlight && (
            <svg
              width={vw}
              height={vh}
              viewBox={`0 0 ${vw} ${vh}`}
              className="absolute inset-0 pointer-events-auto"
              onClick={onDismiss}
              aria-hidden="true"
            >
              <path d={spotlightPath} fillRule="evenodd" fill="rgba(46, 34, 26, 0.45)" />
              <rect
                x={rect.left - 8}
                y={rect.top - 8}
                width={rect.width + 16}
                height={rect.height + 16}
                rx={12}
                fill="none"
                stroke="#C86A3C"
                strokeWidth={3}
                strokeDasharray="8 6"
                className="animate-pulse"
              />
            </svg>
          )}
          {!spotlight && (
            <div
              className="absolute inset-0 bg-ink-700/30"
              onClick={onDismiss}
              aria-hidden="true"
            />
          )}

          {ready && (
            <div
              className="absolute pointer-events-none"
              style={{
                top: Math.min(rect.top, pos.top) - 10,
                left: Math.min(rect.left, pos.left) - 10,
                width: Math.max(rect.left + rect.width, pos.left + BUBBLE_W) - Math.min(rect.left, pos.left) + 20,
                height: Math.max(rect.top + rect.height, pos.top + BUBBLE_H_EST) - Math.min(rect.top, pos.top) + 20
              }}
            >
              <div
                className="absolute"
                style={{
                  top:
                    (place === 'top'
                      ? pos.top - Math.min(rect.top, pos.top) + BUBBLE_H_EST - 40
                      : place === 'bottom'
                        ? rect.top - Math.min(rect.top, pos.top) + rect.height - 6
                        : (rect.top + rect.height / 2) - Math.min(rect.top, pos.top) - 36) + 10,
                  left:
                    (place === 'left'
                      ? pos.left - Math.min(rect.left, pos.left) + BUBBLE_W - 40
                      : place === 'right'
                        ? rect.left - Math.min(rect.left, pos.left) + rect.width - 10
                        : (rect.left + rect.width / 2) - Math.min(rect.left, pos.left) - 70) + 10
                }}
              >
                <SpiralArrow direction={arrow} length={120} />
              </div>
            </div>
          )}

          <motion.div
            role="dialog"
            aria-labelledby="tip-title"
            aria-describedby="tip-body"
            className="absolute pointer-events-auto"
            style={{ top: pos.top, left: pos.left, width: BUBBLE_W }}
            initial={{ opacity: 0, scale: 0.85, y: 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 4 }}
            transition={{ type: 'spring', stiffness: 360, damping: 26 }}
          >
            <div className="relative bg-cream-50 rounded-2xl shadow-pop border-2 border-terracotta-500/60 p-5">
              <button
                onClick={onDismiss}
                aria-label={it.tips.dismissAria}
                className="absolute top-2 right-2 p-1.5 rounded-lg text-ink-500 hover:bg-cream-200"
              >
                <X size={18} />
              </button>
              <div className="flex items-start gap-3">
                <div className="shrink-0 -mt-2 -ml-1">
                  <Biscotto size={64} mood={mood} wag={false} />
                </div>
                <div className="flex-1 min-w-0">
                  {stepLabel && (
                    <p className="text-xs font-semibold uppercase tracking-wide text-terracotta-500 mb-1">
                      {stepLabel}
                    </p>
                  )}
                  <h3 id="tip-title" className="font-heading font-bold text-lg text-ink-700 leading-tight">
                    {title}
                  </h3>
                  <p id="tip-body" className="mt-1.5 text-ink-500 leading-snug">
                    {body}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-end gap-2">
                <button
                  onClick={onDismiss}
                  className="px-3 py-2 rounded-lg text-ink-500 font-semibold hover:bg-cream-200"
                >
                  {dismissLabel ?? it.tips.dismiss}
                </button>
                {onCta && ctaLabel && (
                  <button
                    onClick={onCta}
                    className="px-4 py-2 rounded-lg bg-terracotta-500 text-cream-50 font-semibold shadow-sm hover:bg-terracotta-600"
                  >
                    {ctaLabel}
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  )
}
