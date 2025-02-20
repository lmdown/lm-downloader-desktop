export default class UrlUtil {

  static  addQueryParam(url: string, key: string, value: string): string {

    const urlObj = new URL(url);
    const hash = urlObj.hash;
    urlObj.hash = '';

    const params = new URLSearchParams(urlObj.search);

    params.set(key, value);

    urlObj.search = params.toString();

    urlObj.hash = hash;

    return urlObj.toString();
  }

}

