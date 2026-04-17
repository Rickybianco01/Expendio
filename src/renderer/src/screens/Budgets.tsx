import { useEffect, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import type { Budget } from '@shared/types'
import { TopBar } from '../components/TopBar'
import { Button } from '../components/Button'
import { Modal } from '../components/Modal'
import { CategoryBadge } from '../components/CategoryBadge'
import { useBudgetStore } from '../stores/budgetStore'
import { useCategoryStore } from '../stores/categoryStore'
import { useExpenseStore } from '../stores/expenseStore'
import { currentMonth, monthLabel } from '../lib/dates'
import { formatEuro, parseAmountToCents, centsToInputString } from '../lib/format'
import { it } from '@shared/i18n'

interface FormState {
  id: string | null
  categoryId: string
  amountStr: string
}

export function Budgets() {
  const month = currentMonth()
  const { budgets, reload, upsert, remove } = useBudgetStore()
  const categories = useCategoryStore((s) => s.active)()
  const byId = useCategoryStore((s) => s.byId)
  const summary = useExpenseStore((s) => s.summary)
  const loadMonth = useExpenseStore((s) => s.loadMonth)
  const [form, setForm] = useState<FormState | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    reload()
    loadMonth(month)
  }, [reload, loadMonth, month])

  const active = budgets.filter((b) => b.month === null || b.month === month)

  function openNew() {
    const firstCat = categories[0]
    if (!firstCat) return
    setForm({ id: null, categoryId: firstCat.id, amountStr: '' })
    setError(null)
  }

  function openEdit(b: Budget) {
    setForm({ id: b.id, categoryId: b.categoryId, amountStr: centsToInputString(b.amountCents) })
    setError(null)
  }

  async function save() {
    if (!form) return
    const cents = parseAmountToCents(form.amountStr)
    if (cents === null || cents <= 0) {
      setError(it.add.amountError)
      return
    }
    await upsert({
      id: form.id ?? undefined,
      categoryId: form.categoryId,
      month: null,
      amountCents: cents
    })
    setForm(null)
  }

  return (
    <>
      <TopBar
        title={it.budgets.title}
        back
        subtitle={monthLabel(month)}
        help="/budget"
        right={
          <Button onClick={openNew} size="md">
            <Plus size={18} /> {it.budgets.save}
          </Button>
        }
      />
      <div className="max-w-2xl mx-auto px-4 py-4 space-y-3" data-tip-target="budget-root">
        <p className="text-ink-500 px-2">{it.budgets.description}</p>
        {active.length === 0 ? (
          <div className="card text-center">
            <p className="text-ink-500">Nessun budget.</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {active.map((b) => {
              const cat = byId(b.categoryId)
              const spent =
                summary?.byCategory.find((c) => c.categoryId === b.categoryId)?.totalCents ?? 0
              const pct = b.amountCents > 0 ? Math.min(1, spent / b.amountCents) : 0
              const over = spent > b.amountCents
              const close = !over && pct >= 0.8
              const remaining = Math.max(0, b.amountCents - spent)
              return (
                <li key={b.id} className="card">
                  <div className="flex items-center gap-3">
                    <CategoryBadge category={cat} withLabel={false} size={40} />
                    <span className="flex-1 font-semibold">{cat?.name}</span>
                    <button
                      onClick={() => openEdit(b)}
                      className="px-3 py-1 text-terra-700 font-semibold hover:underline"
                    >
                      {it.common.edit}
                    </button>
                    <button
                      onClick={() => remove(b.id)}
                      className="text-ink-500 hover:text-danger-600 p-2"
                      aria-label={it.budgets.remove}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                  <div className="mt-3">
                    <div className="flex justify-between text-sm">
                      <span>{it.budgets.progress}: {formatEuro(spent)}</span>
                      <span>{formatEuro(b.amountCents)}</span>
                    </div>
                    <div className="h-4 bg-cream-300 rounded-full mt-1 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          over ? 'bg-danger-600' : close ? 'bg-terra-500' : 'bg-olive-500'
                        }`}
                        style={{ width: `${Math.round(pct * 100)}%` }}
                      />
                    </div>
                    <p className="mt-2 text-sm">
                      {over ? (
                        <span className="text-danger-600 font-bold">
                          {it.budgets.over} {formatEuro(spent - b.amountCents)}
                        </span>
                      ) : close ? (
                        <span className="text-terra-700 font-bold">{it.budgets.close}</span>
                      ) : (
                        <span className="text-ink-500">
                          {it.budgets.remaining}: <span className="font-bold text-ink-900">{formatEuro(remaining)}</span>
                        </span>
                      )}
                    </p>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      <Modal
        open={form !== null}
        onClose={() => setForm(null)}
        title={form?.id ? it.common.edit : it.budgets.save}
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
              <label className="label">{it.add.categoryLabel}</label>
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
              <label className="label">{it.budgets.amount}</label>
              <input
                className="input"
                inputMode="decimal"
                placeholder="0,00"
                value={form.amountStr}
                onChange={(e) => setForm({ ...form, amountStr: e.target.value })}
              />
            </div>
            {error && <p className="text-danger-600 font-semibold">{error}</p>}
          </div>
        )}
      </Modal>
    </>
  )
}
