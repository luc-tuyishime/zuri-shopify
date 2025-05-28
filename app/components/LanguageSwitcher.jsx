export function LanguageSwitcher({ currentLocale, onLocaleChange }) {
    const handleLanguageSwitch = (newLocale) => {
        onLocaleChange(newLocale);
    };

    return (
        <div className="language-switcher flex items-center space-x-2">
            <button
                onClick={() => handleLanguageSwitch('fr')}
                className={`text-sm uppercase tracking-wider transition-colors ${
                    currentLocale === 'fr'
                        ? 'font-bold text-[#542C17]'
                        : 'text-gray-600 hover:text-[#542C17]'
                }`}
            >
                FR
            </button>
            <span className="text-gray-400">|</span>
            <button
                onClick={() => handleLanguageSwitch('en')}
                className={`text-sm uppercase tracking-wider transition-colors ${
                    currentLocale === 'en'
                        ? 'font-bold text-[#542C17]'
                        : 'text-gray-600 hover:text-[#542C17]'
                }`}
            >
                EN
            </button>
        </div>
    );
}