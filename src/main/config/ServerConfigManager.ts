import { ServerEnv } from "../../types/server/ServerEnv";
import ConfigManager from "../ConfigManager";
import path from 'path'
import fs from 'fs'
import * as dotenv from 'dotenv';

export default class ServerConfigManager {

  static instance;

  static getInstance(): ServerConfigManager {
    if (!ServerConfigManager.instance) {
      ServerConfigManager.instance = new ServerConfigManager();
    }
    return ServerConfigManager.instance;
  }

  getServerConfig(serverDir: string = ''): ServerEnv {
    if(!serverDir) {
      serverDir = ConfigManager.getInstance().getServerDir()
    }
    const envFilePath = path.join(serverDir, '.env')
    const data = fs.readFileSync(envFilePath, {encoding:'utf8', flag:'r'});
    const serverConfig: ServerEnv = dotenv.parse(data) as any as ServerEnv
    return serverConfig
  }

  // getServerPort(serverDir: string): string {
  //   const config = this.getServerConfig(serverDir)
  //   return config.PORT
  // }

}


