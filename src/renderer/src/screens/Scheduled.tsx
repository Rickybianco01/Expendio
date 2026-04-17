import { useEffect, useMemo, useState } from 'react'
import { Plus, Trash2, Check, Undo2, ChevronLeft, ChevronRight } from 'lucide-react'
import type { ScheduledExpense, ScheduledRangeSummary, ScheduledSnapshot } from '@shared/types'
import { TopBar } from '../components/TopBar'
import { Button } from '../components/Button'
import { Modal } from '../components/Modal'
import { CategoryBadge } from '../components/CategoryBadge'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { EmptyState } from '../components/EmptyState'
import { UndoToast } from '../components/UndoToast'
import { useScheduledStore } from '../stores/scheduledStore'
import { useCategoryStore } from '../stores/categoryStore'
import { formatEuro, parseAmountToCents, centsToInputString } from '../lib/format'
import {
  todayIso,
  longDate,
  shortDate,
  currentMonth,
  monthLabel,
  nextMonth,
  previousMonth,
  monthStartIso,
  monthEndIso,
  monthMatrix,
  groupByWeek,
  weekLabel,
  daysUntil,
  isOverdue,
  addDaysIso,
  weekStartIso,
  weekEndIso
} from '../lib/dates'
import { ipc } from '../lib/ipc'
import { it } from '@shared/i18n'

type FilterKey = 'all' | 'unpaid' | 'paid' | 'overdue'
type ViewKey = 'list' | 'month'

interface FormState {
  id: string | null
  name: string
  categoryId: string
  amountStr: string
  dueDate: string
  note: string
}

function dueLabel(due: string, today: string, paidOn: string | null): string {
  if (paidOn) return it.scheduled.paidOn.replace('{date}', shortDate(paidOn))
  const diff = daysUntil(due, today)
  if (diff === 0) return it.scheduled.today
  if (diff === 1) return it.scheduled.tomorrow
  if (diff < 0) {
    const n = Math.abs(diff)
    return n === 1 ? it.scheduled.overdueByOne : it.scheduled.overdueBy.replace('{days}', String(n))
  }
  return it.scheduled.dueIn.replace('{days}', String(diff))
}

