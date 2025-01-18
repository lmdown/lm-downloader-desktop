import { app } from "electron"

export default class LocaleUtil {

  static getSystemLocale() {
    const locale = app.getLocale()
    return locale
  }

  // default locale value for renderer process
  static getDefaultLocale() {
    let lmdLocale = 'en'
    try {
      const systemLocale = this.getSystemLocale()
      const mainLocale = systemLocale.split('-')[0]
      switch (mainLocale) {
        case 'en':
          lmdLocale = 'en'
          break;
        case 'zh':
          lmdLocale = 'zhHans'
          break;
        default:
          lmdLocale = 'en'
          break;
      }
    }catch(err) {
      console.log('get system locale error, use default en.', err)
    }
    return lmdLocale
  }

  // only for main process, not renderer process
  static getLocaleMainProcess(localeFromConfig: string) {
    let lmdLocale = 'en'
    try {
      const mainLocale = localeFromConfig
      switch (mainLocale) {
        case 'en':
          lmdLocale = 'en'
          break;
        case 'zhHans':
          lmdLocale = 'zh'
          break;
        default:
          lmdLocale = 'en'
          break;
      }
    }catch(err) {
      console.log('get main process locale error, use default en.', err)
    }
    return lmdLocale
  }

}
