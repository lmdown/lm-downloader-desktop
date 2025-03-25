import { exec } from 'child_process'
import ConfigManager from '../ConfigManager'
import path from 'path'
import fs, { lstat } from 'fs'
import os from 'os'
import appPackage from '../../../package.json'
import UpdateIndexData from './UpdateIndexData'
import {compareVersions} from 'compare-versions';
import { EnvUtil } from '../util/EnvUtil'
import UncompressUtil from '../util/UncompressUtil'
import DownloadUtil from '../util/DownloadUtil'
import { app, dialog, shell } from 'electron'
import LocaleManager from '../locales/LocaleManager'
import { LMDAppStoryConfig } from '../../constant/LMDAppStoryConfig'
import { fetchJsonWithRetry } from '../../api/fetch-with-retry'

export default class LMDScriptUpdater {

  private _configMgr:ConfigManager = ConfigManager.getInstance()

  constructor() {
  }

  async update() {
    return await this.getFiles()
  }

  async fetchAppStoryFiles(): Promise<boolean> {
    const updateStoryMethod = process.env.UPDATE_STORY_METHOD || 'http'
    const baseConfig = this._configMgr.getBaseConfig()
    const appStoryPath = baseConfig.LMD_APP_STORY_DIR
    const scriptsDir = baseConfig.LMD_SCRIPTS_DIR
    const appStoryGit = baseConfig.LMD_APP_STORY_GIT

    if(updateStoryMethod === 'http') {
      console.log('http download app story zip', appStoryGit)
      return await this.httpDownloadAppStory(appStoryGit, scriptsDir, appStoryPath)
    } else {
      console.log('clone app story repo ', appStoryGit)
      return await this.cloneRepository(appStoryGit, appStoryPath);
    }
  }

  async httpDownloadAppStory(appStoryGit: string, scriptsDir: string, appStoryPath: string): Promise<boolean> {
    try {
      // appStoryPackageZipUrl,
      // get remote update config index
      const jsonData: UpdateIndexData = await fetchJsonWithRetry(LMDAppStoryConfig.UPDATE_CONFIG_URL, {
        retries: 5
      });
      const appStoryVersion = jsonData.version || '0'
      const storyTempDownloadDir = `${scriptsDir}/${appStoryVersion}`
      const packFileName = jsonData?.story_packages?.main_pack_file_name || LMDAppStoryConfig.MASTER_ZIP_FILE_NAME
      const storyTempDownloadFilePath = `${storyTempDownloadDir}/${packFileName}`

      if (!fs.existsSync(storyTempDownloadDir)) {
        fs.mkdirSync(storyTempDownloadDir);
      }

      const isEqual = this.compareLocalAppStoryVersion(appStoryPath, appStoryVersion)

      if(!isEqual) {
        // Download to LMD_SCRIPTS_DIR. At first we should create version dir.
        const appStoryPackageZipPrefix = jsonData?.story_packages?.main_pack_prefix || LMDAppStoryConfig.LMD_APP_STORY_GIT_PREFIX
        const appStoryPackageZipUrl = appStoryPackageZipPrefix + LMDAppStoryConfig.MASTER_ZIP_FILE_NAME

        const storyDirAfterUnzip = `${scriptsDir}/${LMDAppStoryConfig.LMD_APP_STORY_GIT_MASTER_DIR}`
        const storyDir = `${scriptsDir}/${LMDAppStoryConfig.LMD_APP_STORY_DIR_NAME}`
        await DownloadUtil.download(appStoryPackageZipUrl, storyTempDownloadFilePath, false)
        await UncompressUtil.checkAndUnzip(storyTempDownloadFilePath, scriptsDir)

        if(storyDir.includes('scripts/lm-downloader-app-story')) {
          this.moveFile(`${appStoryPath}/server/node_modules`, `${storyDirAfterUnzip}/server/node_modules`)
          const moduleFileName = this.getNodeModuleFileName()
          this.moveFile(`${appStoryPath}/server/${moduleFileName}`, `${storyDirAfterUnzip}/server/${moduleFileName}`)
          fs.rmSync(storyDir, {recursive: true})
          this.moveFile(storyDirAfterUnzip, storyDir);
        }

        fs.rmSync(storyTempDownloadDir, {recursive: true})
      }
      return true
    } catch (err) {
      console.error('DownloadAppStory err', err)
      return false
    }
  }

  getNodeModuleFileName() {
    const name = 'server_node_modules_${OS}_${ARCH}.zip'
    let result = name.replace('${OS}', this.getOSStr())
    result = result.replace('${ARCH}', os.arch())
    return result
  }

  moveFile(fromPath: string, toPath: string) {
    if(fs.existsSync(fromPath)) {
      fs.renameSync(fromPath, toPath);
    } else {
      console.warn(fromPath+' dose not exist. can not move')
    }
  }

  compareLocalAppStoryVersion(appStoryPath: string ,remoteVersion: string): boolean {
    let updateIndexData: UpdateIndexData = {} as UpdateIndexData
    let compareResult = false
    const indexFilePath = path.join(appStoryPath, LMDAppStoryConfig.UPDATE_CONFIG_FILE_NAME)
    if (!fs.existsSync(indexFilePath)) {
      console.error(indexFilePath + ' dose not exist')
    } else {
      try {
        updateIndexData = JSON.parse(fs.readFileSync(indexFilePath, {encoding:'utf8', flag:'r'}));
        const localAppStoryVersion = updateIndexData.version
        if (localAppStoryVersion === remoteVersion) {
          compareResult = true
        }
      } catch(err) {
        console.error('parse error', err)
      }
    }
    return compareResult
  }

