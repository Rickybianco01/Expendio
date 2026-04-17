import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { BottomNav } from './components/BottomNav'
import { useBootstrap } from './stores/bootstrap'
import { useSettingsStore } from './stores/settingsStore'
import { Home } from './screens/Home'
import { AddExpense } from './screens/AddExpense'
import { ExpenseList } from './screens/ExpenseList'
import { ExpenseDetail } from './screens/ExpenseDetail'
import { MonthlyRecap } from './screens/MonthlyRecap'
import { Categories } from './screens/Categories'
import { Budgets } from './screens/Budgets'
import { Recurring } from './screens/Recurring'
import { Scheduled } from './screens/Scheduled'
import { Shopping } from './screens/Shopping'
import { SettingsScreen } from './screens/Settings'
import { BackupScreen } from './screens/Backup'
import { Welcome } from './screens/Welcome'
import { Biscotto } from './mascot/Biscotto'
import { UpdateBanner } from './components/UpdateBanner'
import { TourOverlay } from './components/TourOverlay'

export default function App() {
  const { ready, error, load } = useBootstrap()
  const settings = useSettingsStore((s) => s.settings)

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    if (!settings) return
    document.documentElement.classList.toggle('lg-text', settings.largeText)
  }, [settings])

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="card max-w-md text-center">
          <Biscotto mood="thinking" size={120} />
          <h2 className="text-xl font-heading font-bold mt-2">Ops, qualcosa non va</h2>
          <p className="text-ink-500 mt-2">{error}</p>
        </div>
      </div>
    )
  }

  if (!ready || !settings) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Biscotto mood="happy" size={120} />
      </div>
    )
  }

  if (!settings.firstLaunchDone) {
    return <Welcome />
  }

  return (
    <div className="min-h-screen pb-24">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/aggiungi" element={<AddExpense />} />
        <Route path="/aggiungi/:id" element={<AddExpense />} />
        <Route path="/spese" element={<ExpenseList />} />
        <Route path="/spese/:id" element={<ExpenseDetail />} />
        <Route path="/riepilogo" element={<MonthlyRecap />} />
        <Route path="/categorie" element={<Categories />} />
        <Route path="/budget" element={<Budgets />} />
        <Route path="/ricorrenti" element={<Recurring />} />
        <Route path="/scadenziario" element={<Scheduled />} />
        <Route path="/lista-spesa" element={<Shopping />} />
        <Route path="/impostazioni" element={<SettingsScreen />} />
        <Route path="/backup" element={<BackupScreen />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <BottomNav />
      <TourOverlay />
      <UpdateBanner />
    </div>
  )
}
