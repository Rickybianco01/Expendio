import { create } from 'zustand'

interface TourRuntimeState {
  replayScreen: string | null
  replay: (screen: string) => void
  clearReplay: () => void
}

export const useTourRuntime = create<TourRuntimeState>((set) => ({
  replayScreen: null,
  replay: (screen) => set({ replayScreen: screen }),
  clearReplay: () => set({ replayScreen: null })
}))
