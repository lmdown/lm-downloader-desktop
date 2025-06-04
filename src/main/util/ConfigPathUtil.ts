import { app } from "electron";
import LMDBaseConfig from "../../types/LMDBaseConfig";
import { DEFAULT_LMD_BASE_CONFIG } from "../../template/base_config_template";
import LMDBaseConfigAndRootDir from "../../types/LMDBaseConfigAndRootDir";
import { CoreConfigManager } from "../config/CoreConfigManager";

export default class ConfigPathUtil {


  static getRootDir(): LMDBaseConfigAndRootDir {
    const coreConfigManager = CoreConfigManager.getInstance()
    const configAndRootDir = this.getDefaultRoot()

    const dataRootFromCoreConfig: string = coreConfigManager.getRootDir()
    if(dataRootFromCoreConfig) {
      configAndRootDir.rootDir = dataRootFromCoreConfig
    }
    return configAndRootDir
  }


  static getDefaultRoot(): LMDBaseConfigAndRootDir {
    const userDocumentsPath = app.getPath('documents');
    const tempConfig: LMDBaseConfig = DEFAULT_LMD_BASE_CONFIG;
    const rootDir = tempConfig.LMD_DATA_ROOT.replace('${documents}', userDocumentsPath)
    return {rootDir, tempConfig}
  }

}
