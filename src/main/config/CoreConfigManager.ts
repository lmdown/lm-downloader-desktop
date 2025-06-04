import fs from 'fs';
import path from 'path';
import { app } from 'electron';

export class CoreConfigManager {
  private readonly configPath: string;

  constructor(fileName: string = 'config.json') {
    this.configPath = path.join(app.getPath('userData'), fileName);
    console.log('CoreConfigManager this.configPath', this.configPath)
  }

  static ROOT_DIR_KEY = 'lmd_data_root_dir'

  static instance;

  static getInstance(): CoreConfigManager {
    if (!CoreConfigManager.instance) {
      CoreConfigManager.instance = new CoreConfigManager();
    }
    return CoreConfigManager.instance;
  }

  public getRootDir() {
    return this.get(CoreConfigManager.ROOT_DIR_KEY, '')
  }

  public saveRootDir(value) {
    return this.set(CoreConfigManager.ROOT_DIR_KEY, value)
  }

  /**
   *
   * @param key
   * @param defaultValue
   */
  public get<T>(key: string, defaultValue: T): T {
    try {
      if (!fs.existsSync(this.configPath)) {
        return defaultValue;
      }

      const rawData = fs.readFileSync(this.configPath, 'utf-8');
      const config = JSON.parse(rawData);

      if (config && typeof config === 'object' && key in config) {
        return config[key];
      }

      return defaultValue;
    } catch (error) {
      console.error(`[CoreConfigManager] read "${key}" error:`, error);
      return defaultValue;
    }
  }

  /**
   *
   * @param key
   * @param value
   */
  public set<T>(key: string, value: T): boolean {
    try {
      let config: Record<string, any> = {};

      if (fs.existsSync(this.configPath)) {
        const rawData = fs.readFileSync(this.configPath, 'utf-8');
        try {
          config = JSON.parse(rawData);
        } catch (parseError) {
          console.warn(`[CoreConfigManager] config file is broken. rebuild it.`);
        }
      }

      config[key] = value;

      const dir = path.dirname(this.configPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      fs.writeFileSync(this.configPath, JSON.stringify(config, null, 2), 'utf-8');
      return true;
    } catch (error) {
      console.error(`[CoreConfigManager] write "${key}" error:`, error);
      return false;
    }
  }

}
