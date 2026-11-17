import { useState, useEffect } from 'react';
import { useRouteLoaderData } from '@remix-run/react';
import { getLocale, setLocale as saveLocale } from '~/lib/i18n';

export function useLocale() {
    const root = useRouteLoaderData('root');
    const [locale, setLocaleState] = useState(root?.locale ?? 'fr');

    const setLocale = (newLocale) => {
        if (newLocale === locale) return;
        saveLocale(newLocale);        // writes the cookie
        setLocaleState(newLocale);
        window.location.reload();     // server re-fetches in the new language
    };

    useEffect(() => {
        const handleStorageChange = () => setLocaleState(getLocale());
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    return [locale, setLocale];
}