import ConfigManager from "../ConfigManager";
import NetworkCheckUtil from "./NetworkCheckUtil";

export default class GithubUrlUtil {

  static addProxy(downloadUrl: string) {
    if(NetworkCheckUtil.isGithubAvailable()) {
      return downloadUrl
    } else {
      const globalEnvVars = ConfigManager.getInstance().getENVVariables()
      const proxy = globalEnvVars.GITHUB_PROXY || ''
      return `${proxy}${downloadUrl}`
    }
  }

}
