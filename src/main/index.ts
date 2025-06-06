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
import TrayMenuManager from './menu/TrayMenuManager'
import RootDirChecker from './check/RootDirChecker'
import ConfigSyncManager from './config/ConfigSyncManager'
// import AppSchemeManager from './apps/AppSchemeManager'

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url))

process.env.APP_ROOT = path.join(__dirname, '../..')

export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'out/renderer')

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
  // AppSchemeManager.getInstance().init(win)
}

app.userAgentFallback = app.userAgentFallback.replace(/Electron\/[\d.]+/g, '').replace(/lm-downloader\/[\d.]+/, '');

const createOrShowMainWindow = (focus: boolean = false) => {
  const allWindows = BrowserWindow.getAllWindows()
  if (allWindows.length === 0) {
    // console.log('no window. create one')
    createWindow()
    mainWindowMgr.loadLMDHtml()
    // createWindowLoadFiles()
  } else {
    if(focus) {
      allWindows[0].focus()
    }
  }
}

app.whenReady().then(async () => {

  const configSyncResult = new ConfigSyncManager().syncToBaseConfig()
  if(!configSyncResult) {
    return
  }

  new LogManager();

  const dirCheckResult = RootDirChecker.checkRootDirAvailable();
  if(!dirCheckResult) {
    return
  }

  await ConfigManager.getInstance().init()
  LocaleManager.getInstance().init()
  MenuManager.getInstance().init()



  new RunningAppWindowManager();
  FileSystemManager.getInstance().init()
  LMDSystemManager.getInstance().init()
  TrayMenuManager.getInstance().init(createOrShowMainWindow)
  await createWindowLoadFiles()
})

const createWindowLoadFiles = async () => {
  createWindow()
  mainWindowMgr.updateLoadProgress(8)
  await GlobalToolsManager.getInstance().init()
  mainWindowMgr.updateLoadProgress(12)
  // load scripts
  const shouldUpdateStory = process.env.UPDATE_STORY!==undefined ? parseInt(process.env.UPDATE_STORY) : 1
  if(shouldUpdateStory) {
    await new LMDScriptUpdater().update()
  }
  mainWindowMgr.updateLoadProgress(20)
  const startLoadPage = () => {
    mainWindowMgr.updateLoadProgress(80)
    mainWindowMgr.loadLMDHtml()
    mainWindowMgr.updateLoadProgress(99)
  }
  const startLmdServer = process.env.START_LMD_SERVER!==undefined ? parseInt(process.env.START_LMD_SERVER) : 1
  if(startLmdServer) {
    try {
      new LMDServerManager(startLoadPage)
      mainWindowMgr.updateLoadProgress(60)
    } catch(error) {
      console.error('init server err', error)
      startLoadPage()
    }
  } else {
    startLoadPage()
  }
}

app.on('window-all-closed', () => {
  win = null
  // app.quit()
  if (process.platform !== 'darwin') app.quit()
})

app.on('second-instance', () => {
  if (win) {
    // Focus on the main window if the user tried to open another
    if (win.isMinimized()) win.restore()
    win.focus()
  }
})

app.on('activate', () => {
  createOrShowMainWindow()
})

CommonWindowManager.init()
