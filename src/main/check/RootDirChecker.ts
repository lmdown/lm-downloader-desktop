import { IpcMain, app, dialog, ipcMain } from "electron";
import { i18n } from "../locales/i18n";

import ConfigManager from "../ConfigManager";
import path from "path";
import fs from "fs";
import OSUtil from "../util/OSUtil";

export default class RootDirChecker {

  static checkRootDirAvailable(): boolean {
      // If the lmd root dir is not exist, this app should restart with default dir.
      const baseConfig = ConfigManager.getInstance().getBaseConfig()
      const parentDir = path.dirname(baseConfig.LMD_DATA_ROOT)
      const parentDirExist = fs.existsSync(parentDir)
      console.log('parentDir', parentDir)
      if(!parentDirExist) {
        const fullMsg = i18n.t('DirCheck.CheckPathMsg') + parentDir
          + i18n.t('DirCheck.ResetPathMsg')
        this.showDialog(fullMsg)
        return false
      } else {
        return true
      }
    }

    // static checkScriptDirAvailable(): boolean {
    //   const parentDirExist = fs.existsSync(parentDir)
    // }

    static showDialog(fullMsg) {
      if(OSUtil.isMacOS()) {
        app.show()
      }
      app.focus()
      console.log('parentDir does not exist')

      dialog.showMessageBox({
          type: 'info',
          title: i18n.t('DirCheck.DialogTitle'),
          message: fullMsg,
          buttons: [
            i18n.t('DirCheck.ResetAndRestart'),
            i18n.t('DirCheck.Quit')
          ],
          cancelId: 1,
        }).then(idx => {
          if (idx.response == 0) {
            // reset path and restart app
            this.resetDefaultRootDir()
            app.relaunch();
            app.exit(0);
          } else {
            // just exit
            app.exit(0);
          }
        })
    }

    static showDirCommonError(dir: string): void {
      const fullMsg = i18n.t('DirCheck.CheckPathMsg') + dir
        + i18n.t('DirCheck.ResetPathMsg')
      this.showDialog(fullMsg)
    }

    static resetDefaultRootDir() {
      const configMgr = ConfigManager.getInstance()
      const defaultRootDir = configMgr.getDefaultRootDir()

      configMgr.ensureConfigFileExist(defaultRootDir)
    }


  }
