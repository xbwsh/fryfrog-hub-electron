import { contextBridge, ipcRenderer } from 'electron'

const platform = process.platform
const isMac = platform === 'darwin'

window.addEventListener('DOMContentLoaded', () => {
  document.documentElement.classList.add(isMac ? 'platform-mac' : platform === 'win32' ? 'platform-win' : 'platform-linux')
})

contextBridge.exposeInMainWorld('electronAPI', {
  platform,
  isMac,
  isWindows: platform === 'win32',
  isLinux: platform === 'linux',
  windowMinimize: () => ipcRenderer.send('window-minimize'),
  windowMaximize: () => ipcRenderer.send('window-maximize'),
  windowClose: () => ipcRenderer.send('window-close'),
})
