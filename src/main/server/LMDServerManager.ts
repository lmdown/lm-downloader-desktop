import { fork } from 'child_process';
import path from 'path';
import fs from 'fs';
import ConfigManager from '../ConfigManager';
import { app } from 'electron';
import ProcessControlUtil from '../util/process/ProcessControlUtil';

export default class LMDServerManager {

  private _configMgr:ConfigManager
  private _onSuccess: () => void

  constructor(onSuccess: () => void) {
    this._configMgr = ConfigManager.getInstance()
    this._onSuccess = onSuccess
    this.init()
  }

  async init() {
    const serverDir = this._configMgr.getServerDir()
    const LMD_USER_DATA_PATH = app.getPath('userData')
    const config = this._configMgr.getBaseConfig()
    const serverFilePath = path.join(serverDir, 'start.js')
    console.log('serverFilePath', serverFilePath)

    await this.checkAndCloseOldProcess(serverDir)

    let fullEnv = Object.assign({}, config)
    fullEnv = Object.assign(fullEnv, process.env)
    // @ts-ignore
    fullEnv.LMD_USER_DATA_PATH = LMD_USER_DATA_PATH;
    const serverProcess = fork(serverFilePath, {
      cwd: serverDir,
      env: fullEnv
    });

    serverProcess.on('disconnect', (e) => {console.log('lmd server disconnect', e)})
    serverProcess.on('error', (e) => {console.log('lmd server error', e)})
    serverProcess.on('exit', (e) => {console.log('lmd server exit', e)})
    serverProcess.on('spawn', (e) => {console.log('lmd server spawn', e)})

    serverProcess.on('message', (msg) => {
      console.log('local server msg:', msg);
      if(msg==='lmd-server-started') {
        if(this._onSuccess) {
          this._onSuccess()
        }
      }
    });

    serverProcess.on('close', (code) => {
      console.log('Server exited with code:', code);
    });

    process.on('exit', () => {
      const killResult = serverProcess.kill('SIGTERM');
      console.log('killResult', killResult)
    });
  }

  checkNodeModules() {
    const serverDir = this._configMgr.getServerDir()
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

  async checkAndCloseOldProcess(serverDir: string) {
    try {
      await ProcessControlUtil.checkPortAndCloseProcess(serverDir)
    } catch (err) {
      console.error('checkAndCloseOldProcess', err)
    }
  }

}
