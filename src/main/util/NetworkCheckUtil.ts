import inGFW from 'in-gfw'

export default class NetworkCheckUtil {

  static isGithubAvailable() {
    const githubAvailable = !inGFW.netSync('https://github.com/', 'https://gh.llkk.cc/')
    const googleAvailable = !inGFW.netSync('https://www.google.com/', 'https://www.google.cn/')
    // if github and google are both available, return true.
    if(githubAvailable && googleAvailable) {
      return true
    } else {
      return false
    }
  }

}
