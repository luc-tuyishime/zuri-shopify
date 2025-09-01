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

    // Check if ANY relevant metafields exist
    const hasRelevantMetafields = () => {
        if (!product?.metafields || !Array.isArray(product.metafields)) {
            return false;
        }

        // Check for FAQ title
        const hasFAQTitle = getMetafield(`faq_title_${locale}`) ||
            getMetafield('faq_title');

        // Check for FAQ items (check up to 10 FAQs)
        let hasFAQItems = false;
        for (let i = 1; i <= 10; i++) {
            const hasQuestion = getMetafield(`faq_${i}_question_${locale}`) ||
                getMetafield(`faq_${i}_question`);
            const hasAnswer = getMetafield(`faq_${i}_answer_${locale}`) ||
                getMetafield(`faq_${i}_answer`);

            if (hasQuestion && hasAnswer) {
                hasFAQItems = true;
                break;
            }
        }

        console.log('FAQ metafields check:', {
            hasFAQTitle,
            hasFAQItems,
            hasAnyRelevant: hasFAQTitle || hasFAQItems
        });

        // Return true if we have either FAQ title OR FAQ items
        return hasFAQTitle || hasFAQItems;
    };

    // Early return - don't render component if no relevant metafields exist
    if (!hasRelevantMetafields()) {
        console.log('FAQ: No relevant metafields found, hiding component');
        return null;
    }

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

        // Try to get up to 10 FAQs from metafields
        for (let i = 1; i <= 10; i++) {
            const question = getLocalizedContent(`faq_${i}_question`, '');
            const answer = getLocalizedContent(`faq_${i}_answer`, '');

            if (question && answer) {
                faqsData.push({ question, answer });
            }
        }

        return faqsData;
    };

    const faqs = getFAQsData();

    // If we have metafields but no valid FAQ data, don't render
    if (faqs.length === 0) {
        console.log('FAQ: No valid FAQ data found, hiding component');
        return null;
    }

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