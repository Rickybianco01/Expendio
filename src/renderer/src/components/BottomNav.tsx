import { NavLink } from 'react-router-dom'
import { Home, Wallet, CalendarClock, BarChart3, Settings as SettingsIcon } from 'lucide-react'
import { it } from '@shared/i18n'

const items = [
  { to: '/', icon: Home, label: it.nav.home },
  { to: '/spese', icon: Wallet, label: it.nav.expenses },
  { to: '/scadenziario', icon: CalendarClock, label: it.nav.scheduled },
  { to: '/riepilogo', icon: BarChart3, label: it.nav.recap },
  { to: '/impostazioni', icon: SettingsIcon, label: it.nav.settings }
]

export function BottomNav() {
  return (
    <nav
      data-tip-target="bottom-nav"
      className="fixed bottom-0 left-0 right-0 z-40 bg-cream-50/95 backdrop-blur border-t border-cream-300"
    >
      <ul className="max-w-4xl mx-auto grid grid-cols-5">
        {items.map(({ to, icon: Icon, label }) => (
          <li key={to}>
            <NavLink
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                [
                  'flex flex-col items-center gap-1 py-3 text-sm font-semibold transition-colors',
                  isActive ? 'text-terracotta-500' : 'text-ink-500 hover:text-terracotta-400'
                ].join(' ')
              }
            >
              <Icon size={26} />
              <span>{label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
