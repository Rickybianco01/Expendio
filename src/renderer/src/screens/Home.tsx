import { useEffect, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Plus,
  ArrowRight,
  ChevronRight,
  ShoppingBasket,
  Repeat,
  Wallet,
  CalendarClock,
  Check
} from 'lucide-react'
import { useExpenseStore } from '../stores/expenseStore'
import { useCategoryStore } from '../stores/categoryStore'
import { useBudgetStore } from '../stores/budgetStore'
import { useScheduledStore } from '../stores/scheduledStore'
import {
  currentMonth,
  monthLabel,
  prettyDate,
  todayIso,
  daysUntil,
  isOverdue,
  shortDate
} from '../lib/dates'
import { formatEuro } from '../lib/format'
import { CategoryBadge } from '../components/CategoryBadge'
import { Button } from '../components/Button'
import { Biscotto } from '../mascot/Biscotto'
import { it } from '@shared/i18n'

function upcomingLabel(due: string, today: string): string {
  const diff = daysUntil(due, today)
  if (diff === 0) return it.scheduled.today
  if (diff === 1) return it.scheduled.tomorrow
  if (diff < 0) {
    const n = Math.abs(diff)
    return n === 1 ? it.scheduled.overdueByOne : it.scheduled.overdueBy.replace('{days}', String(n))
  }
  return it.scheduled.dueIn.replace('{days}', String(diff))
}

