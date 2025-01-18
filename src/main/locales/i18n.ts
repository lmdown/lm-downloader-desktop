import * as fs from 'fs';
import * as path from 'path';

export default class I18n {
    private messages: { [key: string]: any } = {};
    private defaultLocale: string = 'en';
    private currentLocale: string = this.defaultLocale;

    constructor() {}

    init(localesDir: string): void {
        const locales = fs.readdirSync(localesDir);
        locales.forEach(locale => {
            const localePath = path.join(localesDir, locale);
            const localeKey = path.basename(locale, '.json');
            try {
                this.messages[localeKey] = JSON.parse(fs.readFileSync(localePath, 'utf8'));
            } catch (error) {
                console.error(`Error reading locale file ${locale}:`, error);
            }
        });
    }

    setLocale(locale: string): void {
        if (this.messages[locale]) {
            this.currentLocale = locale;
        } else {
            console.warn(`Locale ${locale} not found, falling back to default.`);
            this.currentLocale = this.defaultLocale;
        }
    }

    t(key: string): string {
        let message = key.split('.').reduce((obj, k) => obj && obj[k], this.messages[this.currentLocale]);
        return typeof message === 'string' ? message : key;
    }
}

export const i18n = new I18n();
