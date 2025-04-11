import { app } from 'electron';
import I18n, { i18n } from './i18n';
import path from 'path';
import LocaleUtil from '../util/LocaleUtil';
import ConfigManager from '../ConfigManager';

export default class LocaleManager {

  static instance;

  static getInstance(): LocaleManager {
      if (!LocaleManager.instance) {
        LocaleManager.instance = new LocaleManager();
      }
      return LocaleManager.instance;
  }

  public i18nInstance: I18n = i18n

  init() {
    const localesDir = path.join(__dirname, 'locales');
    i18n.init(localesDir);

    const baseConfig = ConfigManager.getInstance().getBaseConfig()
    const systemLocale = LocaleUtil.getLocaleMainProcess(baseConfig.LMD_LOCALE)

    // const userLanguage = app.getLocale().substring(0, 2); // 获取用户的语言环境
    i18n.setLocale(systemLocale);

    // console.log(i18n.t('welcome'));

  }
}
