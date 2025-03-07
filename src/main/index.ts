import { app, BrowserWindow, shell, ipcMain, HandlerDetails } from 'electron'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import os from 'node:os'
import RunningAppWindowManager from './apps/RunningAppWindowManager'
import ConfigManager from './ConfigManager'
import MenuManager from './menu/MenuManager'
import LMDServerManager from './server/LMDServerManager'
import dotenv from 'dotenv'
import LogManager from './log/LogManager'
import LMDScriptUpdater from './update/LMDScriptUpdater'
import MainWindowManager from './MainWindowManager'
import LocaleManager from './locales/LocaleManager'
import GlobalToolsManager from './global-tools/GlobalToolsManager'
import FileSystemManager from './file/FileSystemManager'
import LMDSystemManager from './system/LMDSystemManager'
import CommonWindowManager from './apps/CommonWindowManager'

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url))

process.env.APP_ROOT = path.join(__dirname, '../..')

export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'out/renderer')

new LogManager();

process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true'

// Disable GPU Acceleration for Windows 7
if (os.release().startsWith('6.1')) app.disableHardwareAcceleration()

if (!app.requestSingleInstanceLock()) {
  app.quit()
  process.exit(0)
}

const mainWindowMgr = MainWindowManager.getInstance()
let win: BrowserWindow | null = null

async function createWindow() {
  // Set application name for Windows 10+ notifications
  if (process.platform === 'win32') app.setAppUserModelId(app.getName())

  win = mainWindowMgr.createMainWindow()
  const menuManager = MenuManager.getInstance()
  menuManager.mainWindow = win
  menuManager.initRightClickMenu(win)
}

app.userAgentFallback = app.userAgentFallback.replace(/Electron\/[\d.]+/g, '');

app.whenReady().then(async () => {
  await ConfigManager.getInstance().init();
  // Locale
  LocaleManager.getInstance().init()
  MenuManager.getInstance().init()
  new RunningAppWindowManager();
  FileSystemManager.getInstance().init()
  LMDSystemManager.getInstance().init()

  await createWindowLoadFiles()
})

const createWindowLoadFiles = async () => {
  createWindow()
  await GlobalToolsManager.getInstance().install()
  // load scripts
  const shouldUpdateStory = process.env.UPDATE_STORY!==undefined ? parseInt(process.env.UPDATE_STORY) : 1
  if(shouldUpdateStory) {
    const updateResult = await new LMDScriptUpdater().update()
  }
  const startLoadPage = () => [
    mainWindowMgr.loadLMDHtml()
  ]
  const startLmdServer = process.env.START_LMD_SERVER!==undefined ? parseInt(process.env.START_LMD_SERVER) : 1
  if(startLmdServer) {
    try {
      new LMDServerManager(startLoadPage)
    } catch(error) {
      console.error('init server err', error)
    } finally {
      startLoadPage()
    }
  } else {
    startLoadPage()
  }
}

app.on('window-all-closed', () => {
  win = null
  app.quit()
  // if (process.platform !== 'darwin') app.quit()
})

app.on('second-instance', () => {
  if (win) {
    // Focus on the main window if the user tried to open another
    if (win.isMinimized()) win.restore()
    win.focus()
  }
})

app.on('activate', () => {
  const allWindows = BrowserWindow.getAllWindows()
  if (allWindows.length) {
    allWindows[0].focus()
  } else {
    createWindowLoadFiles()
  }
})

CommonWindowManager.init()
