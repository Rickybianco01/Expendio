import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { TipBubble } from './TipBubble'
import { useTipsStore } from '../stores/tipsStore'
import { useTourRuntime } from '../stores/tourStore'
import { it } from '@shared/i18n'

type Placement = 'top' | 'bottom' | 'left' | 'right'
type Mood = 'happy' | 'thinking' | 'cheer'

interface TourStep {
  id: string
  target: string
  title: string
  body: string
  placement?: Placement
  mood?: Mood
  spotlight?: boolean
}

const TOURS: Record<string, TourStep[]> = {
  '/': [
    {
      id: 'home-add',
      target: 'home-add',
      title: it.tips.homeAdd.title,
      body: it.tips.homeAdd.body,
      placement: 'top',
      mood: 'cheer'
    },
    {
      id: 'home-nav',
      target: 'bottom-nav',
      title: it.tips.homeNav.title,
      body: it.tips.homeNav.body,
      placement: 'top',
      mood: 'happy'
    }
  ],
  '/aggiungi': [
    {
      id: 'add-amount',
      target: 'add-amount',
      title: it.tips.addAmount.title,
      body: it.tips.addAmount.body,
      placement: 'bottom',
      mood: 'thinking'
    },
    {
      id: 'add-category',
      target: 'add-category',
      title: it.tips.addCategory.title,
      body: it.tips.addCategory.body,
      placement: 'top',
      mood: 'happy'
    },
    {
      id: 'add-date',
      target: 'add-date',
      title: it.tips.addDate.title,
      body: it.tips.addDate.body,
      placement: 'top',
      mood: 'cheer'
    }
  ],
  '/scadenziario': [
    {
      id: 'scheduled-add',
      target: 'scheduled-add',
      title: it.tips.scheduledAdd.title,
      body: it.tips.scheduledAdd.body,
      placement: 'bottom',
      mood: 'happy'
    },
    {
      id: 'scheduled-view',
      target: 'scheduled-view',
      title: it.tips.scheduledView.title,
      body: it.tips.scheduledView.body,
      placement: 'bottom',
      mood: 'thinking'
    },
    {
      id: 'scheduled-pay',
      target: 'scheduled-pay',
      title: it.tips.scheduledPay.title,
      body: it.tips.scheduledPay.body,
      placement: 'left',
      mood: 'cheer'
    }
  ],
  '/budget': [
    {
      id: 'budget-intro',
      target: 'budget-root',
      title: it.tips.budgetIntro.title,
      body: it.tips.budgetIntro.body,
      placement: 'bottom',
      mood: 'thinking',
      spotlight: false
    }
  ],
  '/ricorrenti': [
    {
      id: 'recurring-intro',
      target: 'recurring-root',
      title: it.tips.recurringIntro.title,
      body: it.tips.recurringIntro.body,
      placement: 'bottom',
      mood: 'happy',
      spotlight: false
    }
  ],
  '/lista-spesa': [
    {
      id: 'shopping-intro',
      target: 'shopping-root',
      title: it.tips.shoppingIntro.title,
      body: it.tips.shoppingIntro.body,
      placement: 'bottom',
      mood: 'cheer',
      spotlight: false
    }
  ],
  '/riepilogo': [
    {
      id: 'recap-intro',
      target: 'recap-root',
      title: it.tips.recapIntro.title,
      body: it.tips.recapIntro.body,
      placement: 'bottom',
      mood: 'thinking',
      spotlight: false
    }
  ],
  '/impostazioni': [
    {
      id: 'settings-backup',
      target: 'settings-backup',
      title: it.tips.settingsBackup.title,
      body: it.tips.settingsBackup.body,
      placement: 'top',
      mood: 'cheer'
    }
  ]
}

export function TourOverlay(): JSX.Element | null {
  const { pathname } = useLocation()
  const replayScreen = useTourRuntime((s) => s.replayScreen)
  const clearReplay = useTourRuntime((s) => s.clearReplay)
  const isVisited = useTipsStore((s) => s.isVisited)
  const markVisited = useTipsStore((s) => s.markVisited)
  const [index, setIndex] = useState<number | null>(null)

  const activeScreen = replayScreen ?? pathname
  const steps = TOURS[activeScreen] ?? []

  useEffect(() => {
    if (replayScreen) {
      setIndex(TOURS[replayScreen] ? 0 : null)
      return
    }
    const list = TOURS[pathname]
    if (!list || list.length === 0) {
      setIndex(null)
      return
    }
    setIndex(isVisited(pathname) ? null : 0)
  }, [pathname, replayScreen, isVisited])

  if (steps.length === 0 || index === null) return null

  const step = steps[index]
  const isLast = index === steps.length - 1

  const finish = async (): Promise<void> => {
    setIndex(null)
    await markVisited(activeScreen)
    if (replayScreen) clearReplay()
  }

  const advance = (): void => {
    if (isLast) void finish()
    else setIndex(index + 1)
  }

  return (
    <TipBubble
      open
      targetSelector={step.target}
      title={step.title}
      body={step.body}
      placement={step.placement ?? 'bottom'}
      mood={step.mood ?? 'happy'}
      spotlight={step.spotlight ?? true}
      stepLabel={`${index + 1} / ${steps.length}`}
      dismissLabel={isLast ? it.tips.gotIt : it.tips.skipTour}
      ctaLabel={isLast ? it.tips.done : it.tips.next}
      onDismiss={() => {
        void finish()
      }}
      onCta={advance}
    />
  )
}
