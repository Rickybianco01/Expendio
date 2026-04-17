import type { Category, DBSchema } from './types'

export const SCHEMA_VERSION = 1

export const DEFAULT_CATEGORIES: Omit<Category, 'id'>[] = [
  { slug: 'spesa', name: 'Spesa', icon: 'cart', color: '#C86A3C', isDefault: true, sortOrder: 10, archived: false },
  { slug: 'bollette', name: 'Bollette', icon: 'bolt', color: '#DB9468', isDefault: true, sortOrder: 20, archived: false },
  { slug: 'animali', name: 'Animali', icon: 'paw', color: '#6B8E23', isDefault: true, sortOrder: 30, archived: false },
  { slug: 'salute', name: 'Salute', icon: 'heart', color: '#B23A3A', isDefault: true, sortOrder: 40, archived: false },
  { slug: 'trasporti', name: 'Trasporti', icon: 'car', color: '#8F4A28', isDefault: true, sortOrder: 50, archived: false },
  { slug: 'casa', name: 'Casa', icon: 'home', color: '#C86A3C', isDefault: true, sortOrder: 60, archived: false },
  { slug: 'abbigliamento', name: 'Abbigliamento', icon: 'shirt', color: '#E9B895', isDefault: true, sortOrder: 70, archived: false },
  { slug: 'svago', name: 'Svago', icon: 'sparkles', color: '#B3C179', isDefault: true, sortOrder: 80, archived: false },
  { slug: 'ristorante', name: 'Ristorante', icon: 'utensils', color: '#DB9468', isDefault: true, sortOrder: 90, archived: false },
  { slug: 'regali', name: 'Regali', icon: 'gift', color: '#B05730', isDefault: true, sortOrder: 100, archived: false },
  { slug: 'altro', name: 'Altro', icon: 'tag', color: '#8B7D76', isDefault: true, sortOrder: 999, archived: false }
]

export function initialDB(): DBSchema {
  return {
    schemaVersion: SCHEMA_VERSION,
    installedAt: new Date().toISOString(),
    categories: [],
    expenses: [],
    budgets: [],
    recurring: [],
    shopping: [],
    scheduled: [],
    settings: {
      firstLaunchDone: false,
      backupFolder: null,
      lastBackupAt: null,
      autoBackupWeekly: true,
      largeText: false,
      cucciolate: 0,
      tipsState: {
        dismissedIds: [],
        visitedScreens: []
      }
    }
  }
}
