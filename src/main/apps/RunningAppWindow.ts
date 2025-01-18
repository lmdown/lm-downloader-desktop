import { BrowserWindow, BrowserWindowConstructorOptions, Event, IpcMain, dialog } from "electron";
// import { ChildProcess } from "node:child_process";
// import LocalAppRunner from "./LocalAppRunner";
import { IPCChannelName } from "../../constant/IPCChannelName";
import LocaleManager from "../locales/LocaleManager";

export default class RunningAppWindow extends BrowserWindow{

  private appId: string;
  private isCloseConfirmed: boolean = false;
  // AI应用是否在运行中
  isAppInstanceRunning: boolean = false;
  private _ipcMain: IpcMain;
  // Map的Key是appEntryPath。一个AI App可能有多个启动入口文件。
  // private appRunners: Map<string, LocalAppRunner> = new Map();

  constructor(ipcMain: IpcMain, options?: BrowserWindowConstructorOptions) {
    super(options)
    this._ipcMain = ipcMain

    this.init()
  }

  private init() {
    this.on('close', this.onWindowClose)
    //this.on('closed', this.onWindowClosed)
    // this.webContents.
  }


  public startApp(appPath: string) {
    // const runner: LocalAppRunner = new LocalAppRunner(this._ipcMain);
    // this.appRunners.set(appPath, runner)
    // runner.startApp(appPath)
  }

  private onWindowClose(e: Event) {
    // AI应用是否在运行中。如果是非运行状态，窗口关闭时不需要提醒
    if(!this.isAppInstanceRunning) {
      return
    }
    // 如果已经确认过，就直接关闭，不显示确认窗口了
    if(this.isCloseConfirmed) {
      return;
    }
    const i18n = LocaleManager.getInstance().i18nInstance
    // e.preventDefault
    dialog.showMessageBox({
      type: 'info',
      title: i18n.t('RunningWindow.DialogTitle'),
      message: i18n.t('RunningWindow.DialogMessage'),
      buttons: [i18n.t('RunningWindow.Exit'), i18n.t('RunningWindow.Cancel')],   //选择按钮，点击确认则下面的idx为0，取消为1
      cancelId: 1, //这个的值是如果直接把提示框×掉返回的值，这里设置成和“取消”按钮一样的值，下面的idx也会是1
    }).then(idx => {
      // console.log('click --- ', idx)
      if (idx.response == 1) {
          e.preventDefault();
      } else {
          // 停止AI应用然后再关窗口，只有之前未确认过才需要继续执行此段逻辑，
          if(!this.isCloseConfirmed) {
            e.preventDefault();
            this.stopLocalApp().then(() => {
              this.close()
            });
          } else {
            //this.stopLocalApp()
          }
          //this.close()
          this.isCloseConfirmed = true
      }
    })
    // this._allWins.delete(appId)
  }

  private stopAllLocalApps() {
    //this.stopLocalApp()
  }

  // 停止AI App的运行
  private stopLocalApp() {
    // runner.stopApp();
    return new Promise((resolve, reject) => {
      this.webContents?.send(IPCChannelName.STOP_AI_RUNNING_INSTANCE, new Date().toLocaleString())
      setTimeout(()=>{
        resolve(1);
      }, 2000)
    })
  }


}