  cloneRepository(repoUrl, localPath): Promise<boolean> {
    return new Promise ((resolve, reject) => {
      exec(`git clone --depth=1 ${repoUrl} ${localPath}`, (error, stdout, stderr) => {
        if (error) {
          console.error(`error: ${stderr}`);
        } else {
          console.log(`clone result: ${stdout}`);
        }
        this.pullLatestChanges(localPath).then(pullResult => {
          resolve(pullResult)
        });
      });
    })

  }

  pullLatestChanges(localPath): Promise<boolean> {
    return new Promise ((resolve, reject) => {
      const pullCommand = 'git fetch origin master --depth=1 && git reset --hard origin/master'
      console.log("pullCommand:", pullCommand)
      exec(pullCommand, { cwd: localPath }, (error, stdout, stderr) => {
        let pullResult: boolean = false
          if (error) {
              console.error(`error: `, error);
              console.error(`stderr: ${stderr}`);
              // return;
          } else {
            console.log(`pull output: ${stdout}`);
            pullResult = true
          }
          resolve(pullResult)
      });
    })
  }


  async getFiles() {
    // return this.cloneRepository(appStoryGit, appStoryPath)
    const baseConfig = this._configMgr.getBaseConfig()
    const appStoryPath = baseConfig.LMD_APP_STORY_DIR
    return this.fetchAppStoryFiles()
    .then((cloneAndPullResult) => {
      console.log('cloneAndPullResult: ', cloneAndPullResult)
      const checkResult = this.checkDesktopVersion(appStoryPath)
      return checkResult
    })
    .then(async (checkResult) => {
      const { versionMatch, updateIndexData, currentVersion } = checkResult
      const minVersion = updateIndexData.desktop_app.min_version
      if(versionMatch) {
        const depencencies =  updateIndexData.server.depencencies
        const serverPath =  updateIndexData.server.path
        const appStoryEnvPath = path.join(appStoryPath, 'env')
        const { MODULES_PREFIX } = EnvUtil.getEnvFile(appStoryEnvPath)
        for(const index in depencencies) {
          const fullServerDir = path.join(appStoryPath, serverPath)
          let dep = depencencies[index]
          dep = dep.replace('${OS}', this.getOSStr())
          dep = dep.replace('${ARCH}', os.arch())
          const depUrl = dep.replace('${MODULES_PREFIX}', MODULES_PREFIX)
          const depLocalFilePath = dep.replace('${MODULES_PREFIX}', fullServerDir)
          let needUncompress = false
          if(!fs.existsSync(depLocalFilePath)) {
            await DownloadUtil.download(depUrl, depLocalFilePath)
            needUncompress = true
            console.log('download finished')
          }
          if(!fs.existsSync(path.join(fullServerDir, 'node_modules'))) {
            needUncompress = true
            console.log('node_modules dose not exist')
          }
          if(needUncompress) {
            console.log('start unzip')
            await UncompressUtil.checkAndUnzip(depLocalFilePath, fullServerDir)
          } else {
            console.log('skip unzip')
          }
        }
      } else {
        this.showForceUpdateDialog(currentVersion, minVersion)
      }
    })
  }

  getOSStr() {
    // `'Linux'` on Linux, `'Darwin'` on macOS, and `'Windows_NT'` on Windows.
    const osType = os.type()
    // convert to linux, mac and windows
    const osTypeMap = {
      Linux: 'linux',
      Darwin: 'mac',
      Windows_NT: 'windows'
    }
    return osTypeMap[osType]
  }

  showForceUpdateDialog(currentVersion: string, minVersion: string) {
    const i18n = LocaleManager.getInstance().i18nInstance
    let outOfDateFullTip = i18n.t('Update.OutOfDate')
    const requiredVersionLabel = i18n.t('Update.RequiredVersion')
    const yourVersionLabel = i18n.t('Update.YourVersion')
    outOfDateFullTip = `${outOfDateFullTip}\n${requiredVersionLabel}${minVersion}\n${yourVersionLabel}${currentVersion}`

    dialog.showMessageBox({
      type: 'info',
      title: i18n.t('Update.DialogTitle'),
      message: outOfDateFullTip,
      buttons: [i18n.t('Update.Download'), i18n.t('Update.Close')],   //确认idx为0，取消为1
      cancelId: 1, //这个的值是如果直接把提示框×掉返回的值，这里设置成和“取消”按钮一样的值，下面的idx也会是1
    }).then(idx => {
      if (idx.response == 0) {
        shell.openExternal('https://daiyl.com')
      }
      app.quit()
    })
  }

  checkDesktopVersion(appStoryPath: string) {
    let versionMatch = false
    let updateIndexData: UpdateIndexData = {} as UpdateIndexData
    const indexFilePath = path.join(appStoryPath, LMDAppStoryConfig.UPDATE_CONFIG_FILE_NAME)
    let currentVersion = ''
    if (!fs.existsSync(indexFilePath)) {
      console.error(indexFilePath + ' dose not exist')
    } else {
      try {
        updateIndexData = JSON.parse(fs.readFileSync(indexFilePath, {encoding:'utf8', flag:'r'}));
        const minVersion = updateIndexData.desktop_app.min_version
        currentVersion = appPackage.version
        if (compareVersions(currentVersion, minVersion) !== -1) {
          versionMatch = true
        } else {
          versionMatch = false
        }
      } catch(err) {
        console.error('parse error', err)
      }
    }
    return {versionMatch, updateIndexData, currentVersion}
  }

}
