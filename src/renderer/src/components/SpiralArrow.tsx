import { motion } from 'framer-motion'

export type ArrowDirection =
  | 'right'
  | 'left'
  | 'up'
  | 'down'
  | 'up-right'
  | 'up-left'
  | 'down-right'
  | 'down-left'

interface SpiralArrowProps {
  direction?: ArrowDirection
  length?: number
  color?: string
  className?: string
  delay?: number
  duration?: number
  ariaLabel?: string
}

const ROTATIONS: Record<ArrowDirection, number> = {
  right: 0,
  'down-right': 45,
  down: 90,
  'down-left': 135,
  left: 180,
  'up-left': 225,
  up: 270,
  'up-right': 315
}

const CURL_PATH =
  'M 18 38 C 4 46 4 76 28 82 C 52 88 64 60 52 46 C 42 34 26 42 30 58 C 34 72 64 74 90 68 C 130 60 160 62 180 62'

const HEAD_POINTS = '192,62 168,48 168,76'

export function SpiralArrow({
  direction = 'right',
  length = 140,
  color = '#2C2320',
  className = '',
  delay = 0.15,
  duration = 1.1,
  ariaLabel = 'freccia'
}: SpiralArrowProps) {
  const rotate = ROTATIONS[direction]
  const width = length
  const height = Math.round(length * 0.6)

  return (
    <svg
      role="img"
      aria-label={ariaLabel}
      width={width}
      height={height}
      viewBox="0 0 200 120"
      className={className}
      style={{ transform: `rotate(${rotate}deg)`, transformOrigin: '50% 50%', overflow: 'visible' }}
      fill="none"
    >
      <motion.path
        d={CURL_PATH}
        stroke={color}
        strokeWidth={6}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ pathLength: { delay, duration, ease: 'easeInOut' }, opacity: { delay, duration: 0.2 } }}
      />
      <motion.polygon
        points={HEAD_POINTS}
        fill={color}
        stroke={color}
        strokeWidth={2}
        strokeLinejoin="round"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: delay + duration * 0.85, duration: 0.35, ease: 'backOut' }}
        style={{ transformOrigin: '192px 62px' }}
      />
    </svg>
  )
}
