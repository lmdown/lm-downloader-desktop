import { exec } from 'child_process';
import { promisify } from 'util';

export default class MacToolsInstallUtil {

  static async checkGitInstalled(): Promise<boolean> {
    try {
      const execAsync = promisify(exec);
      const { stdout } = await execAsync('git --version');
      console.log('checkGitInstalled stdout', stdout)
      return true;
    } catch (error) {
      console.error('Git does not exist');
      return false;
    }
  }

  static async installXcodeCommandLineTools(): Promise<void> {
    try {
      const execAsync = promisify(exec);
      console.log('install Xcode Command Line Tools');
      await execAsync('xcode-select --install');
    } catch (error) {
      console.error('Xcode Command Line Tools err:', error);
    }
  }

  static async waitForGitInstallation(): Promise<void> {
    while (true) {
        const isGitInstalled = await this.checkGitInstalled();
        if (isGitInstalled) {
            // console.log('Git 安装成功！');
            break;
        }
        console.log('Git wait...');
        await this.sleep(5000);
    }
  }

  static sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }


}
