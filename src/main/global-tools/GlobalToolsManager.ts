import ConfigManager from "../ConfigManager";
import DownloadUtil from "../util/DownloadUtil";
import path from 'path'
import fs from 'fs'
import OSUtil from "../util/OSUtil";
import GithubUrlUtil from "../util/GithubUrlUtil";
import { execSync } from 'child_process';
import { checkGitFilesExist, getGitInstallDir } from "./GitCheck";
import LMDBaseConfig from "../../types/LMDBaseConfig";
import LMDGlobalEnv from "../../types/LMDGlobalEnv";
import FileUtil from "../util/FileUtil";
import { ipcMain } from "electron";
import { IPCHandleName } from "../../constant/IPCHandleName";

export default class GlobalToolsManager {

  constructor() {

  }
  static instance;

  private appGlobalToolsDir: string = ''
  private sevenZExec: string = ''
  private currentBaseConfig: LMDBaseConfig | null = null
  private globalEnv: LMDGlobalEnv | null = null

  static getInstance(): GlobalToolsManager {
      if (!GlobalToolsManager.instance) {
        GlobalToolsManager.instance = new GlobalToolsManager();
      }
      return GlobalToolsManager.instance;
  }

  init() {
    ipcMain.handle(IPCHandleName.CHECK_GIT, async (_) => {
      return await this.checkGit(false)
    });

    ipcMain.handle(IPCHandleName.INSTALL_GIT, async (_) => {
      return await this.checkGit(true)
    });
  }

  async checkGit(installGit: boolean): Promise<boolean>  {
    let checkResult = false
    if(OSUtil.isWindows()) {
      const configMgr = ConfigManager.getInstance()
      this.currentBaseConfig = configMgr.getBaseConfig()
      this.globalEnv = configMgr.getENVVariables()
      const defaultGitInstallPath = configMgr.getDefaultGitInstallPath()
      if(this.globalEnv?.GIT_INSTALL_PATH) {
        checkResult = checkGitFilesExist(this.globalEnv.GIT_INSTALL_PATH)
        console.log('GitFilesExist with env ', checkResult)
        if(!checkResult) {
          checkResult = checkGitFilesExist(defaultGitInstallPath)
          console.log('GitFilesExist with defaultGitInstallPath ', checkResult)
          if(checkResult) {
            configMgr.updateEnvGitInstallPath(defaultGitInstallPath)
          }
        }
      }

      if(!checkResult) {
        const gitInstallDir = getGitInstallDir()
        if(gitInstallDir) {
          configMgr.updateEnvGitInstallPath(gitInstallDir)
          checkResult = true
        } else if(installGit) {
          await this.installToolsForWindows()
          configMgr.updateEnvGitInstallPath(defaultGitInstallPath)
          checkResult = true
        }
      }
      if(checkResult){
        this.addToOSUserPath()
      }
    } else {
      // TODO: mac install git
      if(installGit) {
        // await this.sleep(2000)
        checkResult = true
      } else {
        checkResult = false
      }
    }
    return checkResult
  }

  // sleep(ms: number): Promise<void> {
  //   return new Promise((resolve) => {
  //       setTimeout(resolve, ms);
  //   });
  // };


  addToOSUserPath() {
    const configMgr = ConfigManager.getInstance()
    //再读取git安装路径，存到path中
    this.globalEnv = configMgr.getENVVariables()
    const finalGitInstallDir = this.globalEnv.GIT_INSTALL_PATH + '/bin'
    console.log('finalGitInstallDir', finalGitInstallDir)

    let currentPath = process.env.PATH || '';

    // 检查新路径是否已经存在，避免重复添加
    if (!currentPath.includes(finalGitInstallDir)) {
      // 在 Windows 和其他操作系统中，路径分隔符不同
      // 使用 process.platform 判断系统类型
      if (OSUtil.isWindows()) {
        // Windows 使用 ";"
        process.env.PATH = `${currentPath};${finalGitInstallDir}`;
      } else {
        // 其他系统（如 Linux、macOS）使用 ":"
        process.env.PATH = `${currentPath}:${finalGitInstallDir}`;
      }
      console.log('added to PATH');
    } else {
      console.log('git dir exist');
    }
  }

  async installToolsForWindows(): Promise<void> {
    console.log('installToolsForWindows')
    this.appGlobalToolsDir = this.currentBaseConfig?.GLOBAL_TOOLS_DIR || ''
    if(!this.appGlobalToolsDir) {
      console.error('GLOBAL_TOOLS_DIR value is not correct: ', this.appGlobalToolsDir)
      return
    }
    await this.install7z()
    await this.installGit()
  }

  async install7z() {
    // for windows, download 7z console executable and portable git

    const unzipToolDir = path.join(this.appGlobalToolsDir, '/7z')
    const installer7zUrl = 'https://www.7-zip.org/a/7zr.exe'
    fs.mkdirSync(unzipToolDir, {recursive: true})
    this.sevenZExec = path.join(unzipToolDir, '7zr.exe')
    FileUtil.removeFile(this.sevenZExec)
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
    FileUtil.removeFile(gitInstallerFilePath)
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
