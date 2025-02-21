import { app, BrowserWindow, IpcMain, dialog, shell, ipcMain } from 'electron';
import path from 'node:path'
// import LocalAppRunner from './apps/LocalAppRunner';
import { fileURLToPath } from 'node:url'
import RunningAppWindow from './RunningAppWindow';
import { IPCHandleName } from '../../constant/IPCHandleName';
import { IPCChannelName } from '../../constant/IPCChannelName';
import ScriptPathUtil from '../util/ScriptPathUtil';
import icon from '../../resource/build/icons/256x256.png?asset'
import UrlUtil from '../util/UrlUtil';
const __dirname = path.dirname(fileURLToPath(import.meta.url))

/**
 * 运行所有“运行App”窗口的管理器
 */
export default class RunningAppWindowManager {

    private _allWindows: Map<string, RunningAppWindow> = new Map();

    constructor() {
      this.init()
    }

    private init() {
      this.regHandles()
      this.regListeners()
    }

    // private startApp(installedInstanceId: string, appPath: string) {
    //   const runner: LocalAppRunner = new LocalAppRunner(ipcMain);
    //   this._allAppRunners.set(installedInstanceId+"-path:"+appPath, runner)
    //   runner.startApp(appPath)
    // }

    private onWindowClosed(installedInstanceId: string) {
      console.log('running window closed ', installedInstanceId)
      // 窗口被关闭，则从_allWins中删除窗口对象
      // console.log('removeWindow', installedInstanceId)
      // this._allWins.delete(installedInstanceId)
      // console.log('remove from _allWins', this._allWins)
    }

    private regHandles() {
      // ipcMain?.handle(IPCHandleName.OPEN_RUNNING_WINDOW_AND_INSTALL, (_, installedInstanceId: string, windowPagePath: string) => {
      //   this.openWindow(installedInstanceId, windowPagePath, 'install')
      // })

      ipcMain?.handle(IPCHandleName.OPEN_RUNNING_WINDOW, (_, installedInstanceId: string, windowPagePath: string, reloadPage: boolean = false) => {
        // console.log('call open-running-window', _, installedInstanceId, appPagePath)
        this.openWindow(installedInstanceId, windowPagePath, reloadPage)
      })

      ipcMain?.handle(IPCHandleName.CLOSE_RUNNING_WINDOW, (_, installedInstanceId: string) => {
        this.closeWindow(installedInstanceId)
      })

      ipcMain.handle(IPCHandleName.OPEN_PATH, (_, path: string) => {
        shell.openPath(path)
      })
    }

    private openWindow(installedInstanceId: string, windowPagePath: string, reloadPage: boolean = false) {
      // const RENDERER_DIST = path.join(process.env.APP_ROOT, 'out/renderer')
      const preload = path.join(__dirname, '../preload/index.js')
      // const indexHtml = path.join(RENDERER_DIST, 'index.html')

      if(this._allWindows.has(installedInstanceId)) {
        const targetChildWindow = this._allWindows.get(installedInstanceId)
        console.log('openWindow',targetChildWindow, reloadPage)
        if(targetChildWindow) {
          if(reloadPage) {
            targetChildWindow.close()
            this._allWindows.delete(installedInstanceId)
          } else {
            targetChildWindow?.show()
            return
          }
        }
      }

      const childWindow = new RunningAppWindow(ipcMain, {
        ...(process.platform !== 'darwin' ? { autoHideMenuBar: true } : {}),
        ...(process.platform === 'linux' ? { icon } : {}),
        width: 1180,
        height: 760,
        webPreferences: {
          preload,
          nodeIntegration: true,
          contextIsolation: true,
          nodeIntegrationInWorker: true,
          webSecurity: false,
        },
      })

      this._allWindows.set(installedInstanceId, childWindow)

      childWindow.webContents.setWindowOpenHandler((data) => {
        const { url } = data
        console.log('click open ', url, data)
        if (url.startsWith('https:') || url.startsWith('http:')) {
          shell.openExternal(url).then(() => {
            console.log('The external link has been opened in the default browser.');
          }).catch((error) => {
            console.error('An error occurred when trying to open the external link:', error);
          });
        }
        return { action: 'deny' }
      })


      this.loadPage(childWindow, windowPagePath)
      // this._allWins.set(installedInstanceId, childWindow)
      childWindow.on('closed', () => {
        this.onWindowClosed(installedInstanceId)
        this._allWindows.delete(installedInstanceId)
      })
    }

    private closeWindow(installedInstanceId: string) {
      if(this._allWindows.has(installedInstanceId)) {
        const targetChildWindow = this._allWindows.get(installedInstanceId)
        targetChildWindow?.show()
        if(targetChildWindow) {
          targetChildWindow.close()
        }
      }
    }

    private loadPage(childWindow: RunningAppWindow, windowPagePath: string) {
      const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL
      if (VITE_DEV_SERVER_URL) {
        const url = UrlUtil.addQueryParam(`${VITE_DEV_SERVER_URL}#${windowPagePath}`,
          'UPDATE_INSTALL_SCRIPTS', process.env.UPDATE_INSTALL_SCRIPTS)
        childWindow.loadURL(url)
      } else {
        const path = ScriptPathUtil.getFrontendPath()
        childWindow.loadFile(path, { hash: windowPagePath })
      }
    }

    private regListeners() {
      ipcMain.on(IPCChannelName.RUNNING_STATUS_CHANGE, (event, arg) => {
        const senderWindow: RunningAppWindow = BrowserWindow.fromWebContents(event.sender) as RunningAppWindow;
        senderWindow.isAppInstanceRunning = arg
      })

    }

}
