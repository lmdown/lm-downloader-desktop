import RootDirChecker from "../check/RootDirChecker";
import ConfigManager from "../ConfigManager";
import LocaleManager from "../locales/LocaleManager";
import { CoreConfigManager } from "./CoreConfigManager";

export default class ConfigSyncManager {

  // if rootDirs in CoreConfig and BaseConfig are different.
  // synchronize the value from CoreConfig to BaseConfig.
  syncToBaseConfig(): boolean {
    try {
      const rootDir = CoreConfigManager.getInstance().getRootDir()

      const configMgr = ConfigManager.getInstance()
      const baseConfig = configMgr.getBaseConfig()

      console.log('rootDir:', rootDir)

      if(rootDir) {
        if(rootDir !== baseConfig.LMD_DATA_ROOT) {
          console.log('rootDirs in CoreConfig and BaseConfig are different. start sync.')
          configMgr.ensureConfigFileExist(rootDir)
        } else {
          console.log('rootDirs in CoreConfig and BaseConfig are the same. don\'t sync.')
        }
      } else {
        console.log('rootDir is empty. get from base config file.', rootDir)
        configMgr.saveRootDirToCoreConfig(baseConfig.LMD_DATA_ROOT)
      }
    } catch (err) {
      console.error('syncToBaseConfig error', err)
      const errMsg: string = err?.message
      if(errMsg && errMsg.includes('EACCES')) {
        try {
          LocaleManager.getInstance().initByDefaultLocale()
        } catch (err) {
          console.error('LocaleManager init error', err)
        }
        RootDirChecker.showDirCommonError(err.path)
      }
      return false
    }

    return true

  }



}
