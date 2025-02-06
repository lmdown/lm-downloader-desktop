import LMDEnv from "../../types/LMDEnv";
import fs from 'fs';
import * as dotenv from 'dotenv';
import { DEFAULT_GLOBAL_ENV } from "../../template/global_vars_template";
import ReplaceUtil from "./ReplaceUtil";
import ConfigPathUtil from "./ConfigPathUtil";
import { DEFAULT_LMD_BASE_CONFIG } from "../../template/base_config_template";
import ConfigManager from "../ConfigManager";

export class EnvUtil {

  static parseEnvValue(value: string | undefined, type: 'string' | 'number' | 'boolean'): string | number | boolean {
    if (value === undefined) {
      throw new Error('Environment variable is not defined');
    }

    switch (type) {
      case 'string':
        return value;
      case 'number':
        const num = parseInt(value, 10);
        if (isNaN(num)) {
          throw new Error('Invalid number format');
        }
        return num;
      case 'boolean':
        return value.toLowerCase() === 'true';
      default:
        throw new Error('Unsupported type');
    }
  }

  static convertToEnvFormat(env: LMDEnv): string {
    const lines: string[] = [];

    for (const [key, value] of Object.entries(env)) {
      let envValue = String(value);

      if (envValue === '') {
        continue;
      }

      if (/[=\s]/.test(envValue)) {
        envValue = `"${envValue}"`;
      }

      lines.push(`${key}=${envValue}`);
    }

    return lines.join('\n');
  }

  static writeEnvFile(filePath: string, env: LMDEnv): void {
    try {
      // console.log('writeEnvFile::: env: ', env)
      const envContent = this.convertToEnvFormat(env);
      fs.writeFileSync(filePath, envContent);
      // console.log('writeEnvFile::: envContent: ', envContent)
      // console.log(`Successfully wrote to ${filePath}`);
    } catch (error) {
      console.error('Error writing to .env file:', error.message);
      throw error;
    }
  }

  static checkConfigKV(filePath: string) {
    // 如果文件存在，也要检查key是否都存在。补充不存在的KV
    const defaultGlobalEnv: LMDEnv = DEFAULT_LMD_BASE_CONFIG;
    const configVars = this.getEnvFile(filePath)
    let isKVAdd = false
    let rootDir

    for(let key in defaultGlobalEnv) {
      if( configVars[key] === undefined ) {
        if(!rootDir) {
          const baseConfig = ConfigManager.getInstance().getBaseConfig()
          rootDir = baseConfig.LMD_DATA_ROOT
        }
        ReplaceUtil.replaceVars(defaultGlobalEnv, '${LMD_DATA_ROOT}', rootDir);
        configVars[key] = defaultGlobalEnv[key]
        isKVAdd = true
      }
    }
    if(isKVAdd) {
      this.writeEnvFile(filePath, configVars as unknown as LMDEnv)
    }
  }

  static checkEnvVarsKV(envFilePath: string) {
    // 如果文件存在，也要检查key是否都存在。补充不存在的KV
    const defaultGlobalEnv: LMDEnv = DEFAULT_GLOBAL_ENV;
    const envVars = this.getEnvFile(envFilePath)
    let isKVAdd = false
    let rootDir

    for(let key in defaultGlobalEnv) {
      if( envVars[key] === undefined ) {
        if(!rootDir) {
          rootDir = ConfigPathUtil.getRootDir().rootDir
        }
        ReplaceUtil.replaceVars(defaultGlobalEnv, '${LMD_DATA_ROOT}', rootDir);
        envVars[key] = defaultGlobalEnv[key]
        isKVAdd = true
      }
    }
    if(isKVAdd) {
      this.writeEnvFile(envFilePath, envVars as unknown as LMDEnv)
    }
  }

  static getEnvFile(filePath: string) {
    const data = fs.readFileSync(filePath, {encoding:'utf8', flag:'r'});
    return dotenv.parse(data)
  }

}
