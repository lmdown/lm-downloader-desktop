import { app, BrowserWindow } from "electron";
import { IPCChannelName } from "../../constant/IPCChannelName";

export default class AppSchemeManager {

  static instance

  static getInstance(): AppSchemeManager {
    if (!AppSchemeManager.instance) {
      AppSchemeManager.instance = new AppSchemeManager()
    }
    return AppSchemeManager.instance
  }


  init(mainWindow: BrowserWindow) {
    app.setAsDefaultProtocolClient('lmdown')
    app.on('open-url', (event, url) => {
      event.preventDefault();
      console.log(`Application received URL: ${url}`);
      // 根据需要处理 URL 参数
      if (url.includes(IPCChannelName.OPEN_APP_DETAIL_PAGE)) {
          mainWindow.webContents.send(IPCChannelName.OPEN_APP_DETAIL_PAGE, url);
      }
    });

  }

}
