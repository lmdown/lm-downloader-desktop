import { Menu, dialog, app, BrowserWindow, ipcMain, MenuItem, ContextMenuParams, WebContentsView } from "electron"
import { IPCChannelName } from "../../constant/IPCChannelName"
import AboutUtil from "../util/AboutUtil"
import { IPCHandleName } from "../../constant/IPCHandleName"
import LocaleManager from "../locales/LocaleManager"

export default class MenuManager {

  public mainWindow: BrowserWindow | null = null

  static instance;

  static getInstance(): MenuManager {
      if (!MenuManager.instance) {
        MenuManager.instance = new MenuManager();
      }
      return MenuManager.instance;
  }

  constructor() {

  }

  init() {
    this.initWindowMenu()
    this.initHandlers()
  }

  initWindowMenu() {
    const i18n = LocaleManager.getInstance().i18nInstance
    const isMac = process.platform === 'darwin'
    const menuConfig = [
      // { role: 'appMenu' }
      ...(isMac
        ? [{
            label: app.name,
            submenu: [
              {
                // role: 'about',
                label: i18n.t('Menu.About'),
                click: () => {
                  this.info()
                }
               },
              { type: 'separator' },
              {
                label: i18n.t('Menu.Settings'),
                accelerator: isMac ? 'Cmd+,' : 'Ctrl+,',
                click: () => { this.showGlobalConfig() }
              },
              {role: 'toggledevtools'},
              { role: 'services' },
              { type: 'separator' },
              { role: 'hide' },
              { role: 'hideOthers' },
              { role: 'unhide' },
              { type: 'separator' },
              { role: 'quit' }
            ]
          }]
        : [
          {
            role: 'about',
            click: () => {
              this.info()
            }
           },
           { type: 'separator' },
          {
            label: 'Settings...',
            accelerator: isMac ? 'Cmd+,' : 'Ctrl+,',
            click: () => { this.showGlobalConfig() }
          },
        ]),
      // { role: 'fileMenu' },
      {
        label: 'File',
        submenu: [
          isMac ? { role: 'close' } : { role: 'quit' }
        ]
      },
      // { role: 'editMenu' }
      {
        label: 'Edit',
        submenu: [
          { role: 'undo' },
          { role: 'redo' },
          { type: 'separator' },
          { role: 'cut' },
          { role: 'copy' },
          { role: 'paste' },
          ...(isMac
            ? [
                { role: 'pasteAndMatchStyle' },
                { role: 'delete' },
                { role: 'selectAll' },
                { type: 'separator' },
                {
                  label: 'Speech',
                  submenu: [
                    { role: 'startSpeaking' },
                    { role: 'stopSpeaking' }
                  ]
                }
              ]
            : [
                { role: 'delete' },
                { type: 'separator' },
                { role: 'selectAll' }
              ])
        ]
      },
      // { role: 'viewMenu' }
      {
        label: 'View',
        submenu: [
          { role: 'reload' },
          { role: 'forceReload' },
          { role: 'toggleDevTools' },
          { type: 'separator' },
          { role: 'resetZoom' },
          { role: 'zoomIn' },
          { role: 'zoomOut' },
          { type: 'separator' },
          { role: 'togglefullscreen' }
        ]
      },
      // { role: 'windowMenu' }
      {
        label: 'Window',
        submenu: [
          { role: 'minimize' },
          { role: 'zoom' },
          ...(isMac
            ? [
                { type: 'separator' },
                { role: 'front' },
                { type: 'separator' },
                { role: 'window' }
              ]
            : [
                { role: 'close' }
              ])
        ]
      },
      // {
      //   role: 'help',
      //   submenu: [
      //     {
      //       label: 'Learn More',
      //       click: async () => {
      //         const { shell } = require('electron')
      //         await shell.openExternal('https://electronjs.org')
      //       }
      //     }
      //   ]
      // }
    ]


    // @ts-ignore
    const menu = Menu.buildFromTemplate(menuConfig)
    Menu.setApplicationMenu(menu)
  }

  initRightClickMenu(targetWindow: BrowserWindow | WebContentsView) {
    targetWindow.webContents.on('context-menu', (event, params) => {
      this.showContextMenu(targetWindow, params)
    })
  }

  showContextMenu(targetWindow: BrowserWindow | WebContentsView,
      params: ContextMenuParams) {
    const i18n = LocaleManager.getInstance().i18nInstance
    const menu = new Menu();

    if (targetWindow.webContents.navigationHistory.canGoForward()) {
      menu.append(new MenuItem({
        label: i18n.t('Menu.Forward'),
        click: () => targetWindow.webContents.navigationHistory.goForward(),
      }));
    }

    if (targetWindow.webContents.navigationHistory.canGoBack()) {
      menu.append(new MenuItem({
        label: i18n.t('Menu.GoBack'),
        click: () => targetWindow.webContents.navigationHistory.goBack(),
      }));
    }

    menu.append(new MenuItem({
      label: i18n.t('Menu.Reload'),
      click: () => targetWindow.webContents.reload(),
    }));

    menu.append(new MenuItem({ type: 'separator' }));

    if (params.editFlags.canCut) {
      menu.append(new MenuItem({
        label: i18n.t('Menu.Cut'),
        click: () => targetWindow.webContents.cut(),
      }));
    }

    if (params.editFlags.canCopy) {
      menu.append(new MenuItem({
        label: i18n.t('Menu.Copy'),
        click: () => targetWindow.webContents.copy(),
      }));
    }

    if (params.editFlags.canPaste) {
      menu.append(new MenuItem({
        label: i18n.t('Menu.Paste'),
        click: () => targetWindow.webContents.paste(),
      }));
    }
    if (params.editFlags.canDelete) {
      menu.append(new MenuItem({
        label: i18n.t('Menu.Delete'),
        click: () => targetWindow.webContents.delete(),
      }));
    }

    if (params.editFlags.canSelectAll) {
      menu.append(new MenuItem({
        label: i18n.t('Menu.SelectAll'),
        click: () => targetWindow.webContents.selectAll(),
      }));
    }

    // 显示菜单
    menu.popup();
  }

  initHandlers() {
    ipcMain.handle(IPCHandleName.SHOW_ABOUT, (_, arg) => {
      return this.info()
    })
  }

  info() {
    if(this.mainWindow) {
      AboutUtil.info(this.mainWindow)
    }
  }

  showGlobalConfig() {
    this.mainWindow?.show()
    this.mainWindow?.webContents.send(IPCChannelName.OPEN_GLOBAL_CONFIG_DIALOG)
  }

}
