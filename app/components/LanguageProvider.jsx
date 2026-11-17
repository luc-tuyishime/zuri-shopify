import { createContext, useContext, useState, useEffect } from 'react';
import { setLocale as persistLocale, reloadKeepingScroll } from '~/lib/i18n';

const LanguageContext = createContext();

export function LanguageProvider({ children, initialLocale }) {
    const [locale, setLocaleState] = useState(initialLocale ?? 'fr');

    useEffect(() => {
        try {
            const y = sessionStorage.getItem('zuri-scroll');
            if (y !== null) {
                sessionStorage.removeItem('zuri-scroll');
                // wait a moment so images and videos make the page tall again
                setTimeout(() => window.scrollTo(0, parseInt(y, 10)), 300);
            }
        } catch { /* empty */ }
    }, []);

    const changeLocale = (newLocale) => {
        if (newLocale === locale) return;
        persistLocale(newLocale);
        setLocaleState(newLocale);
        reloadKeepingScroll();
    };

    return (
        <LanguageContext.Provider value={{ locale, setLocale: changeLocale }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within LanguageProvider');
    }
    return context;
}