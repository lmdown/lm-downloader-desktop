import { BrowserWindow, dialog, ipcMain } from "electron";
import { IPCHandleName } from "../../constant/IPCHandleName";

export default class FileSystemManager {

  static instance;

  static getInstance(): FileSystemManager {
      if (!FileSystemManager.instance) {
        FileSystemManager.instance = new FileSystemManager();
      }
      return FileSystemManager.instance;
  }

  constructor() {

  }

  init() {
    this.initHandlers()
  }

  initHandlers() {
    ipcMain.handle(IPCHandleName.SELECT_DIR, async (event, defaultPath) => {
      const result = await dialog.showOpenDialog({
        defaultPath: defaultPath,
        properties: ['openDirectory']
      });
      console.log('openDirectory result', result)
      if (!result.canceled) {
        return result.filePaths[0];
      } else {
        return null;
      }
    })
  }

}
