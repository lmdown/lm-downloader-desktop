import { BrowserWindow, shell } from "electron"
import icon from '../resource/build/icons/256x256.png?asset'
import path from "path"
import ScriptPathUtil from "./util/ScriptPathUtil"
import { WindowConfig } from "./apps/WindowConfig"

export default class MainWindowManager {

  private win: BrowserWindow | null = null

  static instance;

  static getInstance(): MainWindowManager {
      if (!MainWindowManager.instance) {
        MainWindowManager.instance = new MainWindowManager();
      }
      return MainWindowManager.instance;
  }

  constructor() {

  }

  createMainWindow(): BrowserWindow {
    if(this.win) {
      return this.win
    }
    const preload = path.join(__dirname, '../preload/index.js')
    this.win = new BrowserWindow({
      width: WindowConfig.MAIN_WIN_WIDTH,
      height: WindowConfig.MAIN_WIN_HEIGHT,
      // remove the default titlebar
      titleBarStyle: 'hidden',
      // expose window controlls in Windows/Linux
      ...(process.platform !== 'darwin' ? { titleBarOverlay: true } : {}),
      title: 'LM Downloader',
      ...(process.platform === 'linux' ? { icon } : {}),
      webPreferences: {
        preload,
        // Warning: Enable nodeIntegration and disable contextIsolation is not secure in production
        // nodeIntegration: true,
        // Consider using contextBridge.exposeInMainWorld
        // Read more on https://www.electronjs.org/docs/latest/tutorial/context-isolation
        // contextIsolation: false,
        nodeIntegration:true,
        contextIsolation: true,
        webSecurity: false,
        webviewTag: true,
      },
    })

    // this.win.webContents.on('did-finish-load', () => {
    //   this.win?.webContents.send('main-process-message', new Date().toLocaleString())
    // })

    this.win.on('ready-to-show', () => {
      this.win?.show()
    })

    // Make all links open with the browser, not with the application
    this.win.webContents.setWindowOpenHandler(({ url }) => {
      if (url.startsWith('https:') || url.startsWith('http:')) shell.openExternal(url)
      return { action: 'deny' }
    })
    // win.webContents.on('will-navigate', (event, url) => { }) #344
    this.loadTempEmptyHtml()
    return this.win
  }

  loadTempEmptyHtml() {
    this.win?.loadFile(ScriptPathUtil.getTempHtmlPath())
  }

  loadLMDHtml() {
    console.log('loadLMDHtml')
    const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL
    let url
    if (process.env.NODE_ENV === 'development' && VITE_DEV_SERVER_URL) {
      url = VITE_DEV_SERVER_URL
      // Open devTool if the app is not packaged
      // win.webContents.openDevTools()
    } else {
      url = ScriptPathUtil.getFrontendUrl()
      // this.win?.loadFile(ScriptPathUtil.getFrontendPath())
    }
    this.win?.loadURL(url)
  }

}
