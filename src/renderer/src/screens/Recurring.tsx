import { useEffect, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import type { RecurringExpense, RecurringFrequency } from '@shared/types'
import { TopBar } from '../components/TopBar'
import { Button } from '../components/Button'
import { Modal } from '../components/Modal'
import { CategoryBadge } from '../components/CategoryBadge'
import { useRecurringStore } from '../stores/recurringStore'
import { useCategoryStore } from '../stores/categoryStore'
import { formatEuro, parseAmountToCents, centsToInputString } from '../lib/format'
import { todayIso, longDate } from '../lib/dates'
import { it } from '@shared/i18n'

interface FormState {
  id: string | null
  name: string
  categoryId: string
  amountStr: string
  frequency: RecurringFrequency
  nextDue: string
  reminderDaysBefore: number
  active: boolean
}

const freqOptions: Array<{ value: RecurringFrequency; label: string }> = [
  { value: 'monthly', label: it.recurring.freqMonthly },
  { value: 'bimonthly', label: it.recurring.freqBimonthly },
  { value: 'quarterly', label: it.recurring.freqQuarterly },
  { value: 'yearly', label: it.recurring.freqYearly }
]

export function Recurring() {
  const { items, reload, create, update, remove } = useRecurringStore()
  const categories = useCategoryStore((s) => s.active)()
  const byId = useCategoryStore((s) => s.byId)
  const [form, setForm] = useState<FormState | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    reload()
  }, [reload])

  function openNew() {
    const firstCat = categories[0]
    if (!firstCat) return
    setForm({
      id: null,
      name: '',
      categoryId: firstCat.id,
      amountStr: '',
      frequency: 'monthly',
      nextDue: todayIso(),
      reminderDaysBefore: 3,
      active: true
    })
    setError(null)
  }

  function openEdit(r: RecurringExpense) {
    setForm({
      id: r.id,
      name: r.name,
      categoryId: r.categoryId,
      amountStr: r.amountCents !== null ? centsToInputString(r.amountCents) : '',
      frequency: r.frequency,
      nextDue: r.nextDue,
      reminderDaysBefore: r.reminderDaysBefore,
      active: r.active
    })
    setError(null)
  }

  async function save() {
    if (!form) return
    if (!form.name.trim()) {
      setError('Scrivi un nome')
      return
    }
    const amount = form.amountStr.trim()
      ? parseAmountToCents(form.amountStr)
      : null
    if (amount !== null && (amount === null || amount <= 0)) {
      setError(it.add.amountError)
      return
    }
    const payload = {
      name: form.name.trim(),
      categoryId: form.categoryId,
      amountCents: amount,
      frequency: form.frequency,
      nextDue: form.nextDue,
      reminderDaysBefore: form.reminderDaysBefore,
      active: form.active
    }
    if (form.id) {
      await update(form.id, payload)
    } else {
      await create(payload)
    }
    setForm(null)
  }

  return (
    <>
      <TopBar
        title={it.recurring.title}
        back
        help="/ricorrenti"
        right={
          <Button onClick={openNew} size="md">
            <Plus size={18} /> {it.recurring.add}
          </Button>
        }
      />
      <div className="max-w-2xl mx-auto px-4 py-4 space-y-3" data-tip-target="recurring-root">
        {items.length === 0 ? (
          <div className="card text-center">
            <p className="text-ink-500">Nessuna spesa ricorrente.</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {items.map((r) => {
              const cat = byId(r.categoryId)
              const freqLabel =
                freqOptions.find((f) => f.value === r.frequency)?.label ?? r.frequency
              return (
                <li key={r.id} className="card">
                  <div className="flex items-center gap-3">
                    <CategoryBadge category={cat} withLabel={false} size={40} />
                    <div className="flex-1">
                      <p className="font-semibold">{r.name}</p>
                      <p className="text-ink-500 text-sm">
                        {freqLabel} · {longDate(r.nextDue)}
                      </p>
                    </div>
                    {r.amountCents !== null && (
                      <span className="font-bold">{formatEuro(r.amountCents)}</span>
                    )}
                    <button
                      onClick={() => openEdit(r)}
                      className="text-terra-700 font-semibold hover:underline"
                    >
                      {it.common.edit}
                    </button>
                    <button
                      onClick={() => remove(r.id)}
                      className="text-ink-500 hover:text-danger-600 p-2"
                    >
                      <Trash2 size={18} />
                    </button>
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
        title={form?.id ? it.common.edit : it.recurring.add}
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
              <label className="label">{it.recurring.name}</label>
              <input
                className="input"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                autoFocus
              />
            </div>
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
              <label className="label">{it.recurring.amount}</label>
              <input
                className="input"
                inputMode="decimal"
                placeholder="0,00"
                value={form.amountStr}
                onChange={(e) => setForm({ ...form, amountStr: e.target.value })}
              />
            </div>
            <div>
              <label className="label">{it.recurring.frequency}</label>
              <select
                className="input"
                value={form.frequency}
                onChange={(e) =>
                  setForm({ ...form, frequency: e.target.value as RecurringFrequency })
                }
              >
                {freqOptions.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">{it.recurring.nextDue}</label>
              <input
                type="date"
                className="input"
                value={form.nextDue}
                onChange={(e) => setForm({ ...form, nextDue: e.target.value })}
              />
            </div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) => setForm({ ...form, active: e.target.checked })}
                className="w-5 h-5"
              />
              <span>{it.recurring.active}</span>
            </label>
            {error && <p className="text-danger-600 font-semibold">{error}</p>}
          </div>
        )}
      </Modal>
    </>
  )
}
