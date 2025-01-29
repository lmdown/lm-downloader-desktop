import ConfigManager from "../ConfigManager";
import DownloadUtil from "../util/DownloadUtil";
import path from 'path'
import fs from 'fs'
import OSUtil from "../util/OSUtil";
import GithubUrlUtil from "../util/GithubUrlUtil";
import { exec, execSync } from 'child_process';
import { checkGitFilesExist } from "./GitCheck";
import { DEFAULT_LMD_BASE_CONFIG } from "../../template/base_config_template";
import ReplaceUtil from "../util/ReplaceUtil";

export default class GlobalToolsManager {

  constructor() {

  }
  static instance;

  private appGlobalToolsDir: string = ''
  private sevenZExec: string = ''

  static getInstance(): GlobalToolsManager {
      if (!GlobalToolsManager.instance) {
        GlobalToolsManager.instance = new GlobalToolsManager();
      }
      return GlobalToolsManager.instance;
  }

  async install() {
    if(OSUtil.isWindows()) {
      const result = await this.checkGitAvailable();
      console.log('git是否可用', result)
      if(!result) {
        await this.installToolsForWindows()
      }
    }
  }
  async checkGitAvailable(): boolean {

  }

  async installToolsForWindows() {
    console.log('installToolsForWindows')
    const baseConfig = ConfigManager.getInstance().getBaseConfig()

    this.appGlobalToolsDir = baseConfig.GLOBAL_TOOLS_DIR
    // baseConfig.LMD_SCRIPTS_DIR + "/global-tools"
    baseConfig.GIT_INSTALL_PATH
    const gitFilesExist = checkGitFilesExist(this.appGlobalToolsDir)
    if (!gitFilesExist) {
      await this.install7z()
      await this.installGit()
    }
  }

  async install7z() {
    // for windows, download 7z console executable and portable git

    const unzipToolDir = path.join(this.appGlobalToolsDir, '/7z')
    const installer7zUrl = 'https://www.7-zip.org/a/7zr.exe'
    fs.mkdirSync(unzipToolDir, {recursive: true})
    this.sevenZExec = path.join(unzipToolDir, '7zr.exe')
    await DownloadUtil.download(installer7zUrl, this.sevenZExec)
    console.log('7z download ok. ', installer7zUrl)
  }

  async installGit() {
    const gitInstallerFileName = 'PortableGit-2.47.1.2-64-bit.7z.exe'
    const installerGitUrl = await GithubUrlUtil.addProxy(
      `https://github.com/git-for-windows/git/releases/download/v2.47.1.windows.2/${gitInstallerFileName}`
    )
    const gitDir = path.join(this.appGlobalToolsDir, '/git')
    fs.mkdirSync(gitDir, {recursive: true})
    const gitInstallerFilePath = path.join(gitDir, gitInstallerFileName)
    console.log('installerGitUrl', installerGitUrl)
    await DownloadUtil.download(installerGitUrl, gitInstallerFilePath)

    // use 7z to extract portable git.
    const portableGitDir = path.join(gitDir, '/portable')
    const command = `${this.sevenZExec} x ${gitInstallerFilePath} -o${portableGitDir} -y`
    console.log('extract portable git command: ', command)
    try {
      const stdout = execSync(command);
      console.log(`extract portable git done ${stdout.toString()}`)
    } catch (error) {
      console.error('extract portable git err', error);
    }
  }

}
