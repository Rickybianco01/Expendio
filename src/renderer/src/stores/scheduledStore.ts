import { create } from 'zustand'
import type { ScheduledExpense, ScheduledSnapshot, ID } from '@shared/types'
import { ipc } from '../lib/ipc'
import { todayIso } from '../lib/dates'

interface ScheduledCreateInput {
  name: string
  amountCents: number
  categoryId: ID
  dueDate: string
  note?: string | null
  sourceRecurringId?: ID | null
}

type ScheduledUpdatePatch = Partial<
  Pick<ScheduledExpense, 'name' | 'amountCents' | 'categoryId' | 'dueDate' | 'note'>
>

interface ScheduledState {
  items: ScheduledExpense[]
  reload: () => Promise<void>
  create: (input: ScheduledCreateInput) => Promise<ScheduledExpense>
  update: (id: ID, patch: ScheduledUpdatePatch) => Promise<ScheduledExpense>
  markPaid: (id: ID, paidOn: string) => Promise<ScheduledExpense>
  markUnpaid: (id: ID) => Promise<ScheduledExpense>
  remove: (id: ID, cascadeExpense?: boolean) => Promise<ScheduledSnapshot>
  restore: (snapshot: ScheduledSnapshot) => Promise<ScheduledExpense>
}

function sortByDue(items: ScheduledExpense[]): ScheduledExpense[] {
  return [...items].sort((a, b) => a.dueDate.localeCompare(b.dueDate))
}

export const useScheduledStore = create<ScheduledState>((set, get) => ({
  items: [],
  reload: async () => {
    try {
      await ipc.recurring.materialize(todayIso())
    } catch {
      /* best effort */
    }
    const items = await ipc.scheduled.list()
    set({ items: sortByDue(items) })
  },
  create: async (input) => {
    const item = await ipc.scheduled.create(input)
    set({ items: sortByDue([...get().items, item]) })
    return item
  },
  update: async (id, patch) => {
    const item = await ipc.scheduled.update(id, patch)
    set({ items: sortByDue(get().items.map((s) => (s.id === id ? item : s))) })
    return item
  },
  markPaid: async (id, paidOn) => {
    const item = await ipc.scheduled.markPaid(id, paidOn)
    set({ items: get().items.map((s) => (s.id === id ? item : s)) })
    return item
  },
  markUnpaid: async (id) => {
    const item = await ipc.scheduled.markUnpaid(id)
    set({ items: get().items.map((s) => (s.id === id ? item : s)) })
    return item
  },
  remove: async (id, cascadeExpense = true) => {
    const snapshot = await ipc.scheduled.remove(id, cascadeExpense)
    set({ items: get().items.filter((s) => s.id !== id) })
    return snapshot
  },
  restore: async (snapshot) => {
    const item = await ipc.scheduled.restore(snapshot)
    set({ items: sortByDue([...get().items, item]) })
    return item
  }
}))
