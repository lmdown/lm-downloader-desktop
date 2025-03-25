import { exec } from 'child_process';
import { promisify } from 'util';

export default class DownloadUtil {

  static async download(url: string, destination: string, continueDownload: boolean = true): Promise<void> {
    if(!this.isValidUrl(url)) {
      console.error('url not valid',url)
      throw new Error('url not valid')
    }
    console.log(`start download ${url}`);
    const execAsync = promisify(exec);
    try {
      let command = `curl --ssl-no-revoke -C - --retry 7 -L ${url} --output ${destination}`;
      if(!continueDownload) {
        command = `curl --ssl-no-revoke --retry 7 -L ${url} --output ${destination}`;
      }
      await execAsync(command);
      console.log(`downloaded to ${destination}`);
    } catch (error) {
      console.error('Error download:', error);
    }
  }

  static isValidUrl(urlString) {
    const regex = /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:\/?#[\]@!\$&'\*\+,;=.]+$/i;
    return regex.test(urlString);
  }

}
