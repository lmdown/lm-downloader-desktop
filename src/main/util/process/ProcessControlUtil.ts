// import fs from 'fs'
// import path from 'path'
// import * as dotenv from 'dotenv';
import ServerConfigManager from '../../config/ServerConfigManager';
import { promisify } from 'util';
import { exec, ExecException } from 'child_process';
import OSUtil from '../OSUtil';

interface PortInfo {
    port: number;
    pid?: number;
    processName?: string;
    isLMD?: boolean;
}
export default class ProcessControlUtil {

  static execAsync = promisify(exec);

  static async checkPortAndCloseProcess(serverDir: string) {
    // const envFilePath = path.join(serverDir, '.env')
    const config = ServerConfigManager.getInstance().getServerConfig(serverDir)
    // const host = config.HOST || 'localhost'
    const port = config.PORT || '19312'
    const checkResult = await this.isLMDUsingPort(parseInt(port))
    console.log('checkPort', checkResult)
    if(checkResult.pid) {
      this.close(checkResult)
    }
  }

  static async close(portInfo: PortInfo) {
    const pid = portInfo.pid
    console.log('kill:', portInfo.pid)
    try {
      const command = OSUtil.isWindows()
          ? `taskkill /PID ${pid} /F`
          : `kill -9 ${pid}`;

      const { stderr } = await this.execAsync(command);

      if (stderr) {
          console.error(`Error killing process ${pid}:`, stderr);
          return false;
      }

      return true;
    } catch (error) {
        const execError = error as ExecException;
        console.error(`Failed to kill process ${pid}:`, execError.message);
        return false;
    }
  }

  static async checkPort(port: number): Promise<PortInfo> {
    const result: PortInfo = { port };

    try {
        // 根据操作系统选择不同的命令
        const command = OSUtil.isWindows()
            ? `netstat -ano | findstr :${port}`
            : `lsof -i :${port} | grep LISTEN`;

        console.log('command', command)
        const { stdout } = await this.execAsync(command);

        console.log('stdout', stdout)
        if (!stdout.trim()) {
          console.log('端口未被占用')
            return result; // 端口未被占用
        }

        // 解析输出获取PID
        let pid: number | undefined;
        if (OSUtil.isWindows()) {
            // Windows output: TCP    0.0.0.0:8080           0.0.0.0:0              LISTENING       1234
            const match = stdout.match(/LISTENING\s+(\d+)/);
            pid = match ? parseInt(match[1], 10) : undefined;
        } else {
            // Unix-like output: nginx   1234   root    6u  IPv4 0xabc123      0t0  TCP *:8080 (LISTEN)
            const match = stdout.match(/^\S+\s+(\d+)/);
            pid = match ? parseInt(match[1], 10) : undefined;
        }

        if (pid) {
            result.pid = pid;
            const processName = await this.getProcessName(pid);
            if (processName) {
                result.processName = processName.toLowerCase();
            }
        }

        return result;
    } catch (error) {
        if (error instanceof Error && 'code' in error && error.code === 1) {
            // grep/findstr
            // if there's nothing, return code 1
            return result;
        }
        throw error;
    }
  }

  static async getProcessName(pid: number): Promise<string | undefined> {
    try {
        const command = OSUtil.isWindows()
            ? `tasklist /FI "PID eq ${pid}" /FO CSV /NH`
            : `ps -p ${pid} -o comm=`;

        const { stdout } = await this.execAsync(command);

        if (OSUtil.isWindows()) {
            // Windows output: "nginx.exe","1234","Console","1","10,240 K"
            const match = stdout.match(/^"([^"]+)"/);
            return match ? match[1] : undefined;
        } else {
            // Unix-like output: nginx
            return stdout.trim() || undefined;
        }
    } catch (error) {
        console.error(`Error getting process name for PID ${pid}:`, error);
        return undefined;
    }
  }

  static async isLMDUsingPort(port: number): Promise<PortInfo> {
    const portInfo = await this.checkPort(port);
    portInfo.isLMD = false

    if (!portInfo.pid) {
      return portInfo;
    }

    console.log(`Port ${port} is in use by PID ${portInfo.pid}`);

    if (portInfo.processName) {
        console.log(`Pname:${portInfo.processName}`);

        portInfo.isLMD = portInfo.processName.startsWith('lm');
        if (portInfo.isLMD) {
            console.log(`Port ${port} is being used by LMD`);
        } else {
            console.log(`Port ${port} is not being used by:`, portInfo.processName);
        }
    } else {
        console.log('Could not determine process name');
    }

    return portInfo;
  }

}
