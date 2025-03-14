
import { app } from 'electron'
import icon from '../../resource/build/icons/256x256.png?asset'
import { WindowConfig } from './WindowConfig'
import MenuManager from '../menu/MenuManager'
import { sandboxed } from 'process'

export default class CommonWindowManager {
  static init() {
    app.on('web-contents-created',function(event, webContents){
      // console
      CommonWindowManager.regWindowOpenHandler(webContents)
    })
  }

  static regWindowOpenHandler(webContents) {
    webContents.setWindowOpenHandler((details) => {
      if (details.url) {
        return {
          action: 'allow',// allow create new window
          overrideBrowserWindowOptions: {
            title: "LM Downloader",
            width: WindowConfig.COMMON_WIN_WIDTH,
            height: WindowConfig.COMMON_WIN_HEIGHT,
            autoHideMenuBar: true,
            ...(process.platform !== 'darwin' ? { autoHideMenuBar: true } : {}),
            ...(process.platform === 'linux' ? { icon } : {}),
            resizable: true,
            webPreferences: {
              webSecurity: true,
              nodeIntegration: false,
              contextIsolation: true,
              nodeIntegrationInWorker: false,
            },
          }
        }
        }
        return { action: 'deny' }
      }
    )

    webContents.on('did-create-window', (newWindow, details) => {
      MenuManager.getInstance().initRightClickMenu(newWindow)
    });
  }

}
