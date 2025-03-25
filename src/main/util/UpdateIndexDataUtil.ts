import path from "path";
import fs from "fs";
import { LMDAppStoryConfig } from "../../constant/LMDAppStoryConfig";
import ConfigManager from "../ConfigManager";
import UpdateIndexData from "../update/UpdateIndexData";

export default class UpdateIndexDataUtil {

  static getAIAppsDepts() {
    const baseConfig = ConfigManager.getInstance().getBaseConfig()
    const appStoryPath = baseConfig.LMD_APP_STORY_DIR
    let updateIndexData: UpdateIndexData = {} as UpdateIndexData
    const indexFilePath = path.join(appStoryPath, LMDAppStoryConfig.UPDATE_CONFIG_FILE_NAME)
    if (!fs.existsSync(indexFilePath)) {
      console.error(indexFilePath + ' dose not exist')
    } else {
      try {
        updateIndexData = JSON.parse(fs.readFileSync(indexFilePath, {encoding:'utf8', flag:'r'}));
        return updateIndexData?.ai_apps?.depencencies
      } catch(err) {
        console.error('parse error', err)
      }
    }
    return null
  }

}
