// app/hooks/useLocale.js
import { useState, useEffect } from 'react';
import { getLocale, setLocale as saveLocale } from '~/lib/i18n';

export function useLocale() {
    const [locale, setLocaleState] = useState('fr');

    useEffect(() => {
        setLocaleState(getLocale());
    }, []);

    const setLocale = (newLocale) => {
        setLocaleState(newLocale);
        saveLocale(newLocale);
        // Force re-render by updating the state
        window.dispatchEvent(new CustomEvent('storage', {
            detail: { key: 'zuri-locale', newValue: newLocale }
        }));
    };

    useEffect(() => {
        const handleStorageChange = (e) => {
            if (e.detail?.key === 'zuri-locale' || e.storageArea) {
                setLocaleState(getLocale());
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    return [locale, setLocale];
}