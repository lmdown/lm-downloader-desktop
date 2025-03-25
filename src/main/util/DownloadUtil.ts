import axios from 'axios';
import fs from 'fs';

export default class DownloadUtil {

  static async download(
    url: string,
    destination: string,
    continueDownload: boolean = true,
    maxRetries: number = 5
  ): Promise<void> {
    if (!this.isValidUrl(url)) {
      console.error('URL not valid:', url);
      throw new Error('Invalid URL');
    }

    console.log(`Start downloading ${url}`);
    let retries = 0;

    while (retries <= maxRetries) {
      try {
        const writer = fs.createWriteStream(destination, { flags: continueDownload ? 'a' : 'w' });
        let downloadedBytes = 0;

        // 如果启用了断点续传，检查已下载的字节数
        if (continueDownload && fs.existsSync(destination)) {
          downloadedBytes = fs.statSync(destination).size;
        }

        const response = await axios({
          url,
          method: 'get',
          responseType: 'stream',
          headers: {
            Range: `bytes=${downloadedBytes}-`, // 设置断点续传的起始位置
          },
          maxRedirects: 12
        });

        // 获取总文件大小
        const totalBytes = parseInt(response.headers['content-length'] || '0', 10) + downloadedBytes;

        // 将数据写入文件
        response.data.pipe(writer);

        return new Promise((resolve, reject) => {
          writer.on('finish', () => {
            console.log(`Downloaded to ${destination}`);
            resolve();
          });

          writer.on('error', (err) => {
            console.error('Error writing file:', err);
            reject(err);
          });
        });
      } catch (error) {
        retries++;
        console.error(`Attempt ${retries} failed. Error:`, error.message);

        if (retries > maxRetries) {
          console.error(`Max retries (${maxRetries}) exceeded. Aborting download.`);
          throw error;
        }

        console.log(`Retrying download... (Attempt ${retries}/${maxRetries})`);
      }
    }
  }

  /**
   * 验证 URL 是否有效
   * @param urlString 待验证的 URL
   * @returns 是否为有效的 URL
   */
  static isValidUrl(urlString: string): boolean {
    const regex = /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:\/?#[\]@!\$&'\*\+,;=.]+$/i;
    return regex.test(urlString);
  }
}
