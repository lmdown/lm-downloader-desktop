import AdmZip from 'adm-zip';
import os from 'os';
import fs from 'fs';
import { exec } from 'child_process';

export default class UncompressUtil {

  static async checkAndUnzip(zipFilePath: string, outputDir: string): Promise<void> {
    console.log('checkAndUnzip', outputDir)
    if (os.platform() === 'win32') {
      await this.unzipWithAdm(zipFilePath, outputDir);
    } else if (os.platform() === 'darwin') {
      await this.unzipWithCmd(zipFilePath, outputDir);
    } else {
      console.error('not supported');
    }
  }

  static async unzipWithAdm(zipFilePath: string, destinationPath: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      try {
        if (!fs.existsSync(zipFilePath)) {
          reject(new Error(`The file ${zipFilePath} does not exist.`))
        }
        const zip = new AdmZip(zipFilePath);
        zip.extractAllTo(destinationPath, true);
        console.log('File unzipped successfully.');
        resolve()
      } catch (error) {
        console.error('Error unzipping file:', error);
        reject(error);
      }
    })
  }

  static async unzipWithCmd(zipFilePath: string, outputDir: string): Promise<void> {
    console.log('unzipWithCmd', outputDir)
    return new Promise<void>((resolve, reject) => {
      try {
        if (!fs.existsSync(zipFilePath)) {
            console.error(`does not exist.: ${zipFilePath}`);
            reject()
            return;
        }

        const command = `unzip -o "${zipFilePath}" -d "${outputDir}"`;
        // console.log('start  unzipWithCmd', command)
        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error: `, stderr);
                reject()
                return;
            }
            console.log(`unzip done: ${outputDir}`);
            // console.log(stdout);
            resolve()
        });
      } catch (error) {
          console.error(`unzip error: `, error);
          reject()
      }
    })
  }

}
