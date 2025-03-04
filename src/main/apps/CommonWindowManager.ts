
import { app } from 'electron'
import icon from '../../resource/build/icons/256x256.png?asset'
import { WindowConfig } from './WindowConfig'
import MenuManager from '../menu/MenuManager'

export default class CommonWindowManager {
  static init() {
    app.on('web-contents-created',function(event, webContents){
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
                  webSecurity: false,
                  nodeIntegration: true,
                  contextIsolation: true,
                  nodeIntegrationInWorker: true,
                },
              }
            }
          }
          return { action: 'deny' }
        }
      )

      webContents.on('did-create-window', (newWindow, details) => {
        // 在这里可以访问新创建的窗口对象 newWindow
        // console.log('New window created:', newWindow);
        MenuManager.getInstance().initRightClickMenu(newWindow)
      });

    })

  }
}
