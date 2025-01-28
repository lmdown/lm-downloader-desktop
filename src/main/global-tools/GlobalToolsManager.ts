import ConfigManager from "../ConfigManager";
import DownloadUtil from "../util/DownloadUtil";
import path from 'path'
import fs from 'fs'
import OSUtil from "../util/OSUtil";
import GithubUrlUtil from "../util/GithubUrlUtil";
import { exec } from 'child_process';

export default class GlobalToolsManager {

  constructor() {

  }
  static instance;

  static getInstance(): GlobalToolsManager {
      if (!GlobalToolsManager.instance) {
        GlobalToolsManager.instance = new GlobalToolsManager();
      }
      return GlobalToolsManager.instance;
  }

  async install() {
    if(OSUtil.isWindows()) {
      await this.installToolsForWindows()
    }
  }

  async installToolsForWindows() {
    console.log('installToolsForWindows')

    const baseConfig = ConfigManager.getInstance().getBaseConfig()
    // for windows, download 7z console executable and portable git
    const appGlobalToolsDir = baseConfig.LMD_SCRIPTS_DIR + "/global-tools"
    const unzipToolDir = path.join(appGlobalToolsDir, '/7z')
    const installer7zUrl = 'https://www.7-zip.org/a/7zr.exe'
    fs.mkdirSync(unzipToolDir, {recursive: true})
    const sevenZExec = path.join(unzipToolDir, '7zr.exe')
    await DownloadUtil.download(installer7zUrl, sevenZExec)


    const gitInstallerFileName = 'PortableGit-2.47.1.2-64-bit.7z.exe'
    const installerGitUrl = GithubUrlUtil.addProxy(`https://github.com/git-for-windows/git/releases/download/v2.47.1.windows.2/${gitInstallerFileName}`)
    const gitDir = path.join(appGlobalToolsDir, '/git')
    fs.mkdirSync(gitDir, {recursive: true})
    const gitInstallerFilePath = path.join(gitDir, gitInstallerFileName)
    await DownloadUtil.download(installerGitUrl, gitInstallerFilePath)

    // use 7z to uncompress portable git.
    const portableGitDir = path.join(appGlobalToolsDir, '/git')
    const command = `${sevenZExec} x ${gitInstallerFilePath} -o ${portableGitDir} -y`
    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error: `, stderr);
            return;
        }
        console.log(`git install done: ${gitDir}`);
        console.log(stdout);
    });

    // const unzipToolPath = unzipToolExec

  }

}
