import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  FolderOpen,
  HardDrive,
  Info,
  Palette,
  ChevronRight,
  Heart,
  LayoutGrid,
  Wallet,
  Repeat,
  ShoppingBasket,
  RefreshCw
} from 'lucide-react'
import { TopBar } from '../components/TopBar'
import { Button } from '../components/Button'
import { Biscotto } from '../mascot/Biscotto'
import { useSettingsStore } from '../stores/settingsStore'
import { ipc } from '../lib/ipc'
import { longDate } from '../lib/dates'
import { it } from '@shared/i18n'

export function SettingsScreen() {
  const { settings, update } = useSettingsStore()
  const [version, setVersion] = useState<string | null>(null)
  const [checking, setChecking] = useState(false)
  const [checkResult, setCheckResult] = useState<string | null>(null)

  useEffect(() => {
    ipc.app.version().then(setVersion).catch(() => {})
  }, [])

  if (!settings) return null

  async function pickFolder() {
    const folder = await ipc.backup.pickFolder()
    if (folder) {
      await update({ backupFolder: folder })
    }
  }

  async function checkForUpdates() {
    setChecking(true)
    setCheckResult(null)
    try {
      const newVersion = await ipc.updater.check()
      if (newVersion) {
        setCheckResult(`${it.updater.available}: ${newVersion}`)
      } else {
        setCheckResult(it.updater.upToDate)
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Errore'
      setCheckResult(msg)
    } finally {
      setChecking(false)
    }
  }

  return (
    <>
      <TopBar title={it.settings.title} help="/impostazioni" />
      <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
        <div className="card flex items-center gap-4">
          <Biscotto mood="happy" size={72} />
          <div>
            <p className="text-2xl font-heading font-bold">{it.app.name}</p>
            <p className="text-ink-500">{it.app.tagline}</p>
          </div>
        </div>

        <div className="card space-y-3">
          <h2 className="text-xl font-heading font-bold flex items-center gap-2">
            <LayoutGrid size={20} /> Gestisci
          </h2>
          <ul className="divide-y divide-cream-300">
            <SettingsLink to="/categorie" label={it.categories.title} />
            <SettingsLink to="/budget" label={it.budgets.title} icon={<Wallet size={20} />} />
            <SettingsLink to="/ricorrenti" label={it.recurring.title} icon={<Repeat size={20} />} />
            <SettingsLink to="/lista-spesa" label={it.shopping.title} icon={<ShoppingBasket size={20} />} />
          </ul>
        </div>

        <div className="card space-y-3">
          <h2 className="text-xl font-heading font-bold flex items-center gap-2">
            <Palette size={20} /> {it.settings.appearance}
          </h2>
          <label className="flex items-center justify-between py-2">
            <span className="text-lg">{it.settings.largeText}</span>
            <input
              type="checkbox"
              checked={settings.largeText}
              onChange={(e) => update({ largeText: e.target.checked })}
              className="w-6 h-6"
            />
          </label>
        </div>

        <div className="card space-y-3">
          <h2 className="text-xl font-heading font-bold flex items-center gap-2">
            <HardDrive size={20} /> {it.settings.data}
          </h2>
          <div className="flex items-center justify-between py-2">
            <span className="text-lg">{it.settings.autoBackup}</span>
            <input
              type="checkbox"
              checked={settings.autoBackupWeekly}
              onChange={(e) => update({ autoBackupWeekly: e.target.checked })}
              className="w-6 h-6"
            />
          </div>
          <div className="py-2">
            <p className="label">{it.settings.backupFolder}</p>
            <div className="flex gap-2 items-center">
              <p className="flex-1 text-ink-500 text-sm break-all">
                {settings.backupFolder ?? '—'}
              </p>
              <Button variant="secondary" size="md" onClick={pickFolder}>
                <FolderOpen size={18} /> {it.settings.choose}
              </Button>
            </div>
          </div>
          <p className="text-ink-500 text-sm">
            {it.settings.lastBackup}:{' '}
            {settings.lastBackupAt ? longDate(settings.lastBackupAt.slice(0, 10)) : it.settings.never}
          </p>
          <Link to="/backup" data-tip-target="settings-backup">
            <Button variant="primary" size="lg" block>
              {it.settings.backup}
            </Button>
          </Link>
        </div>

        <div className="card space-y-2">
          <h2 className="text-xl font-heading font-bold flex items-center gap-2">
            <Info size={20} /> {it.settings.about}
          </h2>
          <p className="text-ink-500">
            {it.updater.current}: <span className="text-ink-700 font-semibold">{version ?? '—'}</span>
          </p>
          <Button variant="secondary" size="md" onClick={checkForUpdates} disabled={checking}>
            <RefreshCw size={18} className={checking ? 'animate-spin' : ''} />
            {checking ? it.updater.checking : it.updater.check}
          </Button>
          {checkResult && <p className="text-ink-500 text-sm">{checkResult}</p>}
          <p className="text-ink-500 flex items-center gap-1 pt-2">
            Fatto con <Heart size={16} className="text-danger-600" /> per mamma e il suo Biscotto.
          </p>
        </div>
      </div>
    </>
  )
}

function SettingsLink({
  to,
  label,
  icon
}: {
  to: string
  label: string
  icon?: React.ReactNode
}) {
  return (
    <li>
      <Link
        to={to}
        className="flex items-center gap-3 py-3 hover:bg-cream-200 -mx-2 px-2 rounded-lg transition"
      >
        {icon && <span className="text-ink-500">{icon}</span>}
        <span className="flex-1 font-semibold text-lg">{label}</span>
        <ChevronRight size={20} className="text-ink-500" />
      </Link>
    </li>
  )
}
