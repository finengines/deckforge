import { ipcMain, dialog, BrowserWindow } from 'electron'
import { saveDeck, loadDeck, listDecks, deleteDeck, saveImage, getImagesDir } from './database'
import path from 'path'
import fs from 'fs'
import crypto from 'crypto'

export function registerIpcHandlers(): void {
  // --- Deck Operations ---

  ipcMain.handle('deck:save', async (_event, deck) => {
    try {
      saveDeck(deck)
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('deck:load', async (_event, id: string) => {
    try {
      const deck = loadDeck(id)
      return { success: true, data: deck }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('deck:list', async () => {
    try {
      const decks = listDecks()
      return { success: true, data: decks }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('deck:delete', async (_event, id: string) => {
    try {
      deleteDeck(id)
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  // --- Image Operations ---

  ipcMain.handle('image:import', async (_event, options?: { deckId?: string }) => {
    try {
      const win = BrowserWindow.getFocusedWindow()
      if (!win) return { success: false, error: 'No window' }

      const result = await dialog.showOpenDialog(win, {
        properties: ['openFile', 'multiSelections'],
        filters: [
          { name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'] },
          { name: 'Photoshop', extensions: ['psd'] },
          { name: 'All Files', extensions: ['*'] }
        ]
      })

      if (result.canceled || result.filePaths.length === 0) {
        return { success: true, data: [] }
      }

      const imported: any[] = []
      const imagesDir = getImagesDir()

      for (const filePath of result.filePaths) {
        const ext = path.extname(filePath)
        const originalName = path.basename(filePath)
        const buffer = fs.readFileSync(filePath)
        const hash = crypto.createHash('sha256').update(buffer).digest('hex').slice(0, 16)
        const filename = `${hash}${ext}`
        const destPath = path.join(imagesDir, filename)

        if (!fs.existsSync(destPath)) {
          fs.copyFileSync(filePath, destPath)
        }

        const id = crypto.randomUUID()
        const mimeType = getMimeType(ext)

        saveImage({
          id,
          deckId: options?.deckId,
          filename,
          originalName,
          mimeType,
          filePath: destPath
        })

        imported.push({
          id,
          filename,
          originalName,
          mimeType,
          filePath: destPath
        })
      }

      return { success: true, data: imported }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('image:get-path', async (_event, filename: string) => {
    const imagesDir = getImagesDir()
    const filePath = path.join(imagesDir, filename)
    if (fs.existsSync(filePath)) {
      return { success: true, data: filePath }
    }
    return { success: false, error: 'Image not found' }
  })

  // --- File Export ---

  ipcMain.handle('export:save-file', async (_event, options: { data: Buffer | string; defaultName: string; filters?: any[] }) => {
    try {
      const win = BrowserWindow.getFocusedWindow()
      if (!win) return { success: false, error: 'No window' }

      const result = await dialog.showSaveDialog(win, {
        defaultPath: options.defaultName,
        filters: options.filters || [
          { name: 'PDF', extensions: ['pdf'] },
          { name: 'PNG', extensions: ['png'] },
          { name: 'JPEG', extensions: ['jpg', 'jpeg'] },
          { name: 'All Files', extensions: ['*'] }
        ]
      })

      if (result.canceled || !result.filePath) {
        return { success: false, error: 'Cancelled' }
      }

      if (typeof options.data === 'string') {
        fs.writeFileSync(result.filePath, options.data)
      } else {
        fs.writeFileSync(result.filePath, Buffer.from(options.data))
      }

      return { success: true, data: result.filePath }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  // --- PSD Import ---

  ipcMain.handle('psd:import', async () => {
    try {
      const win = BrowserWindow.getFocusedWindow()
      if (!win) return { success: false, error: 'No window' }

      const result = await dialog.showOpenDialog(win, {
        properties: ['openFile'],
        filters: [{ name: 'Photoshop', extensions: ['psd'] }]
      })

      if (result.canceled || result.filePaths.length === 0) {
        return { success: false, error: 'Cancelled' }
      }

      const buffer = fs.readFileSync(result.filePaths[0])
      // Return as base64 for renderer to parse with ag-psd
      return {
        success: true,
        data: {
          buffer: buffer.toString('base64'),
          filename: path.basename(result.filePaths[0])
        }
      }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })
}

function getMimeType(ext: string): string {
  const map: Record<string, string> = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.bmp': 'image/bmp',
    '.svg': 'image/svg+xml',
    '.psd': 'image/vnd.adobe.photoshop'
  }
  return map[ext.toLowerCase()] || 'application/octet-stream'
}