export function Home() {
  const nav = useNavigate()
  const month = currentMonth()
  const { expenses, summary, loadMonth } = useExpenseStore()
  const byId = useCategoryStore((s) => s.byId)
  const { budgets, reload: reloadBudgets } = useBudgetStore()
  const {
    items: scheduledItems,
    reload: reloadScheduled,
    markPaid: markScheduledPaid
  } = useScheduledStore()
  const today = todayIso()

  useEffect(() => {
    reloadBudgets()
  }, [reloadBudgets])

  useEffect(() => {
    reloadScheduled()
  }, [reloadScheduled])

  const upcomingScheduled = useMemo(() => {
    return [...scheduledItems]
      .filter((s) => !s.paidOn)
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
      .slice(0, 3)
  }, [scheduledItems])

  const recent = useMemo(
    () =>
      [...expenses]
        .sort((a, b) => b.occurredOn.localeCompare(a.occurredOn))
        .slice(0, 5),
    [expenses]
  )

  const vsPrev = useMemo(() => {
    if (!summary) return null
    const diff = summary.totalCents - summary.previousMonthTotalCents
    if (Math.abs(diff) < 100) return { kind: 'same' as const, delta: 0 }
    if (diff < 0) return { kind: 'less' as const, delta: Math.abs(diff) }
    return { kind: 'more' as const, delta: diff }
  }, [summary])

  const top = (summary?.topCategories ?? []).slice(0, 3)

  async function openAdd() {
    nav('/aggiungi')
  }

  useEffect(() => {
    if (useExpenseStore.getState().month !== month) {
      loadMonth(month)
    }
  }, [month, loadMonth])

  const budgetsThisMonth = budgets.filter(
    (b) => b.month === null || b.month === month
  )

  return (
    <div className="max-w-4xl mx-auto px-4 pt-4 pb-6 space-y-4">
      <h1 className="text-center text-3xl font-heading font-bold text-terracotta-600 pt-2">
        Il portafoglio di Elena
      </h1>
      <div className="card flex items-center gap-4">
        <Biscotto mood="happy" size={96} />
        <div className="flex-1">
          <p className="text-ink-500">{it.home.greeting}</p>
          <p className="text-3xl font-heading font-bold capitalize">{monthLabel(month)}</p>
          <p className="text-ink-500">{it.home.monthTotal}</p>
          <p className="text-4xl font-bold text-terra-700 mt-1">
            {formatEuro(summary?.totalCents ?? 0)}
          </p>
          {vsPrev && (
            <p className="text-ink-500 mt-1">
              {vsPrev.kind === 'less' && `${it.home.vsPrev.less} (−${formatEuro(vsPrev.delta)})`}
              {vsPrev.kind === 'more' && `${it.home.vsPrev.more} (+${formatEuro(vsPrev.delta)})`}
              {vsPrev.kind === 'same' && it.home.vsPrev.same}
            </p>
          )}
        </div>
      </div>

      <div data-tip-target="home-add">
        <Button onClick={openAdd} size="xl" block>
          <Plus size={28} /> {it.home.addExpense}
        </Button>
      </div>

      <div className="card">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-heading font-bold">{it.home.recent}</h2>
          <Link
            to="/spese"
            className="text-terra-700 font-semibold inline-flex items-center gap-1 hover:underline"
          >
            {it.home.viewAll} <ArrowRight size={18} />
          </Link>
        </div>
        {recent.length === 0 ? (
          <p className="text-ink-500 mt-3">{it.home.noRecent}</p>
        ) : (
          <ul className="mt-3 divide-y divide-cream-300">
            {recent.map((exp) => {
              const cat = byId(exp.categoryId)
              return (
                <li key={exp.id}>
                  <Link
                    to={`/spese/${exp.id}`}
                    className="flex items-center gap-3 py-3 hover:bg-cream-200 -mx-2 px-2 rounded-lg transition"
                  >
                    <CategoryBadge category={cat} withLabel={false} size={40} />
                    <div className="flex-1">
                      <p className="font-semibold">{cat?.name ?? 'Senza categoria'}</p>
                      <p className="text-ink-500 text-sm capitalize">
                        {prettyDate(exp.occurredOn)}
                        {exp.note ? ` · ${exp.note}` : ''}
                      </p>
                    </div>
                    <p className="font-bold text-lg">{formatEuro(exp.amountCents)}</p>
                    <ChevronRight size={20} className="text-ink-500" />
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      {top.length > 0 && (
        <div className="card">
          <h2 className="text-2xl font-heading font-bold">{it.home.topCategories}</h2>
          <ul className="mt-3 space-y-2">
            {top.map((entry) => {
              const cat = byId(entry.categoryId)
              return (
                <li key={entry.categoryId} className="flex items-center gap-3">
                  <CategoryBadge category={cat} withLabel={false} size={36} />
                  <span className="flex-1 font-semibold">{cat?.name ?? 'Senza categoria'}</span>
                  <span className="font-bold">{formatEuro(entry.totalCents)}</span>
                </li>
              )
            })}
          </ul>
        </div>
      )}

      <div className="card">
        <h2 className="text-2xl font-heading font-bold flex items-center gap-2">
          <Wallet /> {it.home.budgets}
        </h2>
        {budgetsThisMonth.length === 0 ? (
          <div className="mt-2">
            <p className="text-ink-500">{it.home.noBudgets}</p>
            <Link
              to="/budget"
              className="inline-block mt-3 text-terra-700 font-semibold hover:underline"
            >
              {it.home.setBudget} →
            </Link>
          </div>
        ) : (
          <ul className="mt-3 space-y-3">
            {budgetsThisMonth.map((b) => {
              const cat = byId(b.categoryId)
              const spent =
                summary?.byCategory.find((c) => c.categoryId === b.categoryId)?.totalCents ?? 0
              const pct = b.amountCents > 0 ? Math.min(1, spent / b.amountCents) : 0
              const over = spent > b.amountCents
              return (
                <li key={b.id}>
                  <div className="flex items-center gap-3">
                    <CategoryBadge category={cat} withLabel={false} size={32} />
                    <span className="flex-1 font-semibold">{cat?.name}</span>
                    <span className={over ? 'text-danger-600 font-bold' : 'font-bold'}>
                      {formatEuro(spent)} / {formatEuro(b.amountCents)}
                    </span>
                  </div>
                  <div className="h-3 bg-cream-300 rounded-full mt-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${over ? 'bg-danger-600' : 'bg-olive-500'}`}
                      style={{ width: `${Math.round(pct * 100)}%` }}
                    />
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      <div className="card">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-heading font-bold flex items-center gap-2">
            <CalendarClock className="text-terra-700" /> {it.scheduled.upcoming}
          </h2>
          <Link
            to="/scadenziario"
            className="text-terra-700 font-semibold inline-flex items-center gap-1 hover:underline"
          >
            {it.home.viewAll} <ArrowRight size={18} />
          </Link>
        </div>
        {upcomingScheduled.length === 0 ? (
          <p className="text-ink-500 mt-3">{it.scheduled.empty}</p>
        ) : (
          <ul className="mt-3 divide-y divide-cream-300">
            {upcomingScheduled.map((s) => {
              const cat = byId(s.categoryId)
              const overdue = isOverdue(s.dueDate, today, s.paidOn)
              return (
                <li key={s.id} className="py-3 flex items-center gap-3">
                  <CategoryBadge category={cat} withLabel={false} size={40} />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{s.name}</p>
                    <p className={`text-sm ${overdue ? 'text-danger-600 font-semibold' : 'text-ink-500'}`}>
                      {upcomingLabel(s.dueDate, today)} · {shortDate(s.dueDate)}
                    </p>
                  </div>
                  <p className="font-bold text-lg whitespace-nowrap">{formatEuro(s.amountCents)}</p>
                  <button
                    type="button"
                    aria-label={it.scheduled.markPaid}
                    onClick={() => markScheduledPaid(s.id, today)}
                    className="h-11 w-11 rounded-full bg-olive-500 hover:bg-olive-600 text-cream-50 flex items-center justify-center transition"
                  >
                    <Check size={22} />
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Link to="/lista-spesa" className="card flex items-center gap-3 hover:bg-cream-200 transition">
          <ShoppingBasket className="text-terra-700" size={32} />
          <span className="font-heading font-bold text-lg">Lista spesa</span>
        </Link>
        <Link to="/ricorrenti" className="card flex items-center gap-3 hover:bg-cream-200 transition">
          <Repeat className="text-olive-600" size={32} />
          <span className="font-heading font-bold text-lg">Ricorrenti</span>
        </Link>
      </div>
    </div>
  )
}
