import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, HelpCircle } from 'lucide-react'
import { useTourRuntime } from '../stores/tourStore'
import { it } from '@shared/i18n'

interface TopBarProps {
  title: string
  back?: boolean
  right?: ReactNode
  subtitle?: string
  help?: string
}

export function TopBar({ title, back, right, subtitle, help }: TopBarProps) {
  const nav = useNavigate()
  const replay = useTourRuntime((s) => s.replay)
  return (
    <header className="sticky top-0 z-30 bg-cream-100/90 backdrop-blur border-b border-cream-300">
      <div className="max-w-4xl mx-auto flex items-center gap-3 px-4 py-3">
        {back && (
          <button
            onClick={() => nav(-1)}
            className="p-2 rounded-lg hover:bg-cream-200 text-ink-500"
            aria-label="Indietro"
          >
            <ArrowLeft size={22} />
          </button>
        )}
        <div className="flex-1">
          <h1 className="text-2xl font-heading font-bold">{title}</h1>
          {subtitle && <p className="text-ink-500">{subtitle}</p>}
        </div>
        {help && (
          <button
            onClick={() => replay(help)}
            className="p-2 rounded-lg hover:bg-cream-200 text-terracotta-500"
            aria-label={it.tips.helpAria}
            title={it.tips.replayTour}
          >
            <HelpCircle size={22} />
          </button>
        )}
        {right}
      </div>
    </header>
  )
}
