import path, { resolve } from "path";
import os from 'os'
import { fileURLToPath } from "url"
import { dialog, app, BrowserWindow } from "electron"
import LocaleManager from "../locales/LocaleManager";
import iconPath from '../../resource/build/icons/256x256.png?asset';

export default class AboutUtil {

  static info(_mainWindow: BrowserWindow) {
    const __dirname = path.dirname(fileURLToPath(import.meta.url))
    const i18n = LocaleManager.getInstance().i18nInstance
    const appName = i18n.t('Menu.AppName')
    const appDetailInfo =
      `https://daiyl.com\n`
      + `Github: https://github.com/lmdown\n`
      + `Gitee: https://gitee.com/lmdown\n`
      + '\n'
      + `Electron Ver: ${process.versions.electron}\n`
      + `Node.js Ver: ${process.versions.node}\n`
      + `OS Ver: ${os.type()} ${os.arch()} ${os.release()}`
    const appRoot = process.env.APP_ROOT = path.join(__dirname, '../..')
    const logoPath = path.join(appRoot, 'src/resource', 'lmd-logo.png')
    dialog.showMessageBox(_mainWindow, {
      title: 'About',
      message: `${appName} v${app.getVersion()}`,
      detail: appDetailInfo,
      buttons: ['OK'],
      // icon: resolve(logoPath)
      icon: iconPath
    });
  }

}
