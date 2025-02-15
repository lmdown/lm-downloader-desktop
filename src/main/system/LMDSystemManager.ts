

import { app, ipcMain } from 'electron'
import { IPCHandleName } from '../../constant/IPCHandleName'
import { exec, ExecException } from 'child_process';
import { platform } from 'os';
import SystemCommandUtil from '../util/SystemCommandUtil';

export default class LMDSystemManager {
  static instance

  static getInstance(): LMDSystemManager {
    if (!LMDSystemManager.instance) {
      LMDSystemManager.instance = new LMDSystemManager()
    }
    return LMDSystemManager.instance
  }

  constructor() {}

  init() {
    this.initHandlers()
  }

  initHandlers() {
    ipcMain.handle(IPCHandleName.GET_PROCESS_ENV, async (event, key: string) => {
      return process.env[key]
    })

    ipcMain.handle(IPCHandleName.RESTART_APP, (_) => {
      app.relaunch();
      app.exit(0);
    });

    ipcMain.handle(IPCHandleName.EXIT_APP, (_) => {
      app.exit(0);
    });

    ipcMain.handle(IPCHandleName.KILL_PROCESSES, (_, processNames: string[]) => {
      this.killProcesses(processNames)
    });

    ipcMain.handle(IPCHandleName.RUN_COMMAND, (_, command: string) => {
      return SystemCommandUtil.runCommand(command);
    });

  }

  killProcesses(processNames: string[]): void {
    const currentPlatform: string = platform();

    if (currentPlatform === 'win32') {
        processNames.forEach((processName: string) => {
            const command: string = `taskkill /F /IM "${processName}"`;
            exec(command, (error: ExecException | null, stdout: string, stderr: string) => {
                if (error) {
                    console.error(`执行命令时出错: ${error.message}`);
                    return;
                }
                if (stderr) {
                    console.error(`命令执行产生错误输出: ${stderr}`);
                    return;
                }
                console.log(`成功杀掉进程: ${processName}`);
            });
        });
    } else if (currentPlatform === 'darwin' || currentPlatform === 'linux') {
        processNames.forEach((processName: string) => {
            const command: string = `pkill -f "${processName}"`;
            exec(command, (error: ExecException | null, stdout: string, stderr: string) => {
                if (error) {
                    if (error.code === 1) {
                        console.log(`未找到进程: ${processName}`);
                    } else {
                        console.error(`执行命令时出错: ${error.message}`);
                    }
                    return;
                }
                if (stderr) {
                    console.error(`命令执行产生错误输出: ${stderr}`);
                    return;
                }
                console.log(`成功杀掉进程: ${processName}`);
            });
        });
    } else {
        console.error('不支持的操作系统');
    }
  }

}
