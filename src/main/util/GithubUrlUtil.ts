import ConfigManager from "../ConfigManager";
import NetworkCheckUtil from "./NetworkCheckUtil";

export default class GithubUrlUtil {

  static async addProxy(downloadUrl: string): Promise<string> {
    if (await NetworkCheckUtil.isGithubAvailable()) {
      return downloadUrl
    } else {
      const globalEnvVars = ConfigManager.getInstance().getENVVariables()
      const proxy = globalEnvVars.GITHUB_PROXY || ''
      return `${proxy}${downloadUrl}`
    }
  }

}
