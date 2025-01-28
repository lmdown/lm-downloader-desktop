// This feature is referenced from a github project:
// https://github.com/gucong3000/in-gfw/
// There was some bugs in the original project, and we fixed it.

import * as https from 'https'
import * as http from 'http'
import * as url from 'url'

// const syncArgv: string = "in-gfw-net-sync-argv";
export default class GFWCheckUtil {

  static async asyncCheck(blockedHost: string = 'npmjs.com', cnHost: string = 'npmmirror.com'): Promise<boolean> {
    let reqs: http.ClientRequest[] | null = [];

    // 发送 HEAD 请求的函数
    function head(config: string | url.UrlWithParsedQuery | url.Url): Promise<boolean> {
      if (typeof config === "string") {
        if (/^https?:\/\//i.test(config)) {
          config = url.parse(config);
        } else {
          config = {
            hostname: config,
          } as url.Url;
        }
      }
      const request = ((!config.protocol || /^https:$/i.test(config.protocol)) ? https : http).request;
      return new Promise((resolve, reject) => {
        const req = request(
          Object.assign(config, {
            method: 'HEAD'
          }),
          () => {
            resolve(true)
            abort()
          })

        req.on('error', (error: NodeJS.ErrnoException) => {
          console.log('got err', error)
          console.log('got err code', error.code)
          console.log('got err str', JSON.stringify(error))
          resolve(false)
          abort();
        });
        req.end();
        if (reqs) {
          reqs.push(req);
        }
      });
    }

    // 中止所有请求的函数
    function abort(): void {
      if (reqs) {
        reqs.forEach(req => req.abort());
        reqs = null;
      }
    }

    return Promise.race([
      head(blockedHost).then(result => !result),
      head(cnHost)
    ]);
  }

}
