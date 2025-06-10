import { ipcMain } from "electron";
import * as path from 'path';
import * as fs from 'fs';
import { IPCHandleName } from "../constant/IPCHandleName";
import LMDGlobalEnv from "../types/LMDGlobalEnv";
import { EnvUtil } from "./util/EnvUtil";
import { DEFAULT_GLOBAL_ENV } from "../template/global_vars_template";
import ConfigPathUtil from "./util/ConfigPathUtil";
import ReplaceUtil from "./util/ReplaceUtil";
import LocaleUtil from "./util/LocaleUtil";
import LMDBaseConfig from "../types/LMDBaseConfig";
import GithubUrlUtil from "./util/GithubUrlUtil";
import LMDBaseConfigAndRootDir from "../types/LMDBaseConfigAndRootDir";
import { session } from 'electron';
import { CoreConfigManager } from "./config/CoreConfigManager";

export default class ConfigManager {

    CONFIG_FILE_NAME: string = 'lmd_base_config.env';
    GLOBAL_ENV_FILE_NAME: string = 'lmd_global_variables.env';

    static instance;

    static getInstance(): ConfigManager {
        if (!ConfigManager.instance) {
          ConfigManager.instance = new ConfigManager();
        }
        return ConfigManager.instance;
    }

    async init(): Promise<void> {
      await this.checkAndInit()
      this.initHandlers()
    }

    initHandlers() {
      ipcMain.handle(IPCHandleName.GET_BASE_CONFIG, (_) => {
        return this.getBaseConfig()
      })

      ipcMain.handle(IPCHandleName.GET_DEFAULT_ROOT_DIR, (_) => {
        return this.getDefaultRootDir()
      })

      ipcMain.handle(IPCHandleName.GET_DEFAULT_CONFIG_AND_ROOT_DIR, (_) => {
        return this.getDefaultConfigAndRootDir()
        // const configAndDir = ConfigPathUtil.getRootDir()
        // return configAndDir
      })

      ipcMain.handle(IPCHandleName.SAVE_BASE_CONFIG, (_, configData) => {
        configData = typeof configData === 'object' ? configData : JSON.parse(configData)
        const parsedConfigData: LMDBaseConfig = configData

        const oldConfig = this.getBaseConfig()
        let ignoreSaveError = false
        if(oldConfig.LMD_DATA_ROOT !== parsedConfigData.LMD_DATA_ROOT) {
          ignoreSaveError = true
        }
        const configFilePath = this.ensureConfigFileExist(
          parsedConfigData.LMD_DATA_ROOT, parsedConfigData.LMD_LOCALE, ignoreSaveError)
        // return this.saveBaseConfigData(configFilePath, configData);
        // return EnvUtil.writeEnvFile(configFilePath, configData)
      })
      ipcMain.handle(IPCHandleName.GET_ENV_VARIABLES, (_) => {
        return this.getENVVariables()
      })
      ipcMain.handle(IPCHandleName.SAVE_ENV_VARIABLES, (_, globalEnvVars) => {
        this.saveENVVariables(globalEnvVars)
      })
    }

    saveENVVariables(globalEnvVars) {
      const envFilePath = this.ensureEnvFileExist()
      globalEnvVars = typeof globalEnvVars === 'object' ? globalEnvVars : JSON.parse(globalEnvVars)
      return EnvUtil.writeEnvFile(envFilePath, globalEnvVars)
    }

    getDefaultGitInstallPath(): string {
      const defaultGlobalEnv: LMDGlobalEnv = DEFAULT_GLOBAL_ENV;
      const {rootDir} = ConfigPathUtil.getRootDir()
      ReplaceUtil.replaceVars(defaultGlobalEnv, '${LMD_DATA_ROOT}', rootDir);
      return defaultGlobalEnv.GIT_INSTALL_PATH
    }

    getDefaultRootDir(): string {
      const configAndDir = ConfigPathUtil.getDefaultRoot()
      // const configAndDir = ConfigPathUtil.getRootDir()
      return configAndDir.rootDir
    }

    getDefaultConfigAndRootDir(): LMDBaseConfigAndRootDir {
      const configAndDir = ConfigPathUtil.getDefaultRoot()
      // const configAndDir = ConfigPathUtil.getRootDir()
      return configAndDir
    }

    updateEnvGitInstallPath(value: string) {
      this.updateEnvVarsKV('GIT_INSTALL_PATH', value)
    }

    updateEnvVarsKV(key: string, value: string) {
      const lmdGlobalEnv: LMDGlobalEnv = this.getENVVariables()
      lmdGlobalEnv[key] = value
      this.saveENVVariables(lmdGlobalEnv)
    }

