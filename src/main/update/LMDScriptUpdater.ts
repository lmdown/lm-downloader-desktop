import { exec } from 'child_process'
import ConfigManager from '../ConfigManager'
import path from 'path'
import fs from 'fs'
import os from 'os'
import appPackage from '../../../package.json'
import UpdateIndexData from './UpdateIndexData'
import {compareVersions} from 'compare-versions';
import { EnvUtil } from '../util/EnvUtil'
import UncompressUtil from '../util/UncompressUtil'
import DownloadUtil from '../util/DownloadUtil'
import { app, dialog, shell } from 'electron'
import LocaleManager from '../locales/LocaleManager'

export default class LMDScriptUpdater {

  private _configMgr:ConfigManager = ConfigManager.getInstance()

  constructor() {

  }

  async update() {
    await this.getFiles()
    console.log('getFile process finished.')
    // this.checkDesktopVersion() // 检查当前桌面App是否与脚本兼容。如果不兼容，要显示弹窗，要求用户强制下载新版本
  }

  cloneRepository(repoUrl, localPath) {
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

  pullLatestChanges(localPath) {
    return new Promise ((resolve, reject) => {
      exec('git reset --hard origin/master && git pull --depth=1 --force --no-rebase', { cwd: localPath }, (error, stdout, stderr) => {
        let pullResult = false
          if (error) {
              console.error(`error: ${stderr}`);
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
    // git clone and git pull
    const baseConfig = this._configMgr.getBaseConfig()
    const appStoryPath = baseConfig.LMD_APP_STORY_DIR
    const appStoryGit = baseConfig.LMD_APP_STORY_GIT
    console.log('clone app story repo ', appStoryGit)
    return this.cloneRepository(appStoryGit, appStoryPath)
    .then((cloneAndPullResult) => {
      console.log('cloneAndPullResult: ', cloneAndPullResult)
      const checkResult = this.checkDesktopVersion(appStoryPath)
      return checkResult
    })
    .then(async (checkResult) => {
      const { versionMatch, updateIndexData } = checkResult
      if(versionMatch) {
        const depencencies =  updateIndexData.server.depencencies
        const serverPath =  updateIndexData.server.path
        const appStoryEnvPath = path.join(appStoryPath, 'env')
        const { MODULES_PREFIX } = EnvUtil.getEnvFile(appStoryEnvPath)
        for(const index in depencencies) {
          const fullServerDir = path.join(appStoryPath, serverPath)
          let dept = depencencies[index]
          dept = dept.replace('${ARCH}', os.arch())
          const depUrl = dept.replace('${MODULES_PREFIX}', MODULES_PREFIX)
          const depLocalFilePath = dept.replace('${MODULES_PREFIX}', fullServerDir)
          let needUncompress = false
          if(!fs.existsSync(depLocalFilePath)) {
            await DownloadUtil.download(depUrl, depLocalFilePath)
            needUncompress = true
            console.log('download finished.')
          }
          if(!fs.existsSync(path.join(fullServerDir, 'node_modules'))) {
            needUncompress = true
            console.log('node_modules dose not exist.')
          }
          if(needUncompress) {
            console.log('start unzip.')
            await UncompressUtil.checkAndUnzip(depLocalFilePath, fullServerDir)
          } else {
            console.log('skip unzip.')
          }
        }
      } else {
        console.log('不满足版本要求，无法更新')
        this.showForceUpdateDialog()
      }
    })
  }

  showForceUpdateDialog() {
    const i18n = LocaleManager.getInstance().i18nInstance
    dialog.showMessageBox({
      type: 'info',
      title: i18n.t('Update.DialogTitle'),
      message:i18n.t('Update.OutOfDate'),
      buttons: [i18n.t('Update.Download'), i18n.t('Update.Close')],   //确认idx为0，取消为1
      cancelId: 1, //这个的值是如果直接把提示框×掉返回的值，这里设置成和“取消”按钮一样的值，下面的idx也会是1
    }).then(idx => {
      if (idx.response == 0) {
        shell.openExternal('https://gitee.com/lmdown/lm-downloader-desktop')
      }
      app.quit()
    })
  }

  checkDesktopVersion(appStoryPath: string) {
    let versionMatch = false
    let updateIndexData: UpdateIndexData = {} as UpdateIndexData
    const indexFilePath = path.join(appStoryPath, 'update_index.json')
    if (!fs.existsSync(indexFilePath)) {
      console.error(indexFilePath + ' dose not exist')
    } else {
      try {
        updateIndexData = JSON.parse(fs.readFileSync(indexFilePath, {encoding:'utf8', flag:'r'}));
        const minVersion = updateIndexData.desktop_app.min_version
        const currentDesktopAppMinVersion = appPackage.version
        if (compareVersions(currentDesktopAppMinVersion, minVersion) !== -1) {
          versionMatch = true
        } else {
          versionMatch = false
        }
      } catch(err) {
        console.error('parse error', err)
      }
    }
    return {versionMatch, updateIndexData}
  }

}
