import { contextBridge } from 'electron'

const platform = process.platform
const isMac = platform === 'darwin'

document.documentElement.classList.add(isMac ? 'platform-mac' : platform === 'win32' ? 'platform-win' : 'platform-linux')

contextBridge.exposeInMainWorld('electronAPI', {
  platform,
  isMac,
  isWindows: platform === 'win32',
  isLinux: platform === 'linux',
})
