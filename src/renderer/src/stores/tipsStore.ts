import { create } from 'zustand'
import type { TipsState } from '@shared/types'
import { useSettingsStore } from './settingsStore'

interface TipsStoreState {
  isDismissed: (id: string) => boolean
  isVisited: (screen: string) => boolean
  dismiss: (id: string) => Promise<void>
  markVisited: (screen: string) => Promise<void>
  resetForScreen: (screen: string, tipIds: string[]) => Promise<void>
  resetAll: () => Promise<void>
}

function emptyState(): TipsState {
  return { dismissedIds: [], visitedScreens: [] }
}

function readState(): TipsState {
  const s = useSettingsStore.getState().settings
  if (!s || !s.tipsState) return emptyState()
  return {
    dismissedIds: Array.isArray(s.tipsState.dismissedIds) ? s.tipsState.dismissedIds : [],
    visitedScreens: Array.isArray(s.tipsState.visitedScreens) ? s.tipsState.visitedScreens : []
  }
}

async function writeState(next: TipsState): Promise<void> {
  await useSettingsStore.getState().update({ tipsState: next })
}

export const useTipsStore = create<TipsStoreState>(() => ({
  isDismissed: (id) => readState().dismissedIds.includes(id),
  isVisited: (screen) => readState().visitedScreens.includes(screen),
  dismiss: async (id) => {
    const cur = readState()
    if (cur.dismissedIds.includes(id)) return
    await writeState({ ...cur, dismissedIds: [...cur.dismissedIds, id] })
  },
  markVisited: async (screen) => {
    const cur = readState()
    if (cur.visitedScreens.includes(screen)) return
    await writeState({ ...cur, visitedScreens: [...cur.visitedScreens, screen] })
  },
  resetForScreen: async (screen, tipIds) => {
    const cur = readState()
    await writeState({
      dismissedIds: cur.dismissedIds.filter((id) => !tipIds.includes(id)),
      visitedScreens: cur.visitedScreens.filter((s) => s !== screen)
    })
  },
  resetAll: async () => {
    await writeState(emptyState())
  }
}))
