import type {
  Category,
  Expense,
  Budget,
  RecurringExpense,
  ShoppingItem,
  ScheduledExpense,
  ScheduledRangeSummary,
  ScheduledSnapshot,
  Settings,
  MonthlySummary,
  IpcResult,
  UpdateStatus,
  ID
} from '@shared/types'

type ExpendioBridge = {
  categories: {
    list: () => Promise<IpcResult<Category[]>>
    create: (input: Omit<Category, 'id'>) => Promise<IpcResult<Category>>
    update: (id: ID, patch: Partial<Omit<Category, 'id'>>) => Promise<IpcResult<Category>>
    archive: (id: ID, archived: boolean) => Promise<IpcResult<Category>>
  }
  expenses: {
    listByMonth: (month: string) => Promise<IpcResult<Expense[]>>
    listAll: () => Promise<IpcResult<Expense[]>>
    get: (id: ID) => Promise<IpcResult<Expense | null>>
    create: (input: {
      amountCents: number
      categoryId: ID
      occurredOn: string
      note?: string | null
      recurringExpenseId?: ID | null
    }) => Promise<IpcResult<Expense>>
    update: (
      id: ID,
      patch: Partial<Pick<Expense, 'amountCents' | 'categoryId' | 'occurredOn' | 'note'>>
    ) => Promise<IpcResult<Expense>>
    softDelete: (id: ID) => Promise<IpcResult<Expense>>
    restore: (id: ID) => Promise<IpcResult<Expense>>
    summary: (month: string) => Promise<IpcResult<MonthlySummary>>
  }
  budgets: {
    list: () => Promise<IpcResult<Budget[]>>
    upsert: (input: Omit<Budget, 'id'> & { id?: ID }) => Promise<IpcResult<Budget>>
    remove: (id: ID) => Promise<IpcResult<boolean>>
  }
  recurring: {
    list: () => Promise<IpcResult<RecurringExpense[]>>
    create: (input: Omit<RecurringExpense, 'id' | 'createdAt'>) => Promise<IpcResult<RecurringExpense>>
    update: (
      id: ID,
      patch: Partial<Omit<RecurringExpense, 'id' | 'createdAt'>>
    ) => Promise<IpcResult<RecurringExpense>>
    remove: (id: ID) => Promise<IpcResult<boolean>>
    materialize: (today: string) => Promise<IpcResult<number>>
  }
  shopping: {
    list: () => Promise<IpcResult<ShoppingItem[]>>
    add: (text: string) => Promise<IpcResult<ShoppingItem>>
    toggle: (id: ID) => Promise<IpcResult<ShoppingItem>>
    remove: (id: ID) => Promise<IpcResult<boolean>>
    clearDone: () => Promise<IpcResult<number>>
  }
  scheduled: {
    list: () => Promise<IpcResult<ScheduledExpense[]>>
    listByRange: (start: string, end: string) => Promise<IpcResult<ScheduledExpense[]>>
    get: (id: ID) => Promise<IpcResult<ScheduledExpense | null>>
    create: (input: {
      name: string
      amountCents: number
      categoryId: ID
      dueDate: string
      note?: string | null
      sourceRecurringId?: ID | null
    }) => Promise<IpcResult<ScheduledExpense>>
    update: (
      id: ID,
      patch: Partial<
        Pick<ScheduledExpense, 'name' | 'amountCents' | 'categoryId' | 'dueDate' | 'note'>
      >
    ) => Promise<IpcResult<ScheduledExpense>>
    markPaid: (id: ID, paidOn: string) => Promise<IpcResult<ScheduledExpense>>
    markUnpaid: (id: ID) => Promise<IpcResult<ScheduledExpense>>
    remove: (id: ID, cascadeExpense?: boolean) => Promise<IpcResult<ScheduledSnapshot>>
    restore: (snapshot: ScheduledSnapshot) => Promise<IpcResult<ScheduledExpense>>
    summary: (
      start: string,
      end: string,
      today: string
    ) => Promise<IpcResult<ScheduledRangeSummary>>
  }
  settings: {
    get: () => Promise<IpcResult<Settings>>
    update: (patch: Partial<Settings>) => Promise<IpcResult<Settings>>
  }
  backup: {
    pickFolder: () => Promise<IpcResult<string | null>>
    exportNow: (folder?: string) => Promise<IpcResult<string | null>>
    importNow: () => Promise<IpcResult<string | null>>
    autoIfDue: () => Promise<IpcResult<{ ran: boolean; path?: string; reason?: string }>>
  }
  app: {
    version: () => Promise<IpcResult<string>>
    openExternal: (url: string) => Promise<IpcResult<void>>
    savePdf: (fileName: string) => Promise<IpcResult<string | null>>
  }
  updater: {
    check: () => Promise<IpcResult<string | null>>
    download: () => Promise<IpcResult<boolean>>
    install: () => Promise<IpcResult<boolean>>
    status: () => Promise<IpcResult<UpdateStatus>>
    onStatus: (listener: (status: UpdateStatus) => void) => () => void
  }
}

declare global {
  interface Window {
    expendio: ExpendioBridge
  }
}

async function unwrap<T>(p: Promise<IpcResult<T>>): Promise<T> {
  const res = await p
  if (!res.ok) throw new Error(res.error)
  return res.value
}

