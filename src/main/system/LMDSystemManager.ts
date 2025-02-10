

import { app, ipcMain } from 'electron'
import { IPCHandleName } from '../../constant/IPCHandleName'

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

  }

}
