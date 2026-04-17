import { app, BrowserWindow, ipcMain, dialog, shell } from 'electron'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { initUpdater, scheduleUpdateChecks } from './updater'
import {
  initDB,
  listCategories,
  createCategory,
  updateCategory,
  archiveCategory,
  listExpensesByMonth,
  listExpensesAll,
  getExpense,
  createExpense,
  updateExpense,
  softDeleteExpense,
  restoreExpense,
  sweepDeleted,
  monthlySummary,
  listBudgets,
  upsertBudget,
  removeBudget,
  listRecurring,
  createRecurring,
  updateRecurring,
  removeRecurring,
  materializeDueRecurring,
  listShopping,
  addShoppingItem,
  toggleShoppingItem,
  removeShoppingItem,
  clearCheckedShopping,
  listScheduled,
  listScheduledByRange,
  getScheduled,
  createScheduled,
  updateScheduled,
  markScheduledPaid,
  markScheduledUnpaid,
  removeScheduled,
  restoreScheduled,
  scheduledSummary,
  getSettings,
  updateSettings,
  exportBackupFile,
  importBackup
} from './db'

const isDev = !app.isPackaged

function createWindow(): BrowserWindow {
  const win = new BrowserWindow({
    width: 1180,
    height: 820,
    minWidth: 920,
    minHeight: 640,
    title: 'Expendio',
    backgroundColor: '#FFF8F0',
    autoHideMenuBar: true,
    webPreferences: {
      preload: join(__dirname, '../preload/index.mjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  })

  win.on('ready-to-show', () => win.show())

  win.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (isDev && process.env['ELECTRON_RENDERER_URL']) {
    win.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    win.loadFile(join(__dirname, '../renderer/index.html'))
  }

  return win
}

function safeHandler<A extends unknown[], R>(fn: (...args: A) => Promise<R>) {
  return async (_: unknown, ...args: A) => {
    try {
      const value = await fn(...args)
      return { ok: true, value }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Errore sconosciuto'
      return { ok: false, error: message }
    }
  }
}

function registerIpc(): void {
  // categories
  ipcMain.handle('categories:list', safeHandler(() => listCategories()))
  ipcMain.handle(
    'categories:create',
    safeHandler((input: Parameters<typeof createCategory>[0]) => createCategory(input))
  )
  ipcMain.handle(
    'categories:update',
    safeHandler((id: string, patch: Parameters<typeof updateCategory>[1]) => updateCategory(id, patch))
  )
  ipcMain.handle(
    'categories:archive',
    safeHandler((id: string, archived: boolean) => archiveCategory(id, archived))
  )

  // expenses
  ipcMain.handle(
    'expenses:listByMonth',
    safeHandler((month: string) => listExpensesByMonth(month))
  )
  ipcMain.handle('expenses:listAll', safeHandler(() => listExpensesAll()))
  ipcMain.handle('expenses:get', safeHandler((id: string) => getExpense(id)))
  ipcMain.handle(
    'expenses:create',
    safeHandler((input: Parameters<typeof createExpense>[0]) => createExpense(input))
  )
  ipcMain.handle(
    'expenses:update',
    safeHandler((id: string, patch: Parameters<typeof updateExpense>[1]) => updateExpense(id, patch))
  )
  ipcMain.handle('expenses:softDelete', safeHandler((id: string) => softDeleteExpense(id)))
  ipcMain.handle('expenses:restore', safeHandler((id: string) => restoreExpense(id)))
  ipcMain.handle('expenses:summary', safeHandler((month: string) => monthlySummary(month)))

  // budgets
  ipcMain.handle('budgets:list', safeHandler(() => listBudgets()))
  ipcMain.handle(
    'budgets:upsert',
    safeHandler((input: Parameters<typeof upsertBudget>[0]) => upsertBudget(input))
  )
  ipcMain.handle('budgets:remove', safeHandler((id: string) => removeBudget(id)))

  // recurring
  ipcMain.handle('recurring:list', safeHandler(() => listRecurring()))
  ipcMain.handle(
    'recurring:create',
    safeHandler((input: Parameters<typeof createRecurring>[0]) => createRecurring(input))
  )
  ipcMain.handle(
    'recurring:update',
    safeHandler((id: string, patch: Parameters<typeof updateRecurring>[1]) =>
      updateRecurring(id, patch)
    )
  )
  ipcMain.handle('recurring:remove', safeHandler((id: string) => removeRecurring(id)))
  ipcMain.handle(
    'recurring:materialize',
    safeHandler((today: string) => materializeDueRecurring(today))
  )

  // shopping
  ipcMain.handle('shopping:list', safeHandler(() => listShopping()))
  ipcMain.handle('shopping:add', safeHandler((text: string) => addShoppingItem(text)))
  ipcMain.handle('shopping:toggle', safeHandler((id: string) => toggleShoppingItem(id)))
  ipcMain.handle('shopping:remove', safeHandler((id: string) => removeShoppingItem(id)))
  ipcMain.handle('shopping:clearDone', safeHandler(() => clearCheckedShopping()))

  // scheduled
  ipcMain.handle('scheduled:list', safeHandler(() => listScheduled()))
  ipcMain.handle(
    'scheduled:listByRange',
    safeHandler((start: string, end: string) => listScheduledByRange(start, end))
  )
  ipcMain.handle('scheduled:get', safeHandler((id: string) => getScheduled(id)))
  ipcMain.handle(
    'scheduled:create',
    safeHandler((input: Parameters<typeof createScheduled>[0]) => createScheduled(input))
  )
  ipcMain.handle(
    'scheduled:update',
    safeHandler((id: string, patch: Parameters<typeof updateScheduled>[1]) =>
      updateScheduled(id, patch)
    )
  )
  ipcMain.handle(
    'scheduled:markPaid',
    safeHandler((id: string, paidOn: string) => markScheduledPaid(id, paidOn))
  )
  ipcMain.handle('scheduled:markUnpaid', safeHandler((id: string) => markScheduledUnpaid(id)))
  ipcMain.handle(
    'scheduled:remove',
    safeHandler((id: string, cascadeExpense: boolean = true) =>
      removeScheduled(id, cascadeExpense)
    )
  )
  ipcMain.handle(
    'scheduled:restore',
    safeHandler((snapshot: Parameters<typeof restoreScheduled>[0]) =>
      restoreScheduled(snapshot)
    )
  )
  ipcMain.handle(
    'scheduled:summary',
    safeHandler((start: string, end: string, today: string) =>
      scheduledSummary(start, end, today)
    )
  )

  // settings
  ipcMain.handle('settings:get', safeHandler(() => getSettings()))
  ipcMain.handle(
    'settings:update',
    safeHandler((patch: Parameters<typeof updateSettings>[0]) => updateSettings(patch))
  )

  // backup
  ipcMain.handle(
    'backup:pickFolder',
    safeHandler(async () => {
      const res = await dialog.showOpenDialog({
        properties: ['openDirectory', 'createDirectory'],
        title: 'Scegli la cartella di backup'
      })
      if (res.canceled || res.filePaths.length === 0) return null
      return res.filePaths[0]
    })
  )
  ipcMain.handle(
    'backup:export',
    safeHandler(async (folder?: string) => {
      let targetFolder = folder
      if (!targetFolder) {
        const res = await dialog.showOpenDialog({
          properties: ['openDirectory', 'createDirectory'],
          title: 'Dove vuoi salvare il backup?'
        })
        if (res.canceled || res.filePaths.length === 0) return null
        targetFolder = res.filePaths[0]
      }
      if (!existsSync(targetFolder)) mkdirSync(targetFolder, { recursive: true })
      const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')
      const filePath = join(targetFolder, `expendio-backup-${stamp}.json`)
      return await exportBackupFile(filePath)
    })
  )
  ipcMain.handle(
    'backup:import',
    safeHandler(async () => {
      const res = await dialog.showOpenDialog({
        properties: ['openFile'],
        title: 'Scegli il file di backup',
        filters: [{ name: 'Backup Expendio', extensions: ['json'] }]
      })
      if (res.canceled || res.filePaths.length === 0) return null
      const content = readFileSync(res.filePaths[0], 'utf-8')
      await importBackup(content)
      return res.filePaths[0]
    })
  )
  ipcMain.handle(
    'backup:autoIfDue',
    safeHandler(async () => {
      const s = await getSettings()
      if (!s.autoBackupWeekly || !s.backupFolder) return { ran: false, reason: 'disabled' }
      const last = s.lastBackupAt ? new Date(s.lastBackupAt).getTime() : 0
      const weekMs = 7 * 24 * 60 * 60 * 1000
      if (Date.now() - last < weekMs) return { ran: false, reason: 'recent' }
      const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')
      const filePath = join(s.backupFolder, `expendio-auto-${stamp}.json`)
      try {
        await exportBackupFile(filePath)
        return { ran: true, path: filePath }
      } catch (e) {
        return { ran: false, reason: 'error' }
      }
    })
  )

  // misc
  ipcMain.handle('app:version', safeHandler(async () => app.getVersion()))
  ipcMain.handle(
    'app:openExternal',
    safeHandler(async (url: string) => {
      if (!/^https?:\/\//.test(url)) throw new Error('URL non valido')
      await shell.openExternal(url)
    })
  )
  ipcMain.handle(
    'app:savePdf',
    safeHandler(async (fileName: string) => {
      const win = BrowserWindow.getFocusedWindow()
      if (!win) throw new Error('Finestra non disponibile')
      const res = await dialog.showSaveDialog(win, {
        title: 'Salva il riepilogo in PDF',
        defaultPath: fileName,
        filters: [{ name: 'PDF', extensions: ['pdf'] }]
      })
      if (res.canceled || !res.filePath) return null
      const pdf = await win.webContents.printToPDF({
        printBackground: true,
        pageSize: 'A4',
        margins: { marginType: 'custom', top: 0.5, bottom: 0.5, left: 0.5, right: 0.5 }
      })
      writeFileSync(res.filePath, pdf)
      return res.filePath
    })
  )
}

app.whenReady().then(async () => {
  await initDB()
  registerIpc()
  initUpdater()
  await sweepDeleted(24)
  try {
    await materializeDueRecurring(new Date().toISOString().slice(0, 10))
  } catch {
    /* best effort */
  }
  createWindow()
  scheduleUpdateChecks()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
