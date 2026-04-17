import { useEffect, useState } from 'react'
import { Plus, Trash2, Check } from 'lucide-react'
import { TopBar } from '../components/TopBar'
import { Button } from '../components/Button'
import { EmptyState } from '../components/EmptyState'
import { useShoppingStore } from '../stores/shoppingStore'
import { it } from '@shared/i18n'

export function Shopping() {
  const { items, reload, add, toggle, remove, clearDone } = useShoppingStore()
  const [text, setText] = useState('')

  useEffect(() => {
    reload()
  }, [reload])

  const pending = items.filter((i) => !i.checked)
  const done = items.filter((i) => i.checked)

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!text.trim()) return
    await add(text.trim())
    setText('')
  }

  return (
    <>
      <TopBar
        title={it.shopping.title}
        back
        help="/lista-spesa"
        right={
          done.length > 0 ? (
            <Button variant="secondary" size="md" onClick={clearDone}>
              {it.shopping.clearDone}
            </Button>
          ) : undefined
        }
      />
      <div className="max-w-2xl mx-auto px-4 py-4 space-y-4" data-tip-target="shopping-root">
        <form onSubmit={handleAdd} className="card flex gap-2 items-center">
          <input
            className="input flex-1"
            placeholder={it.shopping.placeholder}
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <Button type="submit" size="lg" disabled={!text.trim()}>
            <Plus size={20} /> {it.shopping.add}
          </Button>
        </form>

        {items.length === 0 ? (
          <EmptyState title={it.shopping.empty} mood="sleepy" />
        ) : (
          <>
            {pending.length > 0 && (
              <ul className="card divide-y divide-cream-300">
                {pending.map((i) => (
                  <li key={i.id} className="flex items-center gap-3 py-3">
                    <button
                      onClick={() => toggle(i.id)}
                      className="w-7 h-7 rounded-full border-2 border-ink-500 flex items-center justify-center hover:border-olive-500"
                      aria-label="Segna come preso"
                    />
                    <span className="flex-1 text-lg">{i.text}</span>
                    <button
                      onClick={() => remove(i.id)}
                      className="text-ink-500 hover:text-danger-600 p-2"
                      aria-label="Cancella"
                    >
                      <Trash2 size={18} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {done.length > 0 && (
              <ul className="card divide-y divide-cream-300 opacity-70">
                {done.map((i) => (
                  <li key={i.id} className="flex items-center gap-3 py-3">
                    <button
                      onClick={() => toggle(i.id)}
                      className="w-7 h-7 rounded-full border-2 border-olive-500 bg-olive-500 flex items-center justify-center"
                      aria-label="Annulla selezione"
                    >
                      <Check size={16} className="text-white" />
                    </button>
                    <span className="flex-1 text-lg line-through">{i.text}</span>
                    <button
                      onClick={() => remove(i.id)}
                      className="text-ink-500 hover:text-danger-600 p-2"
                    >
                      <Trash2 size={18} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>
    </>
  )
}
