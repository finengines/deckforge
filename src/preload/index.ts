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
      ipcRenderer.invoke('image:import-buffer', data)
  },

  // Export operations
  export: {
    saveFile: (options: { data: any; defaultName: string; filters?: any[] }) =>
      ipcRenderer.invoke('export:save-file', options)
  },

  // PSD import
  psd: {
    import: () => ipcRenderer.invoke('psd:import')
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
