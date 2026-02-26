import { ElectronAPI } from '@electron-toolkit/preload'

interface IpcResult<T = any> {
  success: boolean
  data?: T
  error?: string
}

interface DeckSummary {
  id: string
  name: string
  description: string
  cardCount: number
  createdAt: string
  updatedAt: string
}

interface ImportedImage {
  id: string
  filename: string
  originalName: string
  mimeType: string
  filePath: string
}

interface DeckAPI {
  save: (deck: any) => Promise<IpcResult>
  load: (id: string) => Promise<IpcResult>
  list: () => Promise<IpcResult<DeckSummary[]>>
  delete: (id: string) => Promise<IpcResult>
}

interface ImageAPI {
  import: (options?: { deckId?: string }) => Promise<IpcResult<ImportedImage[]>>
  getPath: (filename: string) => Promise<IpcResult<string>>
}

interface ExportAPI {
  saveFile: (options: { data: any; defaultName: string; filters?: any[] }) => Promise<IpcResult<string>>
}

interface PsdAPI {
  import: () => Promise<IpcResult<{ buffer: string; filename: string }>>
}

interface CustomAPI {
  deck: DeckAPI
  image: ImageAPI
  export: ExportAPI
  psd: PsdAPI
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: CustomAPI
  }
}
