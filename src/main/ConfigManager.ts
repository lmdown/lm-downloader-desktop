import { IpcMain, app, ipcMain } from "electron";
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

    init() {
      this.checkAndInit()
      this.initHandlers()
    }

    initHandlers() {
      ipcMain.handle(IPCHandleName.GET_BASE_CONFIG, (_) => {
        return this.getBaseConfig()
      })

      ipcMain.handle(IPCHandleName.GET_DEFAULT_ROOT_DIR, (_) => {
        const configAndDir = ConfigPathUtil.getRootDir()
        return configAndDir.rootDir
      })

      ipcMain.handle(IPCHandleName.GET_DEFAULT_CONFIG_AND_ROOT_DIR, (_) => {
        const configAndDir = ConfigPathUtil.getRootDir()
        return configAndDir
      })

      ipcMain.handle(IPCHandleName.SAVE_BASE_CONFIG, (_, configData) => {
        configData = typeof configData === 'object' ? configData : JSON.parse(configData)
        const parsedConfigData: LMDBaseConfig = configData
        const configFilePath = this.ensureConfigFileExist(parsedConfigData.LMD_DATA_ROOT, parsedConfigData.LMD_LOCALE)
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

    checkAndInit() {
      const configFilePath = this.ensureConfigFileExist()
      EnvUtil.checkConfigKV(configFilePath)
      const envFilePath = this.ensureEnvFileExist()
      EnvUtil.checkEnvVarsKV(envFilePath)
    }

    ensureConfigFileExist(newRootVal: string = '', locale: string = '') {
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
        EnvUtil.writeEnvFile(configFilePath, tempConfigCloned)
      }
      return configFilePath;
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
        fs.mkdirSync(dirPath);
      }
    }

}
