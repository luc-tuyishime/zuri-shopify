import { useState } from 'react';
import { useLocale } from '~/hooks/useLocale';

export function FAQ({ product }) {
    const [locale] = useLocale();
    const [openFAQ, setOpenFAQ] = useState(null);

    const getMetafield = (key, namespace = 'custom') => {
        try {
            if (!product?.metafields || !Array.isArray(product.metafields)) {
                return null;
            }

            return product.metafields
                .filter(metafield => metafield !== null)
                .find(metafield =>
                    metafield &&
                    metafield.key === key &&
                    metafield.namespace === namespace
                );
        } catch (error) {
            console.warn('Error getting metafield:', error);
            return null;
        }
    };

    const getLocalizedContent = (baseKey, fallbackText) => {
        const localizedField = getMetafield(`${baseKey}_${locale}`);
        if (localizedField?.value) return localizedField.value;

        const defaultField = getMetafield(baseKey);
        if (defaultField?.value) return defaultField.value;

        return fallbackText;
    };

    const toggleFAQ = (index) => {
        setOpenFAQ(openFAQ === index ? null : index);
    };

    const faqTitle = getLocalizedContent('faq_title',
        locale === 'fr' ? 'QUESTIONS FRÉQUEMMENT POSÉES' : 'FREQUENTLY ASKED QUESTIONS'
    );


    const getFAQsData = () => {
        const faqsData = [];

        for (let i = 1; i <= 10; i++) {
            const question = getLocalizedContent(`faq_${i}_question`, '');
            const answer = getLocalizedContent(`faq_${i}_answer`, '');

            if (question && answer) {
                faqsData.push({ question, answer });
            }
        }

        if (faqsData.length === 0) {
            return [
                {
                    question: locale === 'fr'
                        ? 'Le shampooing Silk Smooth convient-il à tous les types de cheveux?'
                        : 'Is Silk Smooth Shampoo suitable for all hair types?',
                    answer: locale === 'fr'
                        ? 'Oui, le shampooing Silk Smooth est formulé pour convenir à tous les types de cheveux, des cheveux fins aux cheveux épais et bouclés. Sa formule douce nettoie efficacement sans agresser le cuir chevelu.'
                        : 'Yes, Silk Smooth Shampoo is formulated to suit all hair types, from fine to thick and curly hair. Its gentle formula cleanses effectively without irritating the scalp.'
                },
                {
                    question: locale === 'fr'
                        ? 'Le shampooing Silk Smooth contient-il des sulfates ou des parabènes?'
                        : 'Does Silk Smooth Shampoo contain sulfates or parabens?',
                    answer: locale === 'fr'
                        ? 'Non, notre shampooing Silk Smooth est formulé sans sulfates agressifs ni parabènes. Nous utilisons des ingrédients doux et naturels pour nettoyer et nourrir vos cheveux en toute sécurité.'
                        : 'No, our Silk Smooth Shampoo is formulated without harsh sulfates or parabens. We use gentle, natural ingredients to safely cleanse and nourish your hair.'
                },
                {
                    question: locale === 'fr'
                        ? 'Le shampooing Silk Smooth peut-il aider avec les cheveux secs ou abîmés?'
                        : 'Can Silk Smooth Shampoo help with dry or damaged hair?',
                    answer: locale === 'fr'
                        ? 'Absolument ! Le shampooing Silk Smooth est enrichi d\'ingrédients hydratants qui aident à restaurer l\'hydratation et à réparer les cheveux abîmés, laissant vos cheveux plus doux et plus maniables.'
                        : 'Absolutely! Silk Smooth Shampoo is enriched with moisturizing ingredients that help restore hydration and repair damaged hair, leaving your hair softer and more manageable.'
                },
                {
                    question: locale === 'fr'
                        ? 'À quelle fréquence dois-je utiliser le shampooing Silk Smooth?'
                        : 'How often should I use Silk Smooth Shampoo?',
                    answer: locale === 'fr'
                        ? 'Pour la plupart des types de cheveux, nous recommandons d\'utiliser le shampooing Silk Smooth 2-3 fois par semaine. Les cheveux très gras peuvent nécessiter une utilisation quotidienne, tandis que les cheveux secs peuvent bénéficier d\'une utilisation moins fréquente.'
                        : 'For most hair types, we recommend using Silk Smooth Shampoo 2-3 times per week. Very oily hair may require daily use, while dry hair may benefit from less frequent use.'
                },
                {
                    question: locale === 'fr'
                        ? 'Le shampooing Silk Smooth est-il sans danger pour les cheveux colorés?'
                        : 'Is Silk Smooth Shampoo color-safe?',
                    answer: locale === 'fr'
                        ? 'Oui, le shampooing Silk Smooth est sans danger pour les cheveux colorés. Sa formule douce aide à préserver la couleur tout en nettoyant efficacement, prolongeant ainsi la durée de vie de votre coloration.'
                        : 'Yes, Silk Smooth Shampoo is color-safe. Its gentle formula helps preserve color while cleansing effectively, extending the life of your hair color.'
                }
            ];
        }

        return faqsData;
    };

    const faqs = getFAQsData();

    return (
        <div className="bg-white py-16">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 max-w-7xl mx-auto">

                    <div className="lg:col-span-1 pt-4">
                        <h2 className="text-[40px] font-light text-[#0D2936] font-poppins leading-tight">
                            {faqTitle}
                        </h2>
                    </div>

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

                                    <div
                                        className={`overflow-hidden transition-all duration-300 ease-in-out ${
                                            openFAQ === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                                        }`}
                                    >
                                        <div className="px-4 lg:px-0 pb-6">
                                            <p className="text-gray-700 leading-relaxed font-poppins whitespace-pre-line">
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