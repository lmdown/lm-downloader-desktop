import { app } from "electron";
import LMDBaseConfig from "../../types/LMDBaseConfig";
import { DEFAULT_LMD_BASE_CONFIG } from "../../template/base_config_template";
import LMDBaseConfigAndRootDir from "../../types/LMDBaseConfigAndRootDir";

export default class ConfigPathUtil {

  static getRootDir(): LMDBaseConfigAndRootDir {
    const userDocumentsPath = app.getPath('documents');
    const tempConfig: LMDBaseConfig = DEFAULT_LMD_BASE_CONFIG;
    const rootDir = tempConfig.LMD_DATA_ROOT.replace('${documents}', userDocumentsPath)
    return {rootDir, tempConfig}
  }
}