    getENVVariables(): LMDGlobalEnv {
      const envFilePath = this.ensureEnvFileExist()
      return EnvUtil.getEnvFile(envFilePath) as unknown as LMDGlobalEnv
    }

    getBaseConfig(): LMDBaseConfig {
      const configFilePath = this.ensureConfigFileExist()
      return EnvUtil.getEnvFile(configFilePath) as unknown as LMDBaseConfig
    }

    async checkAndInit () {
      const configFilePath = this.ensureConfigFileExist()
      EnvUtil.checkConfigKV(configFilePath)
      // check github prefix
      const envFilePath = this.ensureEnvFileExist()
      this.checkGithubPrefix().then((githubPrefix: string) => {
        this.updateENVVariables(githubPrefix || '')
      })
      EnvUtil.checkEnvVarsKV(envFilePath)
      this.initUA()
    }

    async checkGithubPrefix() {
      const latestGithubPrefix = await GithubUrlUtil.chooseGithubPrefix()
      return latestGithubPrefix
    }

    async updateENVVariables(githubPrefix: string) {
      const envVars = this.getENVVariables()
      envVars.GITHUB_PROXY = githubPrefix
      this.saveENVVariables(envVars)
    }

    initUA() {
      session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
        let userAgent = details.requestHeaders['User-Agent'];
        if (userAgent) {
          userAgent = userAgent.replace(/Electron\/\d+\.\d+\.\d+/, '').replace(/lm-downloader\/[\d.]+/, '').trim();
        }
        details.requestHeaders['User-Agent'] = userAgent;
        callback({ cancel: false, requestHeaders: details.requestHeaders });
      });
    }

    ensureConfigFileExist(newRootVal: string = '', locale: string = '', ignoreSaveError: boolean = false) {
      const {rootDir, tempConfig} = ConfigPathUtil.getRootDir()
      const tempConfigCloned = Object.assign({}, tempConfig)
      const configFilePath = path.join(rootDir, this.CONFIG_FILE_NAME);
      // 检查默认目录是否存在，不存在就创建
      this.ensureDirectoryExistence(rootDir);
      if (!fs.existsSync(configFilePath) || newRootVal) {
        tempConfigCloned.LMD_LOCALE = LocaleUtil.getDefaultLocale()
        // 如果配置文件不存在，则创建一个新的配置文件，并写入默认配置
        tempConfigCloned.LMD_DATA_ROOT = newRootVal || rootDir
        if(locale) {
          tempConfigCloned.LMD_LOCALE = locale
        }
        ReplaceUtil.replaceVars(tempConfigCloned, '${LMD_DATA_ROOT}', tempConfigCloned.LMD_DATA_ROOT);
        try {
          EnvUtil.writeEnvFile(configFilePath, tempConfigCloned)
        } catch (err) {
          console.log('newRootVal', newRootVal)
          if(ignoreSaveError) {
            console.error("ignore this error. go ahead.", err)
          } else {
            throw err
          }
        }
        this.saveRootDirToCoreConfig(tempConfigCloned.LMD_DATA_ROOT)
      }
      return configFilePath;
    }

    saveRootDirToCoreConfig(rootDir) {
      const coreConfigManager = CoreConfigManager.getInstance()
      const result = coreConfigManager.saveRootDir(rootDir)
      // console.log('setRootDir ', rootDir, ' result ', result)
    }

    ensureEnvFileExist() {
      const {rootDir} = ConfigPathUtil.getRootDir()
      const globalEnvFilePath = path.join(rootDir, this.GLOBAL_ENV_FILE_NAME);
      // 检查默认目录是否存在，不存在就创建
      this.ensureDirectoryExistence(rootDir);

      if (!fs.existsSync(globalEnvFilePath)) {
        // 如果ENV文件不存在，则创建一个新的文件，并写入默认
        const defaultGlobalEnv: LMDGlobalEnv = DEFAULT_GLOBAL_ENV;
        ReplaceUtil.replaceVars(defaultGlobalEnv, '${LMD_DATA_ROOT}', rootDir);
        EnvUtil.writeEnvFile(globalEnvFilePath, defaultGlobalEnv)
      }
      return globalEnvFilePath;
    }

    ensureDirectoryExistence(dirPath) {
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath,{recursive: true});
      }
    }

    getServerDir() {
      const baseConfig = this.getBaseConfig()
      return path.join(baseConfig.LMD_APP_STORY_DIR, 'server')
    }

}
