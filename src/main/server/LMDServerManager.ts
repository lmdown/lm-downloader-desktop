import { fork } from 'child_process';
import path from 'path';
import fs from 'fs';
import ConfigManager from '../ConfigManager';

export default class LMDServerManager {

  private _configMgr:ConfigManager
  constructor(configMgr: ConfigManager) {
    this._configMgr = configMgr
    this.init()
  }

  init() {
    // this.checkNodeModules()
    // 启动 Express 服务器
    const serverDir = this.getServerDir()
    const config = this._configMgr.getBaseConfig()
    const serverFilePath = path.join(serverDir, 'start.js')
    console.log('serverFilePath', serverFilePath)
    let fullEnv = Object.assign({}, config)
    fullEnv = Object.assign(fullEnv, process.env)
    const serverProcess = fork(serverFilePath, {
      cwd: serverDir,
      env: fullEnv
    });
    // 监听子进程的消息
    serverProcess.on('message', (msg) => {
      console.log('Message from server:', msg);
    });

    // 处理子进程的关闭事件
    serverProcess.on('close', (code) => {
      console.log('Server process exited with code:', code);
    });

    process.on('exit', () => {
      const killResult = serverProcess.kill('SIGTERM');
      console.log('killResult', killResult)
    });
  }

  checkNodeModules() {
    const serverDir = this.getServerDir()
    const nodeModulesDir = 'node_modules'
    const serverModulesDir = 'server_modules'
    const nodeModulesFullDir = path.join(serverDir, nodeModulesDir)
    const serverModulesFullDir = path.join(serverDir, serverModulesDir)
    // console.log('serverDir', serverDir)
    // console.log('nodeModulesFullDir', nodeModulesFullDir)
    // console.log('serverModulesFullDir', serverModulesFullDir)
    // console.log(' fs.existsSync(nodeModulesFullDir)', fs.existsSync(nodeModulesFullDir))
    // console.log(' fs.existsSync(serverModulesFullDir)', fs.existsSync(serverModulesFullDir))
    if(!fs.existsSync(nodeModulesFullDir) && fs.existsSync(serverModulesFullDir)) {
      console.log('rename')
      fs.renameSync(serverModulesFullDir, nodeModulesFullDir)
    }
  }

  getServerDir() {
    const baseConfig = this._configMgr.getBaseConfig()
    return path.join(baseConfig.LMD_APP_STORY_DIR, 'server')
    // return path.join(process.env.APP_ROOT, serverDir)
  }

}
