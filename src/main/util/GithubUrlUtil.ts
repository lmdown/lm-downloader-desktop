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

  static async chooseGithubPrefix() {
    if(await NetworkCheckUtil.isGithubAvailable()) {
      return ''
    } else {
      return await this.getAvailableGithubPrefix()
    }
  }

  static async getAvailableGithubPrefix() {
    // get config
    let firstPrefix: string
    try {
      const url = 'https://gitee.com/lmdown/lm-downloader-app-story/raw/master/ghp.json';
      const configData = await this.fetchDataWithTimeout(url);
      console.log('getAvailableGithubPrefix configData', configData)
      const ghpList = configData.gh_prefix
      firstPrefix = ghpList[0]
    } catch (err) {
      console.error(err)
      firstPrefix = 'https://gh.llkk.cc/'
    }

    return firstPrefix
  }

  static async fetchDataWithTimeout(url, options = {}, timeout = 5000) {
    const controller = new AbortController();
    const signal = controller.signal;
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    try {
      const response = await fetch(url, { ...options, signal });
      clearTimeout(timeoutId);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      throw error;
    }
  }
}
