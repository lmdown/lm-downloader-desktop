import OSUtil from "../util/OSUtil";
import sudo from 'sudo-prompt'

export default class GitAccept {

  static async gitAcceptOnMac() {
    if(OSUtil.isMacOS()) {
      const command = 'xcodebuild -license accept';
      await this.sudoExec(command, {name: 'LM Downloader'})
    }
  }

  static async sudoExec(command, options = {}) {
    return new Promise((resolve, reject) => {
      const opts = {
        // name: options.name || 'Electron App',
        ...options,
      };

      sudo.exec(command, opts, (error, stdout, stderr) => {
        if (error) {
          reject(error);
          return;
        }

        const output = (stdout?.toString() || '') + (stderr?.toString() || '');
        console.log('sudoExec result', output)
        resolve(output.trim());
      });
    });
  }

}



