import { ipcMain, dialog, BrowserWindow } from 'electron'
import { saveDeck, loadDeck, listDecks, deleteDeck, saveImage, getImagesDir } from './database'
import path from 'path'
import fs from 'fs'
import crypto from 'crypto'
import sharp from 'sharp'

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
      if (typeof id !== 'string' || !id) return { success: false, error: 'Invalid id' }
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
      if (typeof id !== 'string' || !id) return { success: false, error: 'Invalid id' }
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
    // Sanitize filename to prevent path traversal
    const safeName = path.basename(filename)
    const filePath = path.join(imagesDir, safeName)
    if (fs.existsSync(filePath)) {
      return { success: true, data: filePath }
    }
    return { success: false, error: 'Image not found' }
  })

  // --- Image Import from Buffer (drag-and-drop) ---

  ipcMain.handle('image:import-buffer', async (_event, data: { buffer: number[]; filename: string; deckId?: string }) => {
    try {
      const imagesDir = getImagesDir()
      const buffer = Buffer.from(data.buffer)
      // Sanitize filename to prevent path traversal
      const safeName = path.basename(data.filename || 'image.png')
      const ext = path.extname(safeName) || '.png'
      const originalName = safeName
      const hash = crypto.createHash('sha256').update(buffer).digest('hex').slice(0, 16)
      const filename = `${hash}${ext}`
      const destPath = path.join(imagesDir, filename)

      if (!fs.existsSync(destPath)) {
        fs.writeFileSync(destPath, buffer)
      }

      const id = crypto.randomUUID()
      const mimeType = getMimeType(ext)

      saveImage({
        id,
        deckId: data.deckId,
        filename,
        originalName,
        mimeType,
        filePath: destPath
      })

      return {
        success: true,
        data: { id, filename, originalName, mimeType, filePath: destPath }
      }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
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

  // --- Image Processing (sharp) ---

  ipcMain.handle(
    'image:process',
    async (
      _event,
      data: {
        buffer: number[]
        filename: string
        options?: {
          maxWidth?: number
          maxHeight?: number
          format?: 'png' | 'jpeg' | 'webp'
          quality?: number
        }
      }
    ) => {
      try {
        const imagesDir = getImagesDir()
        const opts = data.options ?? {}
        const maxW = opts.maxWidth ?? 2048
        const maxH = opts.maxHeight ?? 2048
        const format = opts.format ?? 'png'
        const quality = opts.quality ?? 90

        const inputBuffer = Buffer.from(data.buffer)

        // Process with sharp
        let pipeline = sharp(inputBuffer).resize(maxW, maxH, { fit: 'inside', withoutEnlargement: true })

        if (format === 'jpeg') {
          pipeline = pipeline.jpeg({ quality })
        } else if (format === 'webp') {
          pipeline = pipeline.webp({ quality })
        } else {
          pipeline = pipeline.png()
        }

        const processed = await pipeline.toBuffer({ resolveWithObject: true })
        const meta = processed.info

        // Generate thumbnail (200px)
        const thumbBuffer = await sharp(processed.data)
          .resize(200, 200, { fit: 'inside', withoutEnlargement: true })
          .png()
          .toBuffer()

        // Save files
        const hash = crypto.createHash('sha256').update(processed.data).digest('hex').slice(0, 16)
        const ext = format === 'jpeg' ? '.jpg' : format === 'webp' ? '.webp' : '.png'
        const filename = `${hash}${ext}`
        const thumbFilename = `${hash}_thumb.png`
        const destPath = path.join(imagesDir, filename)
        const thumbPath = path.join(imagesDir, thumbFilename)

        fs.writeFileSync(destPath, processed.data)
        fs.writeFileSync(thumbPath, thumbBuffer)

        const id = crypto.randomUUID()
        const mimeType = format === 'jpeg' ? 'image/jpeg' : format === 'webp' ? 'image/webp' : 'image/png'

        saveImage({
          id,
          filename,
          originalName: path.basename(data.filename),
          mimeType,
          width: meta.width,
          height: meta.height,
          filePath: destPath
        })

        return {
          success: true,
          data: {
            id,
            path: destPath,
            thumbnailPath: thumbPath,
            width: meta.width,
            height: meta.height,
            format,
            sizeBytes: processed.data.length
          }
        }
      } catch (error: any) {
        return { success: false, error: error.message }
      }
    }
  )

  ipcMain.handle(
    'image:crop',
    async (
      _event,
      data: {
        inputPath: string
        crop: { left: number; top: number; width: number; height: number }
        resize?: { width: number; height: number }
      }
    ) => {
      try {
        const imagesDir = getImagesDir()
        const safePath = path.resolve(data.inputPath)

        let pipeline = sharp(safePath).extract({
          left: Math.round(data.crop.left),
          top: Math.round(data.crop.top),
          width: Math.round(data.crop.width),
          height: Math.round(data.crop.height)
        })

        if (data.resize) {
          pipeline = pipeline.resize(data.resize.width, data.resize.height, { fit: 'fill' })
        }

        const result = await pipeline.png().toBuffer({ resolveWithObject: true })

        const hash = crypto.createHash('sha256').update(result.data).digest('hex').slice(0, 16)
        const filename = `${hash}_cropped.png`
        const destPath = path.join(imagesDir, filename)
        fs.writeFileSync(destPath, result.data)

        const id = crypto.randomUUID()
        saveImage({
          id,
          filename,
          originalName: filename,
          mimeType: 'image/png',
          width: result.info.width,
          height: result.info.height,
          filePath: destPath
        })

        return {
          success: true,
          data: {
            id,
            path: destPath,
            width: result.info.width,
            height: result.info.height
          }
        }
      } catch (error: any) {
        return { success: false, error: error.message }
      }
    }
  )

  // --- Deck File Save/Open ---

  ipcMain.handle('deck:save-file', async (_event, jsonString: string, defaultName: string) => {
    try {
      const win = BrowserWindow.getFocusedWindow()
      if (!win) return { success: false, error: 'No window' }

      const result = await dialog.showSaveDialog(win, {
        defaultPath: defaultName,
        filters: [{ name: 'DeckForge', extensions: ['deckforge'] }]
      })

      if (result.canceled || !result.filePath) {
        return { success: false, error: 'Cancelled' }
      }

      fs.writeFileSync(result.filePath, jsonString, 'utf-8')
      return { success: true, data: result.filePath }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('deck:open-file', async () => {
    try {
      const win = BrowserWindow.getFocusedWindow()
      if (!win) return { success: false, error: 'No window' }

      const result = await dialog.showOpenDialog(win, {
        properties: ['openFile'],
        filters: [{ name: 'DeckForge', extensions: ['deckforge'] }]
      })

      if (result.canceled || result.filePaths.length === 0) {
        return { success: false, error: 'Cancelled' }
      }

      const content = fs.readFileSync(result.filePaths[0], 'utf-8')
      return { success: true, data: content }
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
