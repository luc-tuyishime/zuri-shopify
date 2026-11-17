const FLAGS = { fr: '🇫🇷', en: '🇬🇧' };

export function LanguageSwitcher({ currentLocale, onLocaleChange }) {
    const options = [
        { code: 'fr', label: 'FR' },
        { code: 'en', label: 'EN' },
    ];

    return (
        <div className="language-switcher flex items-center space-x-2">
            {options.map((opt, i) => (
                <span key={opt.code} className="flex items-center space-x-2">
                    {i > 0 && <span className="text-gray-400">|</span>}
                    <button
                        onClick={() => onLocaleChange(opt.code)}
                        className={`inline-flex items-center gap-1 text-sm uppercase tracking-wider transition-colors ${
                            currentLocale === opt.code
                                ? 'font-bold text-[#542C17]'
                                : 'text-gray-600 hover:text-[#542C17]'
                        }`}
                    >
                        <span aria-hidden="true">{FLAGS[opt.code]}</span>
                        {opt.label}
                    </button>
                </span>
            ))}
        </div>
    );
}