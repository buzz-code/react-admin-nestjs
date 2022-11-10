import polyglotI18nProvider from 'ra-i18n-polyglot';
import en from 'ra-language-english';
import he from 'ra-language-hebrew-il';

const translations = { en, he };

const i18nProvider = polyglotI18nProvider(
    locale => translations[locale],
    'he', // default locale
    [{ locale: 'en', name: 'English' }, { locale: 'he', name: 'עברית' }],
);

export default i18nProvider;