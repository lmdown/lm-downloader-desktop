import { app, BrowserWindow, Menu, nativeImage, Tray } from "electron";
import path from "path";
import LocaleManager from "../locales/LocaleManager";

export default class TrayMenuManager {

  public mainWindow: BrowserWindow | null = null

  private tray: Tray|null = null

  private showMainWindow: Function | null = null

  static instance;

  static getInstance(): TrayMenuManager {
      if (!TrayMenuManager.instance) {
        TrayMenuManager.instance = new TrayMenuManager();
      }
      return TrayMenuManager.instance;
  }

  init(createOrShowMainWindow: Function) {
    this.showMainWindow = createOrShowMainWindow

    const appRoot = process.env.APP_ROOT = path.join(__dirname, '../..')
    const logoPath = path.join(appRoot, 'src/resource', 'lmd-logo.png')
    const trayIcon = nativeImage.createFromPath(logoPath).resize({ width: 16, height: 16 });
    this.tray = new Tray(trayIcon);
    // this.tray = new Tray(logoPath);
    const i18n = LocaleManager.getInstance().i18nInstance

    this.tray.setToolTip(i18n.t('Menu.AppName'));
    const contextMenu = Menu.buildFromTemplate([
      {
        label: i18n.t('Menu.AppName'),
        click: () => {
          if (this.showMainWindow) {
            this.showMainWindow(true)
          }
        }
      },
      { label: i18n.t('Menu.Quit'), click: () => app.quit() },
    ]);
    this.tray.setContextMenu(contextMenu);
  }

}

