import { Menu, BrowserWindow, app } from 'electron'
import { listDecks } from './database'

export function createMenu(): void {
  const isMac = process.platform === 'darwin'

  const template: Electron.MenuItemConstructorOptions[] = [
    ...(isMac
      ? [
          {
            label: app.name,
            submenu: [
              { role: 'about' as const },
              { type: 'separator' as const },
              { role: 'services' as const },
              { type: 'separator' as const },
              { role: 'hide' as const },
              { role: 'hideOthers' as const },
              { role: 'unhide' as const },
              { type: 'separator' as const },
              { role: 'quit' as const }
            ]
          }
        ]
      : []),
    {
      label: 'File',
      submenu: [
        {
          label: 'New Deck',
          accelerator: 'CmdOrCtrl+N',
          click: (): void => sendToRenderer('menu:new-deck')
        },
        {
          label: 'Open...',
          accelerator: 'CmdOrCtrl+O',
          click: (): void => sendToRenderer('menu:open-file')
        },
        {
          label: 'Open Recent',
          submenu: buildRecentMenu()
        },
        { type: 'separator' },
        {
          label: 'Save',
          accelerator: 'CmdOrCtrl+S',
          click: (): void => sendToRenderer('menu:save')
        },
        {
          label: 'Save As...',
          accelerator: 'CmdOrCtrl+Shift+S',
          click: (): void => sendToRenderer('menu:save-as')
        },
        { type: 'separator' },
        {
          label: 'Import Image...',
          accelerator: 'CmdOrCtrl+I',
          click: (): void => sendToRenderer('menu:import-image')
        },
        {
          label: 'Import PSD...',
          click: (): void => sendToRenderer('menu:import-psd')
        },
        { type: 'separator' },
        {
          label: 'Export PDF...',
          accelerator: 'CmdOrCtrl+E',
          click: (): void => sendToRenderer('menu:export-pdf')
        },
        { type: 'separator' },
        isMac ? { role: 'close' } : { role: 'quit' }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        {
          label: 'Undo',
          accelerator: 'CmdOrCtrl+Z',
          click: (): void => sendToRenderer('menu:undo')
        },
        {
          label: 'Redo',
          accelerator: 'CmdOrCtrl+Shift+Z',
          click: (): void => sendToRenderer('menu:redo')
        },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { type: 'separator' },
        {
          label: 'Delete',
          accelerator: 'Delete',
          click: (): void => sendToRenderer('menu:delete')
        },
        {
          label: 'Duplicate',
          accelerator: 'CmdOrCtrl+D',
          click: (): void => sendToRenderer('menu:duplicate')
        },
        { type: 'separator' },
        { role: 'selectAll' }
      ]
    },
    {
      label: 'View',
      submenu: [
        {
          label: 'Design',
          accelerator: 'CmdOrCtrl+1',
          click: (): void => sendToRenderer('menu:view-design')
        },
        {
          label: 'Data',
          accelerator: 'CmdOrCtrl+2',
          click: (): void => sendToRenderer('menu:view-data')
        },
        {
          label: 'Export',
          accelerator: 'CmdOrCtrl+3',
          click: (): void => sendToRenderer('menu:view-export')
        },
        {
          label: 'Settings',
          accelerator: 'CmdOrCtrl+,',
          click: (): void => sendToRenderer('menu:view-settings')
        },
        { type: 'separator' },
        {
          label: 'Zoom In',
          accelerator: 'CmdOrCtrl+=',
          click: (): void => sendToRenderer('menu:zoom-in')
        },
        {
          label: 'Zoom Out',
          accelerator: 'CmdOrCtrl+-',
          click: (): void => sendToRenderer('menu:zoom-out')
        },
        {
          label: 'Zoom to Fit',
          accelerator: 'CmdOrCtrl+0',
          click: (): void => sendToRenderer('menu:zoom-fit')
        },
        { type: 'separator' },
        {
          label: 'Toggle Grid',
          accelerator: 'CmdOrCtrl+G',
          click: (): void => sendToRenderer('menu:toggle-grid')
        },
        {
          label: 'Toggle Rulers',
          click: (): void => sendToRenderer('menu:toggle-rulers')
        },
        { type: 'separator' },
        { role: 'toggleDevTools' }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'Keyboard Shortcuts',
          accelerator: 'Shift+/',
          click: (): void => sendToRenderer('menu:keyboard-shortcuts')
        },
        { type: 'separator' },
        {
          label: 'About DeckForge',
          click: (): void => sendToRenderer('menu:about')
        }
      ]
    }
  ]

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}

function buildRecentMenu(): Electron.MenuItemConstructorOptions[] {
  try {
    const recents = listDecks().slice(0, 10)
    if (recents.length === 0) {
      return [{ label: 'No recent decks', enabled: false }]
    }

    return recents.map((d) => ({
      label: d.name || 'Untitled Deck',
      sublabel: `${d.cardCount} cards`,
      click: (): void => sendToRenderer('menu:open-recent', d.id)
    }))
  } catch (err) {
    return [{ label: 'No recent decks', enabled: false }]
  }
}

function sendToRenderer(channel: string, ...args: any[]): void {
  const win = BrowserWindow.getFocusedWindow()
  if (win) {
    win.webContents.send(channel, ...args)
  }
}
