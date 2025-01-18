import path from "path";
import ConfigManager from "../ConfigManager";

export default class ScriptPathUtil {

  static getFrontendPath() {
    const baseConfig = ConfigManager.getInstance().getBaseConfig()

    if(!baseConfig.LMD_FRONTEND_DIST_DIR) {
      return path.join(baseConfig.LMD_APP_STORY_DIR, 'frontend/index.html')
    }
    return baseConfig.LMD_FRONTEND_DIST_DIR
  }
  static getTempHtmlPath() {
    return path.join(__dirname, 'page/index.html')
  }

}
