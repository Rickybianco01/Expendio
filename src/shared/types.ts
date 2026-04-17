export type ID = string

export type CategorySlug =
  | 'spesa'
  | 'bollette'
  | 'animali'
  | 'salute'
  | 'trasporti'
  | 'casa'
  | 'abbigliamento'
  | 'svago'
  | 'ristorante'
  | 'regali'
  | 'altro'
  | string

export interface Category {
  id: ID
  slug: CategorySlug
  name: string
  icon: string
  color: string
  isDefault: boolean
  sortOrder: number
  archived: boolean
}

export interface Expense {
  id: ID
  amountCents: number
  categoryId: ID
  occurredOn: string
  note: string | null
  createdAt: string
  updatedAt: string
  deletedAt: string | null
  recurringExpenseId: ID | null
}

export interface Budget {
  id: ID
  categoryId: ID
  month: string | null
  amountCents: number
}

export type RecurringFrequency = 'monthly' | 'bimonthly' | 'quarterly' | 'yearly'

export interface RecurringExpense {
  id: ID
  name: string
  categoryId: ID
  amountCents: number | null
  frequency: RecurringFrequency
  nextDue: string
  reminderDaysBefore: number
  active: boolean
  createdAt: string
}

export interface ShoppingItem {
  id: ID
  text: string
  checked: boolean
  createdAt: string
}

export interface ScheduledExpense {
  id: ID
  name: string
  amountCents: number
  categoryId: ID
  dueDate: string
  paidOn: string | null
  note: string | null
  sourceRecurringId: ID | null
  expenseId: ID | null
  createdAt: string
  updatedAt: string
}

export interface TipsState {
  dismissedIds: string[]
  visitedScreens: string[]
}

export interface Settings {
  firstLaunchDone: boolean
  backupFolder: string | null
  lastBackupAt: string | null
  autoBackupWeekly: boolean
  largeText: boolean
  cucciolate: number
  tipsState: TipsState
}

export interface DBSchema {
  schemaVersion: number
  installedAt: string
  categories: Category[]
  expenses: Expense[]
  budgets: Budget[]
  recurring: RecurringExpense[]
  shopping: ShoppingItem[]
  scheduled: ScheduledExpense[]
  settings: Settings
}

export interface ScheduledSnapshot {
  scheduled: ScheduledExpense
  expense: Expense | null
}

export interface ScheduledRangeSummary {
  rangeStart: string
  rangeEnd: string
  totalCents: number
  paidCents: number
  unpaidCents: number
  overdueCents: number
  count: number
  paidCount: number
  overdueCount: number
}

export interface MonthlySummary {
  month: string
  totalCents: number
  byCategory: Array<{ categoryId: ID; totalCents: number; count: number }>
  previousMonthTotalCents: number
  topCategories: Array<{ categoryId: ID; totalCents: number }>
  dailyAverageCents: number
  count: number
}

export interface BackupMeta {
  exportedAt: string
  version: number
  productName: 'Expendio' | 'Casami'
}

export interface BackupPayload extends BackupMeta {
  data: DBSchema
}

export type IpcResult<T> = { ok: true; value: T } | { ok: false; error: string }

export type UpdateStatus =
  | { state: 'idle' }
  | { state: 'checking' }
  | { state: 'available'; version: string }
  | { state: 'not-available'; version: string }
  | { state: 'downloading'; percent: number; transferred: number; total: number }
  | { state: 'downloaded'; version: string }
  | { state: 'error'; message: string }