export function Scheduled() {
  const { items, reload, create, update, markPaid, markUnpaid, remove, restore } =
    useScheduledStore()
  const categories = useCategoryStore((s) => s.active)()
  const byId = useCategoryStore((s) => s.byId)

  const [today] = useState<string>(todayIso())
  const [viewMonth, setViewMonth] = useState<string>(currentMonth())
  const [view, setView] = useState<ViewKey>('month')
  const [filter, setFilter] = useState<FilterKey>('all')
  const [form, setForm] = useState<FormState | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [summary, setSummary] = useState<ScheduledRangeSummary | null>(null)
  const [selectedDay, setSelectedDay] = useState<string | null>(null)
  const [undo, setUndo] = useState<{ message: string; onUndo: () => Promise<void> } | null>(null)
  const [confirmBatchPay, setConfirmBatchPay] = useState(false)

  useEffect(() => {
    reload()
  }, [reload])

  useEffect(() => {
    const start = monthStartIso(viewMonth)
    const end = monthEndIso(viewMonth)
    ipc.scheduled
      .summary(start, end, today)
      .then((s) => setSummary(s))
      .catch(() => setSummary(null))
  }, [viewMonth, today, items])

  const monthItems = useMemo(() => {
    const start = monthStartIso(viewMonth)
    const end = monthEndIso(viewMonth)
    return items.filter((i) => i.dueDate >= start && i.dueDate <= end)
  }, [items, viewMonth])

  const filtered = useMemo(() => {
    return monthItems.filter((i) => {
      if (filter === 'paid') return i.paidOn !== null
      if (filter === 'unpaid') return i.paidOn === null
      if (filter === 'overdue') return isOverdue(i.dueDate, today, i.paidOn)
      return true
    })
  }, [monthItems, filter, today])

  const byDay = useMemo(() => {
    const map = new Map<string, ScheduledExpense[]>()
    for (const it of monthItems) {
      const bucket = map.get(it.dueDate)
      if (bucket) bucket.push(it)
      else map.set(it.dueDate, [it])
    }
    return map
  }, [monthItems])

  const grid = useMemo(() => monthMatrix(viewMonth, today), [viewMonth, today])

  const weekGroups = useMemo(() => groupByWeek(filtered), [filtered])

  const weekUnpaid = useMemo(() => {
    const start = weekStartIso(today)
    const end = weekEndIso(today)
    return items.filter((i) => !i.paidOn && i.dueDate >= start && i.dueDate <= end)
  }, [items, today])

  async function executeBatchPay() {
    const ids = weekUnpaid.map((x) => x.id)
    setConfirmBatchPay(false)
    if (ids.length === 0) return
    try {
      await Promise.all(ids.map((id) => markPaid(id, today)))
      setUndo({
        message: it.scheduled.batchPayWeekDone.replace('{count}', String(ids.length)),
        onUndo: async () => {
          try {
            await Promise.all(ids.map((id) => markUnpaid(id)))
          } finally {
            setUndo(null)
          }
        }
      })
    } catch {
      /* noop */
    }
  }

  function openNew(dueOverride?: string) {
    const firstCat = categories[0]
    if (!firstCat) return
    setForm({
      id: null,
      name: '',
      categoryId: firstCat.id,
      amountStr: '',
      dueDate: dueOverride ?? today,
      note: ''
    })
    setError(null)
  }

  function openEdit(s: ScheduledExpense) {
    setForm({
      id: s.id,
      name: s.name,
      categoryId: s.categoryId,
      amountStr: centsToInputString(s.amountCents),
      dueDate: s.dueDate,
      note: s.note ?? ''
    })
    setError(null)
  }

  async function save() {
    if (!form) return
    if (!form.name.trim()) {
      setError(it.scheduled.nameError)
      return
    }
    if (!form.categoryId) {
      setError(it.scheduled.categoryError)
      return
    }
    const amount = parseAmountToCents(form.amountStr)
    if (amount === null || amount <= 0) {
      setError(it.scheduled.amountError)
      return
    }
    if (!form.dueDate) {
      setError(it.scheduled.dateError)
      return
    }
    const payload = {
      name: form.name.trim(),
      categoryId: form.categoryId,
      amountCents: amount,
      dueDate: form.dueDate,
      note: form.note.trim() ? form.note.trim() : null
    }
    try {
      if (form.id) {
        await update(form.id, payload)
      } else {
        await create(payload)
      }
      setForm(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : it.common.error)
    }
  }

  async function togglePaid(s: ScheduledExpense) {
    try {
      if (s.paidOn) {
        await markUnpaid(s.id)
        setUndo({
          message: it.scheduled.unpaidUndo,
          onUndo: async () => {
            try {
              await markPaid(s.id, s.paidOn ?? today)
            } finally {
              setUndo(null)
            }
          }
        })
      } else {
        await markPaid(s.id, today)
        setUndo({
          message: it.scheduled.paidUndo,
          onUndo: async () => {
            try {
              await markUnpaid(s.id)
            } finally {
              setUndo(null)
            }
          }
        })
      }
    } catch {
      /* noop */
    }
  }

  async function confirmRemove() {
    if (!confirmId) return
    try {
      const snapshot: ScheduledSnapshot = await remove(confirmId, true)
      setUndo({
        message: it.scheduled.deletedUndo,
        onUndo: async () => {
          try {
            await restore(snapshot)
          } finally {
            setUndo(null)
          }
        }
      })
    } finally {
      setConfirmId(null)
    }
  }

  const daySelectedItems = selectedDay ? byDay.get(selectedDay) ?? [] : []

  return (
    <>
      <TopBar
        title={it.scheduled.title}
        back
        subtitle={it.scheduled.subtitle}
        help="/scadenziario"
        right={
          <span data-tip-target="scheduled-add">
            <Button onClick={() => openNew()} size="md">
              <Plus size={18} /> {it.scheduled.add}
            </Button>
          </span>
        }
      />
      <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
        <div className="card">
          <div className="flex items-center justify-between gap-2">
            <button
              onClick={() => setViewMonth(previousMonth(viewMonth))}
              className="p-2 rounded-lg hover:bg-cream-200"
              aria-label={it.scheduled.prevMonth}
            >
              <ChevronLeft size={20} />
            </button>
            <p className="text-xl font-heading font-bold capitalize">{monthLabel(viewMonth)}</p>
            <button
              onClick={() => setViewMonth(nextMonth(viewMonth))}
              className="p-2 rounded-lg hover:bg-cream-200"
              aria-label={it.scheduled.nextMonth}
            >
              <ChevronRight size={20} />
            </button>
          </div>

          {summary && (
            <div className="grid grid-cols-2 gap-3 mt-3">
              <SummaryTile label={it.scheduled.summaryTotal} cents={summary.totalCents} tone="ink" />
              <SummaryTile label={it.scheduled.summaryPaid} cents={summary.paidCents} tone="olive" />
              <SummaryTile
                label={it.scheduled.summaryUnpaid}
                cents={summary.unpaidCents}
                tone="terra"
              />
              <SummaryTile
                label={it.scheduled.summaryOverdue}
                cents={summary.overdueCents}
                tone="danger"
              />
            </div>
          )}

          <div className="mt-3 flex gap-2" data-tip-target="scheduled-view">
            <ToggleBtn active={view === 'list'} onClick={() => setView('list')}>
              {it.scheduled.viewList}
            </ToggleBtn>
            <ToggleBtn active={view === 'month'} onClick={() => setView('month')}>
              {it.scheduled.viewMonth}
            </ToggleBtn>
          </div>

          <div className="mt-3">
            {weekUnpaid.length > 0 ? (
              <Button
                variant="secondary"
                block
                onClick={() => setConfirmBatchPay(true)}
              >
                <Check size={18} /> {it.scheduled.batchPayWeek} ({weekUnpaid.length})
              </Button>
            ) : (
              <p className="text-ink-500 text-sm text-center">
                {it.scheduled.noUnpaidThisWeek}
              </p>
            )}
          </div>
        </div>

        {view === 'list' && (
          <>
            <div className="flex gap-2 overflow-x-auto">
              <FilterChip active={filter === 'all'} onClick={() => setFilter('all')}>
                {it.scheduled.filterAll}
              </FilterChip>
              <FilterChip active={filter === 'unpaid'} onClick={() => setFilter('unpaid')}>
                {it.scheduled.filterUnpaid}
              </FilterChip>
              <FilterChip active={filter === 'overdue'} onClick={() => setFilter('overdue')}>
                {it.scheduled.filterOverdue}
              </FilterChip>
              <FilterChip active={filter === 'paid'} onClick={() => setFilter('paid')}>
                {it.scheduled.filterPaid}
              </FilterChip>
            </div>

            {filtered.length === 0 ? (
              <EmptyState
                title={it.scheduled.empty}
                body=""
                action={
                  <Button onClick={() => openNew()}>
                    <Plus size={18} /> {it.scheduled.emptyCta}
                  </Button>
                }
              />
            ) : (
              <div className="space-y-4">
                {weekGroups.map((g) => (
                  <div key={g.weekStart} className="space-y-2">
                    <h3 className="text-ink-500 font-semibold px-1 capitalize">
                      {weekLabel(g.weekStart, g.weekEnd)}
                    </h3>
                    <ul className="space-y-2">
                      {g.items.map((s) => (
                        <ScheduledRow
                          key={s.id}
                          item={s}
                          today={today}
                          catName={byId(s.categoryId)?.name ?? ''}
                          category={byId(s.categoryId)}
                          onToggle={() => togglePaid(s)}
                          onEdit={() => openEdit(s)}
                          onDelete={() => setConfirmId(s.id)}
                        />
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {view === 'month' && (
          <div className="card">
            <div className="grid grid-cols-7 gap-1 text-center text-ink-500 font-semibold text-xs sm:text-sm mb-1">
              {['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'].map((d) => (
                <div key={d}>{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {grid.map((cell) => {
                const dayItems = byDay.get(cell.iso) ?? []
                const selected = selectedDay === cell.iso
                const preview = dayItems.slice(0, 2)
                const extra = dayItems.length - preview.length
                return (
                  <button
                    key={cell.iso}
                    onClick={() => setSelectedDay(selected ? null : cell.iso)}
                    className={[
                      'min-h-[70px] sm:min-h-[92px] flex flex-col items-stretch justify-start p-1 rounded-lg text-xs border transition text-left',
                      cell.inMonth ? 'bg-cream-50' : 'bg-cream-100 text-ink-500/60',
                      cell.isToday ? 'border-terracotta-500 border-2' : 'border-cream-300',
                      selected ? 'ring-2 ring-terracotta-500' : ''
                    ].join(' ')}
                  >
                    <span
                      className={[
                        'text-center text-[11px] sm:text-sm',
                        cell.isToday ? 'font-bold text-terra-700' : ''
                      ].join(' ')}
                    >
                      {Number(cell.iso.slice(8, 10))}
                    </span>
                    {dayItems.length > 0 && (
                      <div className="mt-1 flex flex-col gap-0.5">
                        {preview.map((x) => {
                          const paid = x.paidOn !== null
                          const late = !paid && isOverdue(x.dueDate, today, x.paidOn)
                          const tone = paid
                            ? 'bg-olive-100 text-olive-600 line-through'
                            : late
                              ? 'bg-danger-50 text-danger-600'
                              : 'bg-cream-200 text-terra-700'
                          return (
                            <span
                              key={x.id}
                              className={`truncate rounded px-1 py-0.5 text-[10px] sm:text-xs font-semibold ${tone}`}
                              title={`${x.name} · ${formatEuro(x.amountCents)}`}
                            >
                              {x.name}
                            </span>
                          )
                        })}
                        {extra > 0 && (
                          <span className="text-[10px] sm:text-xs text-ink-500 font-semibold px-1">
                            +{extra}
                          </span>
                        )}
                      </div>
                    )}
                  </button>
                )
              })}
            </div>

            {selectedDay && (
              <div className="mt-4 border-t border-cream-300 pt-3 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="font-heading font-bold capitalize">{longDate(selectedDay)}</p>
                  <button
                    onClick={() => openNew(selectedDay)}
                    className="text-terra-700 font-semibold inline-flex items-center gap-1 hover:underline"
                  >
                    <Plus size={16} /> {it.scheduled.add}
                  </button>
                </div>
                {daySelectedItems.length === 0 ? (
                  <p className="text-ink-500">{it.scheduled.empty}</p>
                ) : (
                  <ul className="space-y-2">
                    {daySelectedItems.map((s) => (
                      <ScheduledRow
                        key={s.id}
                        item={s}
                        today={today}
                        catName={byId(s.categoryId)?.name ?? ''}
                        category={byId(s.categoryId)}
                        onToggle={() => togglePaid(s)}
                        onEdit={() => openEdit(s)}
                        onDelete={() => setConfirmId(s.id)}
                      />
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <Modal
        open={form !== null}
        onClose={() => setForm(null)}
        title={form?.id ? it.scheduled.edit : it.scheduled.add}
        size="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => setForm(null)}>
              {it.common.cancel}
            </Button>
            <Button onClick={save}>{it.common.save}</Button>
          </>
        }
      >
        {form && (
          <div className="space-y-4">
            <div>
              <label className="label">{it.scheduled.name}</label>
              <input
                className="input"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                autoFocus
              />
            </div>
            <div>
              <label className="label">{it.scheduled.category}</label>
              <select
                className="input"
                value={form.categoryId}
                onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">{it.scheduled.amount}</label>
              <input
                className="input"
                inputMode="decimal"
                placeholder="0,00"
                value={form.amountStr}
                onChange={(e) => setForm({ ...form, amountStr: e.target.value })}
              />
            </div>
            <div>
              <label className="label">{it.scheduled.quickDateLabel}</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {[
                  { key: 'today', label: it.scheduled.quickToday, iso: today },
                  { key: 'tomorrow', label: it.scheduled.quickTomorrow, iso: addDaysIso(today, 1) },
                  { key: 'week', label: it.scheduled.quickWeek, iso: addDaysIso(today, 7) },
                  {
                    key: 'endMonth',
                    label: it.scheduled.quickEndMonth,
                    iso: monthEndIso(today.slice(0, 7))
                  }
                ].map((p) => {
                  const active = form.dueDate === p.iso
                  return (
                    <button
                      key={p.key}
                      type="button"
                      onClick={() => setForm({ ...form, dueDate: p.iso })}
                      className={[
                        'px-3 py-1.5 rounded-full font-semibold text-sm transition',
                        active
                          ? 'bg-terracotta-500 text-cream-50'
                          : 'bg-cream-100 text-ink-700 hover:bg-cream-200'
                      ].join(' ')}
                    >
                      {p.label}
                    </button>
                  )
                })}
              </div>
              <input
                type="date"
                className="input"
                value={form.dueDate}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                aria-label={it.scheduled.quickOther}
              />
            </div>
            <div>
              <label className="label">{it.scheduled.note}</label>
              <input
                className="input"
                value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
              />
            </div>
            {error && <p className="text-danger-600 font-semibold">{error}</p>}
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={confirmId !== null}
        title={it.scheduled.confirmDelete}
        body={it.scheduled.confirmDeleteBody}
        confirmLabel={it.common.confirm}
        cancelLabel={it.common.cancel}
        danger
        onConfirm={confirmRemove}
        onCancel={() => setConfirmId(null)}
      />

      <ConfirmDialog
        open={confirmBatchPay}
        title={it.scheduled.batchPayWeek}
        body={it.scheduled.batchPayWeekConfirm}
        confirmLabel={it.common.confirm}
        cancelLabel={it.common.cancel}
        onConfirm={executeBatchPay}
        onCancel={() => setConfirmBatchPay(false)}
      />

      {undo && (
        <UndoToast
          message={undo.message}
          onUndo={undo.onUndo}
          onDismiss={() => setUndo(null)}
        />
      )}
    </>
  )
}

function SummaryTile({
  label,
  cents,
  tone
}: {
  label: string
  cents: number
  tone: 'ink' | 'olive' | 'terra' | 'danger'
}) {
  const color =
    tone === 'olive'
      ? 'text-olive-600'
      : tone === 'terra'
        ? 'text-terra-700'
        : tone === 'danger'
          ? 'text-danger-600'
          : 'text-ink-700'
  return (
    <div className="rounded-xl bg-cream-100 px-3 py-2">
      <p className="text-ink-500 text-sm">{label}</p>
      <p className={`font-bold text-lg ${color}`}>{formatEuro(cents)}</p>
    </div>
  )
}

function ToggleBtn({
  active,
  onClick,
  children
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={[
        'flex-1 py-2 rounded-lg font-semibold transition',
        active
          ? 'bg-terracotta-500 text-cream-50'
          : 'bg-cream-100 text-ink-700 hover:bg-cream-200'
      ].join(' ')}
    >
      {children}
    </button>
  )
}

function FilterChip({
  active,
  onClick,
  children
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={[
        'px-3 py-1.5 rounded-full font-semibold text-sm whitespace-nowrap transition',
        active
          ? 'bg-terracotta-500 text-cream-50'
          : 'bg-cream-100 text-ink-700 hover:bg-cream-200'
      ].join(' ')}
    >
      {children}
    </button>
  )
}

function ScheduledRow({
  item,
  today,
  catName,
  category,
  onToggle,
  onEdit,
  onDelete
}: {
  item: ScheduledExpense
  today: string
  catName: string
  category: ReturnType<ReturnType<typeof useCategoryStore.getState>['byId']>
  onToggle: () => void
  onEdit: () => void
  onDelete: () => void
}) {
  const paid = item.paidOn !== null
  const overdue = !paid && isOverdue(item.dueDate, today, item.paidOn)
  const stateLabel = dueLabel(item.dueDate, today, item.paidOn)
  return (
    <li
      className={[
        'card flex items-center gap-3',
        paid ? 'opacity-80' : '',
        overdue ? 'border-danger-600' : ''
      ].join(' ')}
    >
      <CategoryBadge category={category} withLabel={false} size={40} />
      <div className="flex-1 min-w-0">
        <p className={`font-semibold truncate ${paid ? 'line-through text-ink-500' : ''}`}>
          {item.name}
        </p>
        <p className="text-ink-500 text-sm truncate">
          {catName}
          {item.sourceRecurringId ? ` · ${it.scheduled.fromRecurring}` : ''}
        </p>
        <p
          className={[
            'text-sm font-semibold',
            overdue ? 'text-danger-600' : paid ? 'text-olive-600' : 'text-terra-700'
          ].join(' ')}
        >
          {stateLabel} · {longDate(item.dueDate)}
        </p>
      </div>
      <span className="font-bold whitespace-nowrap">{formatEuro(item.amountCents)}</span>
      <button
        onClick={onToggle}
        data-tip-target="scheduled-pay"
        className={[
          'p-2 rounded-lg transition',
          paid
            ? 'text-ink-500 hover:text-terra-700 hover:bg-cream-200'
            : 'text-olive-600 hover:bg-olive-100'
        ].join(' ')}
        aria-label={paid ? it.scheduled.markUnpaid : it.scheduled.markPaid}
        title={paid ? it.scheduled.markUnpaid : it.scheduled.markPaid}
      >
        {paid ? <Undo2 size={20} /> : <Check size={20} />}
      </button>
      <button
        onClick={onEdit}
        className="text-terra-700 font-semibold hover:underline hidden sm:inline"
      >
        {it.common.edit}
      </button>
      <button
        onClick={onDelete}
        className="text-ink-500 hover:text-danger-600 p-2"
        aria-label={it.common.delete}
      >
        <Trash2 size={18} />
      </button>
    </li>
  )
}