export const ipc = {
  categories: {
    list: () => unwrap(window.expendio.categories.list()),
    create: (input: Omit<Category, 'id'>) => unwrap(window.expendio.categories.create(input)),
    update: (id: ID, patch: Partial<Omit<Category, 'id'>>) =>
      unwrap(window.expendio.categories.update(id, patch)),
    archive: (id: ID, archived: boolean) => unwrap(window.expendio.categories.archive(id, archived))
  },
  expenses: {
    listByMonth: (month: string) => unwrap(window.expendio.expenses.listByMonth(month)),
    listAll: () => unwrap(window.expendio.expenses.listAll()),
    get: (id: ID) => unwrap(window.expendio.expenses.get(id)),
    create: (input: {
      amountCents: number
      categoryId: ID
      occurredOn: string
      note?: string | null
      recurringExpenseId?: ID | null
    }) => unwrap(window.expendio.expenses.create(input)),
    update: (
      id: ID,
      patch: Partial<Pick<Expense, 'amountCents' | 'categoryId' | 'occurredOn' | 'note'>>
    ) => unwrap(window.expendio.expenses.update(id, patch)),
    softDelete: (id: ID) => unwrap(window.expendio.expenses.softDelete(id)),
    restore: (id: ID) => unwrap(window.expendio.expenses.restore(id)),
    summary: (month: string) => unwrap(window.expendio.expenses.summary(month))
  },
  budgets: {
    list: () => unwrap(window.expendio.budgets.list()),
    upsert: (input: Omit<Budget, 'id'> & { id?: ID }) =>
      unwrap(window.expendio.budgets.upsert(input)),
    remove: (id: ID) => unwrap(window.expendio.budgets.remove(id))
  },
  recurring: {
    list: () => unwrap(window.expendio.recurring.list()),
    create: (input: Omit<RecurringExpense, 'id' | 'createdAt'>) =>
      unwrap(window.expendio.recurring.create(input)),
    update: (id: ID, patch: Partial<Omit<RecurringExpense, 'id' | 'createdAt'>>) =>
      unwrap(window.expendio.recurring.update(id, patch)),
    remove: (id: ID) => unwrap(window.expendio.recurring.remove(id)),
    materialize: (today: string) => unwrap(window.expendio.recurring.materialize(today))
  },
  shopping: {
    list: () => unwrap(window.expendio.shopping.list()),
    add: (text: string) => unwrap(window.expendio.shopping.add(text)),
    toggle: (id: ID) => unwrap(window.expendio.shopping.toggle(id)),
    remove: (id: ID) => unwrap(window.expendio.shopping.remove(id)),
    clearDone: () => unwrap(window.expendio.shopping.clearDone())
  },
  scheduled: {
    list: () => unwrap(window.expendio.scheduled.list()),
    listByRange: (start: string, end: string) =>
      unwrap(window.expendio.scheduled.listByRange(start, end)),
    get: (id: ID) => unwrap(window.expendio.scheduled.get(id)),
    create: (input: {
      name: string
      amountCents: number
      categoryId: ID
      dueDate: string
      note?: string | null
      sourceRecurringId?: ID | null
    }) => unwrap(window.expendio.scheduled.create(input)),
    update: (
      id: ID,
      patch: Partial<
        Pick<ScheduledExpense, 'name' | 'amountCents' | 'categoryId' | 'dueDate' | 'note'>
      >
    ) => unwrap(window.expendio.scheduled.update(id, patch)),
    markPaid: (id: ID, paidOn: string) => unwrap(window.expendio.scheduled.markPaid(id, paidOn)),
    markUnpaid: (id: ID) => unwrap(window.expendio.scheduled.markUnpaid(id)),
    remove: (id: ID, cascadeExpense = true) =>
      unwrap(window.expendio.scheduled.remove(id, cascadeExpense)),
    restore: (snapshot: ScheduledSnapshot) =>
      unwrap(window.expendio.scheduled.restore(snapshot)),
    summary: (start: string, end: string, today: string) =>
      unwrap(window.expendio.scheduled.summary(start, end, today))
  },
  settings: {
    get: () => unwrap(window.expendio.settings.get()),
    update: (patch: Partial<Settings>) => unwrap(window.expendio.settings.update(patch))
  },
  backup: {
    pickFolder: () => unwrap(window.expendio.backup.pickFolder()),
    exportNow: (folder?: string) => unwrap(window.expendio.backup.exportNow(folder)),
    importNow: () => unwrap(window.expendio.backup.importNow()),
    autoIfDue: () => unwrap(window.expendio.backup.autoIfDue())
  },
  app: {
    version: () => unwrap(window.expendio.app.version()),
    openExternal: (url: string) => unwrap(window.expendio.app.openExternal(url)),
    savePdf: (fileName: string) => unwrap(window.expendio.app.savePdf(fileName))
  },
  updater: {
    check: () => unwrap(window.expendio.updater.check()),
    download: () => unwrap(window.expendio.updater.download()),
    install: () => unwrap(window.expendio.updater.install()),
    status: () => unwrap(window.expendio.updater.status()),
    onStatus: (listener: (status: UpdateStatus) => void) =>
      window.expendio.updater.onStatus(listener)
  }
}
