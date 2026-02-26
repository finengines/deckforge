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

interface ProcessedImage {
  id: string
  path: string
  thumbnailPath: string
  width: number
  height: number
  format: string
  sizeBytes: number
}

interface CroppedImage {
  id: string
  path: string
  width: number
  height: number
}

interface ImageAPI {
  import: (options?: { deckId?: string }) => Promise<IpcResult<ImportedImage[]>>
  getPath: (filename: string) => Promise<IpcResult<string>>
  importBuffer: (data: { buffer: number[]; filename: string; deckId?: string }) => Promise<IpcResult<ImportedImage>>
  process: (data: {
    buffer: number[]
    filename: string
    options?: { maxWidth?: number; maxHeight?: number; format?: 'png' | 'jpeg' | 'webp'; quality?: number }
  }) => Promise<IpcResult<ProcessedImage>>
  crop: (data: {
    inputPath: string
    crop: { left: number; top: number; width: number; height: number }
    resize?: { width: number; height: number }
  }) => Promise<IpcResult<CroppedImage>>
}

interface ExportAPI {
  saveFile: (options: { data: any; defaultName: string; filters?: any[] }) => Promise<IpcResult<string>>
}

interface PsdAPI {
  import: () => Promise<IpcResult<{ buffer: string; filename: string }>>
}

interface DeckFileAPI {
  save: (jsonString: string, defaultName: string) => Promise<IpcResult<string>>
  open: () => Promise<IpcResult<string>>
}

interface CustomAPI {
  deck: DeckAPI
  image: ImageAPI
  export: ExportAPI
  psd: PsdAPI
  deckFile: DeckFileAPI
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: CustomAPI
  }
}
