import { app } from 'electron'
import FileUtil from '../util/FileUtil';

export default class AppSysUtil {

  static exitAndRestartApp() {
    app.relaunch();
    app.exit(0);
  }

  static clearDirAndRestartApp(dir: string) {
    // remove story dir
    FileUtil.removeFile(dir)
    this.exitAndRestartApp()
  }

}
