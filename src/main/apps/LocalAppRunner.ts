import { IpcMain } from 'electron';
import { ChildProcessWithoutNullStreams, spawn } from 'node:child_process'

export default class LocalAppRunner {

  //private allChildAppProcesses: Map<string, ChildProcessWithoutNullStreams> = new Map()
  private _ipcMain: IpcMain;
  private childProcess: ChildProcessWithoutNullStreams;

  constructor(ipcMain: IpcMain) {
    this._ipcMain = ipcMain
    this.init()
  }

  private init() {
    // 启用本机的其他应用程序
    // this._ipcMain?.handle('open-local-app', (_, arg) => {
    //   this.startApp(arg)
    // })
  }

  public startApp(appPath: string) {
    this.childProcess = spawn('open', [appPath]);

    // this.childProcess = spawn(appPath, [], {
    //   env: process.env
    // });
    //childProcess.pid
    console.log('==' + appPath, 'pid ', this.childProcess.pid + '==')
    this.childProcess.stdout.on('data', this.stdoutGotData);
    this.childProcess.stderr.on('data', this.stderrGotData);
    this.childProcess.on('close', ()=>{this.processClosed});
    this.childProcess.on('error', this.onError)
  }

  private stdoutGotData(data) {
    console.log(`stdout: ${data}`);
  }

  private stderrGotData(data) {
    console.error(`stderr: ${data}`);
  }

  private processClosed(code) {
    console.log(`子进程退出码：${code}`);
    console.log(`子进程 killed? `, this);
  }

  private stopApp() {
    this?.childProcess.kill()
    this.childProcess = null
    this._ipcMain = null
  }

  private onError(e){
    console.error('onError', e)
  }

}
