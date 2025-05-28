import { createContext, useContext, useState, useEffect } from 'react';
import { getLocale } from '~/lib/i18n';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
    const [locale, setLocaleState] = useState('fr');

    useEffect(() => {
        setLocaleState(getLocale());
    }, []);

    return (
        <LanguageContext.Provider value={{ locale, setLocale: setLocaleState }}>
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
