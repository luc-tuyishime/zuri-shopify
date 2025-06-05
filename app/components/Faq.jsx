import { useState } from 'react';
import { useLocale } from '~/hooks/useLocale';

export function FAQ() {
    const [locale] = useLocale();
    const [openFAQ, setOpenFAQ] = useState(null);

    const toggleFAQ = (index) => {
        setOpenFAQ(openFAQ === index ? null : index);
    };

    const faqs = [
        {
            question: locale === 'fr'
                ? 'Le shampooing Silk Smooth convient-il à tous les types de cheveux?'
                : 'Is Silk Smooth Shampoo suitable for all hair types?',
            answer: locale === 'fr'
                ? 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.'
                : 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.'
        },
        {
            question: locale === 'fr'
                ? 'Le shampooing Silk Smooth contient-il des sulfates ou des parabènes?'
                : 'Does Silk Smooth Shampoo contain sulfates or parabens?',
            answer: locale === 'fr'
                ? 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
                : 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
        },
        {
            question: locale === 'fr'
                ? 'Le shampooing Silk Smooth peut-il aider avec les cheveux secs ou abîmés?'
                : 'Can Silk Smooth Shampoo help with dry or damaged hair?',
            answer: locale === 'fr'
                ? 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.'
                : 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.'
        },
        {
            question: locale === 'fr'
                ? 'À quelle fréquence dois-je utiliser le shampooing Silk Smooth?'
                : 'How often should I use Silk Smooth Shampoo?',
            answer: locale === 'fr'
                ? 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.'
                : 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.'
        },
        {
            question: locale === 'fr'
                ? 'Quels ingrédients sont dans le shampooing Silk Smooth?'
                : 'What ingredients are in Silk Smooth Shampoo?',
            answer: locale === 'fr'
                ? 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.'
                : 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.'
        },
        {
            question: locale === 'fr'
                ? 'Le shampooing Silk Smooth est-il sans danger pour les cheveux colorés?'
                : 'Is Silk Smooth Shampoo color-safe?',
            answer: locale === 'fr'
                ? 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.'
                : 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.'
        },
        {
            question: locale === 'fr'
                ? 'Puis-je utiliser le shampooing Silk Smooth avec d\'autres produits de soins capillaires?'
                : 'Can I use Silk Smooth Shampoo with other hair care products?',
            answer: locale === 'fr'
                ? 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident.'
                : 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident.'
        }
    ];

    return (
        <div className="bg-white py-16">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 max-w-7xl mx-auto">

                    {/* Left Side - Title */}
                    <div className="lg:col-span-1 pt-4">
                        <h2 className="text-[40px] font-light text-[#0D2936] font-poppins leading-tight">
                            {locale === 'fr' ? 'QUESTIONS FRÉQUEMMENT POSÉES' : 'FREQUENTLY ASKED QUESTIONS'}
                        </h2>
                    </div>

                    {/* Right Side - FAQ List */}
                    <div className="lg:col-span-2">
                        <div className="space-y-0">
                            {faqs.map((faq, index) => (
                                <div key={index} className="border-b border-gray-200">
                                    <button
                                        onClick={() => toggleFAQ(index)}
                                        className="w-full py-6 flex items-center justify-between text-left hover:bg-gray-50 transition-colors duration-200 px-4 lg:px-0"
                                    >
                                        <h3 className="text-[20px] font-medium text-[#0D2936] font-poppins pr-4">
                                            {faq.question}
                                        </h3>
                                        <div className="flex-shrink-0 ml-4">
                                            <svg
                                                className={`w-6 h-6 text-[#0D2936] transition-transform duration-300 ${
                                                    openFAQ === index ? 'rotate-45' : ''
                                                }`}
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                            </svg>
                                        </div>
                                    </button>

                                    {/* Collapsible Answer */}
                                    <div
                                        className={`overflow-hidden transition-all duration-300 ease-in-out ${
                                            openFAQ === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                                        }`}
                                    >
                                        <div className="px-4 lg:px-0 pb-6">
                                            <p className="text-gray-700 leading-relaxed font-poppins">
                                                {faq.answer}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}