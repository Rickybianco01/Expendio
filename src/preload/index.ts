import { contextBridge, ipcRenderer } from 'electron'
import type { IpcRendererEvent } from 'electron'

const invoke = <T>(channel: string, ...args: unknown[]): Promise<T> =>
  ipcRenderer.invoke(channel, ...args) as Promise<T>

const api = {
  categories: {
    list: () => invoke('categories:list'),
    create: (input: unknown) => invoke('categories:create', input),
    update: (id: string, patch: unknown) => invoke('categories:update', id, patch),
    archive: (id: string, archived: boolean) => invoke('categories:archive', id, archived)
  },
  expenses: {
    listByMonth: (month: string) => invoke('expenses:listByMonth', month),
    listAll: () => invoke('expenses:listAll'),
    get: (id: string) => invoke('expenses:get', id),
    create: (input: unknown) => invoke('expenses:create', input),
    update: (id: string, patch: unknown) => invoke('expenses:update', id, patch),
    softDelete: (id: string) => invoke('expenses:softDelete', id),
    restore: (id: string) => invoke('expenses:restore', id),
    summary: (month: string) => invoke('expenses:summary', month)
  },
  budgets: {
    list: () => invoke('budgets:list'),
    upsert: (input: unknown) => invoke('budgets:upsert', input),
    remove: (id: string) => invoke('budgets:remove', id)
  },
  recurring: {
    list: () => invoke('recurring:list'),
    create: (input: unknown) => invoke('recurring:create', input),
    update: (id: string, patch: unknown) => invoke('recurring:update', id, patch),
    remove: (id: string) => invoke('recurring:remove', id),
    materialize: (today: string) => invoke('recurring:materialize', today)
  },
  shopping: {
    list: () => invoke('shopping:list'),
    add: (text: string) => invoke('shopping:add', text),
    toggle: (id: string) => invoke('shopping:toggle', id),
    remove: (id: string) => invoke('shopping:remove', id),
    clearDone: () => invoke('shopping:clearDone')
  },
  scheduled: {
    list: () => invoke('scheduled:list'),
    listByRange: (start: string, end: string) => invoke('scheduled:listByRange', start, end),
    get: (id: string) => invoke('scheduled:get', id),
    create: (input: unknown) => invoke('scheduled:create', input),
    update: (id: string, patch: unknown) => invoke('scheduled:update', id, patch),
    markPaid: (id: string, paidOn: string) => invoke('scheduled:markPaid', id, paidOn),
    markUnpaid: (id: string) => invoke('scheduled:markUnpaid', id),
    remove: (id: string, cascadeExpense = true) =>
      invoke('scheduled:remove', id, cascadeExpense),
    restore: (snapshot: unknown) => invoke('scheduled:restore', snapshot),
    summary: (start: string, end: string, today: string) =>
      invoke('scheduled:summary', start, end, today)
  },
  settings: {
    get: () => invoke('settings:get'),
    update: (patch: unknown) => invoke('settings:update', patch)
  },
  backup: {
    pickFolder: () => invoke('backup:pickFolder'),
    exportNow: (folder?: string) => invoke('backup:export', folder),
    importNow: () => invoke('backup:import'),
    autoIfDue: () => invoke('backup:autoIfDue')
  },
  app: {
    version: () => invoke('app:version'),
    openExternal: (url: string) => invoke('app:openExternal', url),
    savePdf: (fileName: string) => invoke('app:savePdf', fileName)
  },
  updater: {
    check: () => invoke('updater:check'),
    download: () => invoke('updater:download'),
    install: () => invoke('updater:install'),
    status: () => invoke('updater:status'),
    onStatus: (listener: (status: unknown) => void) => {
      const wrapped = (_: IpcRendererEvent, status: unknown): void => listener(status)
      ipcRenderer.on('updater:status', wrapped)
      return () => ipcRenderer.removeListener('updater:status', wrapped)
    }
  }
}

contextBridge.exposeInMainWorld('expendio', api)

export type ExpendioApi = typeof api
