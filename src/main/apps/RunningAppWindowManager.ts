import { app, BrowserWindow, IpcMain, dialog, shell } from 'electron';
import path from 'node:path'
// import LocalAppRunner from './apps/LocalAppRunner';
import { fileURLToPath } from 'node:url'
import RunningAppWindow from './RunningAppWindow';
import { IPCHandleName } from '../../constant/IPCHandleName';
import { IPCChannelName } from '../../constant/IPCChannelName';
import ScriptPathUtil from '../util/ScriptPathUtil';
const __dirname = path.dirname(fileURLToPath(import.meta.url))

/**
 * 运行所有“运行App”窗口的管理器
 */
export default class RunningAppWindowManager {

    private _ipcMain: IpcMain;

    private _allWindows: Map<string, RunningAppWindow> = new Map();

    constructor(ipcMain: IpcMain) {
      this._ipcMain = ipcMain
      this.init()
    }

    private init() {
      this.regHandles()
      this.regListeners()
    }

    // private startApp(installedInstanceId: string, appPath: string) {
    //   const runner: LocalAppRunner = new LocalAppRunner(this._ipcMain);
    //   this._allAppRunners.set(installedInstanceId+"-path:"+appPath, runner)
    //   runner.startApp(appPath)
    // }

    private onWindowClosed(installedInstanceId: string) {
      console.log('窗口被关闭', installedInstanceId)
      // 窗口被关闭，则从_allWins中删除窗口对象
      // console.log('removeWindow', installedInstanceId)
      // this._allWins.delete(installedInstanceId)
      // console.log('remove from _allWins', this._allWins)
    }

    private regHandles() {
      // this._ipcMain?.handle(IPCHandleName.OPEN_RUNNING_WINDOW_AND_INSTALL, (_, installedInstanceId: string, windowPagePath: string) => {
      //   this.openWindow(installedInstanceId, windowPagePath, 'install')
      // })

      this._ipcMain?.handle(IPCHandleName.OPEN_RUNNING_WINDOW, (_, installedInstanceId: string, windowPagePath: string) => {
        // console.log('call open-running-window', _, installedInstanceId, appPagePath)
        this.openWindow(installedInstanceId, windowPagePath)
      })

      this._ipcMain.handle(IPCHandleName.OPEN_PATH, (_, path: string) => {
        console.log('IPCHandleName.OPEN_PATH',path)
        shell.openPath(path)
      })
    }

    private openWindow(installedInstanceId: string, windowPagePath: string) {
      const RENDERER_DIST = path.join(process.env.APP_ROOT, 'out/renderer')
      const preload = path.join(__dirname, '../preload/index.js')
      // const indexHtml = path.join(RENDERER_DIST, 'index.html')
      const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL

      if(this._allWindows.has(installedInstanceId)) {
        const targetChildWindow = this._allWindows.get(installedInstanceId)
        targetChildWindow?.show()
        return
      }

      const childWindow = new RunningAppWindow(this._ipcMain, {
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

      if (VITE_DEV_SERVER_URL) {
        childWindow.loadURL(`${VITE_DEV_SERVER_URL}#${windowPagePath}`)
      } else {
        childWindow.loadFile(ScriptPathUtil.getFrontendPath(), { hash: windowPagePath })
      }

      // this._allWins.set(installedInstanceId, childWindow)
      childWindow.on('closed', () => {
        this.onWindowClosed(installedInstanceId)
        this._allWindows.delete(installedInstanceId)
      })
    }

    private regListeners() {
      this._ipcMain.on(IPCChannelName.RUNNING_STATUS_CHANGE, (event, arg) => {
        const senderWindow: RunningAppWindow = BrowserWindow.fromWebContents(event.sender) as RunningAppWindow;
        senderWindow.isAppInstanceRunning = arg
      })

    }

}
