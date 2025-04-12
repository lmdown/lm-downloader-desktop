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
        if(OSUtil.isMacOS()) {
          app.show()
        }
        app.focus()
        console.log('parentDir dose not exist')
        const fullMsg = i18n.t('DirCheck.CheckPathMsg') + parentDir
          + i18n.t('DirCheck.ResetPathMsg')
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
        return false
      } else {
        return true
      }
    }

    static resetDefaultRootDir() {
      const configMgr = ConfigManager.getInstance()
      const defaultRootDir = configMgr.getDefaultRootDir()

      configMgr.ensureConfigFileExist(defaultRootDir)
    }


  }
