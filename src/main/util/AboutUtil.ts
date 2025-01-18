import path, { resolve } from "path";
import os from 'os'
import { fileURLToPath } from "url"
import { dialog, app, BrowserWindow } from "electron"


export default class AboutUtil {

  static info(_mainWindow: BrowserWindow) {
    const __dirname = path.dirname(fileURLToPath(import.meta.url))
    const appDetailInfo =
      `Github: https://github.com/lmdown\n`
      + `Gitee: https://gitee.com/lmdown\n`
      + '\n'
      + `Electron Ver: ${process.versions.electron}\n`
      + `Node.js Ver: ${process.versions.node}\n`
      + `OS Ver: ${os.type()} ${os.arch()} ${os.release()}`
    const appRoot = process.env.APP_ROOT = path.join(__dirname, '../..')
    const logoPath = path.join(appRoot, 'src/resource', 'lmd-logo.png')
    dialog.showMessageBox(_mainWindow, {
      title: 'About',
      message: `${app.name} v${app.getVersion()}`,
      detail: appDetailInfo,
      buttons: ['OK'],
      icon: resolve(logoPath)
    });
  }

}
