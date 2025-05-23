import { app, BrowserWindow, Menu, nativeImage, Tray } from "electron";
import path from "path";
import LocaleManager from "../locales/LocaleManager";
import iconPath from '../../resource/build/icons/256x256.png?asset';
import OSUtil from "../util/OSUtil";

export default class TrayMenuManager {

  public mainWindow: BrowserWindow | null = null

  private tray: Tray|null = null

  private showMainWindow: ((focus:boolean)=>void) | null = null

  static instance;

  static getInstance(): TrayMenuManager {
      if (!TrayMenuManager.instance) {
        TrayMenuManager.instance = new TrayMenuManager();
      }
      return TrayMenuManager.instance;
  }

  init(createOrShowMainWindow: (focus:boolean)=>void) {
    this.showMainWindow = createOrShowMainWindow

    // const iconPath = app.isPackaged
    //   ? path.join(process.resourcesPath, 'out/main/chunks', '256x256-Br1RnEV9.png')
    //   : path.join(__dirname, '../../src/resource', 'lmd-logo.png');

    // const appRoot = process.env.APP_ROOT = path.join(__dirname, '../..')
    // const logoPath = path.join(appRoot, 'src/resource', 'lmd-logo.png')
    const trayIcon = nativeImage.createFromPath(iconPath).resize({ width: 20, height: 20 });
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

    this.tray.on('click', () => {

      if(OSUtil.isMacOS()) {
        app.show()
        app.focus()
      } else {
        if (this.showMainWindow) {
          this.showMainWindow(true)
        }
      }

    });

    app.on('before-quit', () => {
      if (this.tray) {
        this.tray.destroy();
      }
    });
  }

}

