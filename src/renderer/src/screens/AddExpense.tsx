import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Check } from 'lucide-react'
import { TopBar } from '../components/TopBar'
import { Button } from '../components/Button'
import { CategoryBadge } from '../components/CategoryBadge'
import { Biscotto } from '../mascot/Biscotto'
import { useCategoryStore } from '../stores/categoryStore'
import { useExpenseStore } from '../stores/expenseStore'
import { parseAmountToCents, centsToInputString } from '../lib/format'
import { todayIso, yesterdayIso, longDate } from '../lib/dates'
import { it } from '@shared/i18n'

type DateChoice = 'today' | 'yesterday' | 'other'

export function AddExpense() {
  const { id } = useParams<{ id?: string }>()
  const editing = Boolean(id)
  const nav = useNavigate()
  const active = useCategoryStore((s) => s.active)()
  const { create, update, get } = useExpenseStore()

  const [amountStr, setAmountStr] = useState('')
  const [categoryId, setCategoryId] = useState<string | null>(null)
  const [dateChoice, setDateChoice] = useState<DateChoice>('today')
  const [customDate, setCustomDate] = useState(todayIso())
  const [note, setNote] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!id) return
    get(id).then((exp) => {
      if (!exp) return
      setAmountStr(centsToInputString(exp.amountCents))
      setCategoryId(exp.categoryId)
      const today = todayIso()
      const yest = yesterdayIso()
      if (exp.occurredOn === today) setDateChoice('today')
      else if (exp.occurredOn === yest) setDateChoice('yesterday')
      else {
        setDateChoice('other')
        setCustomDate(exp.occurredOn)
      }
      setNote(exp.note ?? '')
    })
  }, [id, get])

  async function handleSave() {
    const cents = parseAmountToCents(amountStr)
    if (cents === null || cents <= 0) {
      setError(it.add.amountError)
      return
    }
    if (!categoryId) {
      setError(it.add.categoryError)
      return
    }
    setError(null)
    setSubmitting(true)
    const occurredOn =
      dateChoice === 'today'
        ? todayIso()
        : dateChoice === 'yesterday'
          ? yesterdayIso()
          : customDate
    try {
      if (editing && id) {
        await update(id, {
          amountCents: cents,
          categoryId,
          occurredOn,
          note: note.trim() || null
        })
      } else {
        await create({
          amountCents: cents,
          categoryId,
          occurredOn,
          note: note.trim() || null
        })
      }
      setSuccess(true)
      setTimeout(() => nav(-1), 900)
    } catch (err) {
      setError(err instanceof Error ? err.message : it.common.error)
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6">
        <Biscotto mood="cheer" size={160} />
        <p className="text-3xl font-heading font-bold mt-4">{it.add.saved}</p>
        <Check className="text-olive-600 mt-3" size={48} />
      </div>
    )
  }

  return (
    <>
      <TopBar title={editing ? it.common.edit : it.add.title} back help={editing ? undefined : '/aggiungi'} />
      <div className="max-w-2xl mx-auto px-4 py-4 space-y-5">
        <div className="card" data-tip-target="add-amount">
          <label className="label" htmlFor="amt">
            {it.add.amountLabel}
          </label>
          <input
            id="amt"
            className="input text-4xl font-bold text-center py-6"
            inputMode="decimal"
            placeholder={it.add.amountPlaceholder}
            value={amountStr}
            onChange={(e) => setAmountStr(e.target.value)}
            autoFocus
          />
        </div>

        <div className="card" data-tip-target="add-category">
          <p className="label">{it.add.categoryLabel}</p>
          <div className="grid grid-cols-3 gap-3 mt-2">
            {active.map((cat) => {
              const selected = cat.id === categoryId
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategoryId(cat.id)}
                  className={`flex flex-col items-center gap-2 rounded-2xl p-3 border-2 transition ${
                    selected
                      ? 'border-terra-500 bg-cream-200 shadow-card'
                      : 'border-transparent hover:bg-cream-200'
                  }`}
                >
                  <CategoryBadge category={cat} withLabel={false} size={50} />
                  <span className="font-semibold text-sm text-center">{cat.name}</span>
                </button>
              )
            })}
          </div>
        </div>

        <div className="card" data-tip-target="add-date">
          <p className="label">{it.add.dateLabel}</p>
          <div className="grid grid-cols-3 gap-2 mt-2">
            {([
              { key: 'today', label: it.add.dateToday },
              { key: 'yesterday', label: it.add.dateYesterday },
              { key: 'other', label: it.add.dateOther }
            ] as const).map((opt) => (
              <button
                key={opt.key}
                type="button"
                onClick={() => setDateChoice(opt.key)}
                className={`chip ${dateChoice === opt.key ? 'chip-active' : ''}`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          {dateChoice === 'other' && (
            <input
              type="date"
              className="input mt-3"
              value={customDate}
              max={todayIso()}
              onChange={(e) => setCustomDate(e.target.value)}
            />
          )}
          {dateChoice !== 'other' && (
            <p className="text-ink-500 mt-2 capitalize">
              {longDate(dateChoice === 'today' ? todayIso() : yesterdayIso())}
            </p>
          )}
        </div>

        <div className="card">
          <label className="label" htmlFor="note">
            {it.add.noteLabel}
          </label>
          <textarea
            id="note"
            className="input min-h-[80px]"
            placeholder={it.add.notePlaceholder}
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>

        {error && <p className="text-danger-600 font-semibold text-center">{error}</p>}

        <Button onClick={handleSave} size="xl" block disabled={submitting}>
          {submitting ? it.common.loading : it.add.save}
        </Button>
      </div>
    </>
  )
}
