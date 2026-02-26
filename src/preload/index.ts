import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  // Deck operations
  deck: {
    save: (deck: any) => ipcRenderer.invoke('deck:save', deck),
    load: (id: string) => ipcRenderer.invoke('deck:load', id),
    list: () => ipcRenderer.invoke('deck:list'),
    delete: (id: string) => ipcRenderer.invoke('deck:delete', id)
  },

  // Image operations
  image: {
    import: (options?: { deckId?: string }) => ipcRenderer.invoke('image:import', options),
    getPath: (filename: string) => ipcRenderer.invoke('image:get-path', filename),
    importBuffer: (data: { buffer: number[]; filename: string; deckId?: string }) =>
      ipcRenderer.invoke('image:import-buffer', data),
    process: (data: {
      buffer: number[]
      filename: string
      options?: { maxWidth?: number; maxHeight?: number; format?: 'png' | 'jpeg' | 'webp'; quality?: number }
    }) => ipcRenderer.invoke('image:process', data),
    crop: (data: {
      inputPath: string
      crop: { left: number; top: number; width: number; height: number }
      resize?: { width: number; height: number }
    }) => ipcRenderer.invoke('image:crop', data)
  },

  // Export operations
  export: {
    saveFile: (options: { data: any; defaultName: string; filters?: any[] }) =>
      ipcRenderer.invoke('export:save-file', options)
  },

  // PSD import
  psd: {
    import: () => ipcRenderer.invoke('psd:import')
  },

  // Deck file operations
  deckFile: {
    save: (jsonString: string, defaultName: string) =>
      ipcRenderer.invoke('deck:save-file', jsonString, defaultName),
    open: () => ipcRenderer.invoke('deck:open-file')
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
