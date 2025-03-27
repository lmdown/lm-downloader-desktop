import GFWCheckUtil from "./GFWCheckUtil";

export default class NetworkCheckUtil {

  static async isGithubAvailable(): Promise<boolean> {
    const githubBlocked = await GFWCheckUtil.asyncCheck('https://github.com/', 'https://gitee.com/')
    const googleBlocked = await GFWCheckUtil.asyncCheck('https://www.google.com/', 'https://www.google.cn/')
    // if github and google are both available, return true.
    return !githubBlocked && !googleBlocked
  }
}
