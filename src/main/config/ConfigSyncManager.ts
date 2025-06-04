import ConfigManager from "../ConfigManager";
import { CoreConfigManager } from "./CoreConfigManager";

export default class ConfigSyncManager {

  // if rootDirs in CoreConfig and BaseConfig are different.
  // synchronize the value from CoreConfig to BaseConfig.
  syncToBaseConfig() {
    try {
      const rootDir = CoreConfigManager.getInstance().getRootDir()

      const configMgr = ConfigManager.getInstance()


      const baseConfig = ConfigManager.getInstance().getBaseConfig()
      if(rootDir !== baseConfig.LMD_DATA_ROOT) {
        console.log('rootDirs in CoreConfig and BaseConfig are different. start sync.')
        configMgr.ensureConfigFileExist(rootDir)
      } else {
        console.log('rootDirs in CoreConfig and BaseConfig are the same. don\'t sync.')
      }
    } catch (err) {
      console.error('syncToBaseConfig error', err)
    }

  }

}
