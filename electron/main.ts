import { app, BrowserWindow, shell, ipcMain } from 'electron'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'

let mainWindow: BrowserWindow | null = null
const isMac = process.platform === 'darwin'

function createWindow(): void {

  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    show: false,
    ...(isMac
      ? { titleBarStyle: 'hiddenInset', trafficLightPosition: { x: 16, y: 16 } }
      : { frame: false }),
    icon: join(__dirname, '../../resources/icon.png'),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
    },
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow?.show()
  })

  mainWindow.webContents.on('before-input-event', (event, input) => {
    if (
      input.key === 'F12' ||
      (input.control && input.shift && ['I', 'J', 'C'].includes(input.key)) ||
      (input.meta && input.alt && input.key === 'I')
    ) {
      event.preventDefault()
    }
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  createWindow()

  ipcMain.on('window-minimize', () => mainWindow?.minimize())
  ipcMain.on('window-maximize', () => {
    if (mainWindow?.isMaximized()) mainWindow.unmaximize()
    else mainWindow?.maximize()
  })
  ipcMain.on('window-close', () => mainWindow?.close())

  if (isMac) {
    app.dock.setIcon(join(__dirname, '../../resources/icon.png'))
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
