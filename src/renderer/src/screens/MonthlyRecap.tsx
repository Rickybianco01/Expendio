import { useEffect, useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Printer } from 'lucide-react'
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
  CartesianGrid
} from 'recharts'
import { TopBar } from '../components/TopBar'
import { Button } from '../components/Button'
import { Biscotto } from '../mascot/Biscotto'
import { CategoryBadge } from '../components/CategoryBadge'
import { useExpenseStore } from '../stores/expenseStore'
import { useCategoryStore } from '../stores/categoryStore'
import {
  currentMonth,
  monthLabel,
  previousMonth,
  nextMonth,
  daysInMonth
} from '../lib/dates'
import { formatEuro } from '../lib/format'
import { ipc } from '../lib/ipc'
import { it } from '@shared/i18n'

export function MonthlyRecap() {
  const [month, setMonth] = useState<string>(currentMonth())
  const [exporting, setExporting] = useState(false)
  const [exportMsg, setExportMsg] = useState<string | null>(null)
  const { expenses, summary, loadMonth } = useExpenseStore()
  const byId = useCategoryStore((s) => s.byId)

  useEffect(() => {
    loadMonth(month)
  }, [month, loadMonth])

  const byCategoryData = useMemo(() => {
    if (!summary) return []
    return summary.byCategory
      .map((c) => {
        const cat = byId(c.categoryId)
        return {
          id: c.categoryId,
          name: cat?.name ?? 'Senza categoria',
          color: cat?.color ?? '#8B7D76',
          value: c.totalCents,
          count: c.count
        }
      })
      .sort((a, b) => b.value - a.value)
  }, [summary, byId])

  const dailyData = useMemo(() => {
    const dCount = daysInMonth(month)
    const arr = Array.from({ length: dCount }, (_, i) => ({
      day: i + 1,
      total: 0
    }))
    expenses.forEach((e) => {
      const day = Number(e.occurredOn.slice(8, 10))
      if (day >= 1 && day <= dCount) {
        arr[day - 1].total += e.amountCents
      }
    })
    return arr.map((d) => ({ ...d, totalEuro: d.total / 100 }))
  }, [expenses, month])

  async function exportPdf() {
    setExporting(true)
    setExportMsg(null)
    try {
      const fileName = `Expendio-Riepilogo-${month}.pdf`
      const saved = await ipc.app.savePdf(fileName)
      setExportMsg(saved ? `Salvato: ${saved}` : null)
    } catch (err) {
      setExportMsg(err instanceof Error ? err.message : it.common.error)
    } finally {
      setExporting(false)
    }
  }

  const totalCents = summary?.totalCents ?? 0

  return (
    <>
      <TopBar
        title={it.recap.title}
        help="/riepilogo"
        right={
          <Button variant="secondary" size="md" onClick={exportPdf} disabled={exporting}>
            <Printer size={18} /> {it.recap.export}
          </Button>
        }
      />
      <div className="max-w-4xl mx-auto px-4 py-4 space-y-4 print:px-0" data-tip-target="recap-root">
        <div className="card flex items-center gap-3">
          <button
            onClick={() => setMonth(previousMonth(month))}
            className="p-2 rounded-lg hover:bg-cream-200 print:hidden"
            aria-label="Mese precedente"
          >
            <ChevronLeft size={24} />
          </button>
          <p className="flex-1 text-center text-xl font-heading font-bold capitalize">
            {monthLabel(month)}
          </p>
          <button
            onClick={() => setMonth(nextMonth(month))}
            className="p-2 rounded-lg hover:bg-cream-200 print:hidden"
            aria-label="Mese successivo"
          >
            <ChevronRight size={24} />
          </button>
        </div>

        {exportMsg && (
          <div className="card bg-olive-500/10 border border-olive-500">
            <p className="text-olive-600 font-semibold">{exportMsg}</p>
          </div>
        )}

        {totalCents === 0 ? (
          <div className="card text-center py-8">
            <Biscotto mood="thinking" size={120} />
            <p className="text-xl text-ink-500 mt-3">{it.recap.noData}</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="card text-center">
                <p className="text-ink-500">{it.recap.total}</p>
                <p className="text-3xl font-bold text-terra-700">{formatEuro(totalCents)}</p>
              </div>
              <div className="card text-center">
                <p className="text-ink-500">{it.recap.average}</p>
                <p className="text-3xl font-bold">{formatEuro(summary?.dailyAverageCents ?? 0)}</p>
              </div>
              <div className="card text-center">
                <p className="text-ink-500">{it.recap.count}</p>
                <p className="text-3xl font-bold">{summary?.count ?? 0}</p>
              </div>
            </div>

            <div className="card">
              <h2 className="text-2xl font-heading font-bold">{it.recap.byCategory}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div style={{ width: '100%', height: 260 }}>
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        data={byCategoryData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={50}
                        outerRadius={100}
                        paddingAngle={2}
                      >
                        {byCategoryData.map((entry) => (
                          <Cell key={entry.id} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(v: number) => formatEuro(v)}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <ul className="space-y-2">
                  {byCategoryData.map((entry) => {
                    const cat = byId(entry.id)
                    const pct = totalCents > 0 ? (entry.value / totalCents) * 100 : 0
                    return (
                      <li key={entry.id} className="flex items-center gap-3">
                        <CategoryBadge category={cat} withLabel={false} size={32} />
                        <span className="flex-1 font-semibold">{entry.name}</span>
                        <span className="text-ink-500 text-sm">{pct.toFixed(0)}%</span>
                        <span className="font-bold w-24 text-right">{formatEuro(entry.value)}</span>
                      </li>
                    )
                  })}
                </ul>
              </div>
            </div>

            <div className="card">
              <h2 className="text-2xl font-heading font-bold">{it.recap.byDay}</h2>
              <div style={{ width: '100%', height: 260 }} className="mt-2">
                <ResponsiveContainer>
                  <LineChart data={dailyData}>
                    <CartesianGrid stroke="#E8DCC7" />
                    <XAxis dataKey="day" />
                    <YAxis tickFormatter={(v) => `${v}€`} />
                    <Tooltip formatter={(v: number) => `${v.toFixed(2)} €`} />
                    <Line
                      type="monotone"
                      dataKey="totalEuro"
                      stroke="#C86A3C"
                      strokeWidth={3}
                      dot={{ fill: '#C86A3C', r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="card">
              <h2 className="text-2xl font-heading font-bold">{it.recap.compare}</h2>
              <div style={{ width: '100%', height: 200 }} className="mt-2">
                <ResponsiveContainer>
                  <BarChart
                    data={[
                      {
                        label: 'Mese scorso',
                        value: (summary?.previousMonthTotalCents ?? 0) / 100
                      },
                      { label: 'Questo mese', value: totalCents / 100 }
                    ]}
                  >
                    <CartesianGrid stroke="#E8DCC7" />
                    <XAxis dataKey="label" />
                    <YAxis tickFormatter={(v) => `${v}€`} />
                    <Tooltip formatter={(v: number) => `${v.toFixed(2)} €`} />
                    <Bar dataKey="value" fill="#C86A3C" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  )
}
