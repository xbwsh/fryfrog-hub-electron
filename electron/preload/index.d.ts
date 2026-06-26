export interface ElectronAPI {
  platform: string
  isMac: boolean
  isWindows: boolean
  isLinux: boolean
  windowMinimize: () => void
  windowMaximize: () => void
  windowClose: () => void
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}
