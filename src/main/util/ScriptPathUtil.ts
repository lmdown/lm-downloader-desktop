import path from "path";
import ConfigManager from "../ConfigManager";
import ServerConfigManager from "../config/ServerConfigManager";

export default class ScriptPathUtil {

  static getFrontendUrl() {
    const config= ServerConfigManager.getInstance().getServerConfig()
    // default local server host and port
    const host = config.HOST || 'localhost'
    const port = config.PORT || '19312'
    return `http://${host}:${port}`
  }

  // static getFrontendPath() {
  //   const baseConfig = ConfigManager.getInstance().getBaseConfig()

  //   if(!baseConfig.LMD_FRONTEND_DIST_DIR) {
  //     return path.join(baseConfig.LMD_APP_STORY_DIR, 'frontend/index.html')
  //   }
  //   return baseConfig.LMD_FRONTEND_DIST_DIR
  // }
  static getTempHtmlPath() {
    return path.join(__dirname, 'page/index.html')
  }

}
