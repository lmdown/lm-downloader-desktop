import os from 'os'

export default class OSUtil {

  static isWindows() {
    return os.platform() === 'win32'
  }

  static isMacOS() {
    return os.platform() === 'darwin'
  }

}
