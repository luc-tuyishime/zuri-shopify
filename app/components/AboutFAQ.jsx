import { useState } from 'react';
import { useLocale } from '~/hooks/useLocale';

export function AboutFAQ({ collection }) {
    const [locale] = useLocale();
    const [openFAQ, setOpenFAQ] = useState(null);

    if (collection?.metafields) {
        const faqKeys = collection.metafields
            .filter(m => m?.key?.includes('faq'))
            .map(m => m.key);
        console.log('Available FAQ metafield keys:', faqKeys);
    }

    const getMetafield = (key, namespace = 'custom') => {
        try {
            if (!collection?.metafields || !Array.isArray(collection.metafields)) {
                return null;
            }

            return collection.metafields
                .filter(metafield => metafield !== null)
                .find(metafield =>
                    metafield &&
                    metafield.key === key &&
                    metafield.namespace === namespace
                );
        } catch (error) {
            console.warn(error);
            return null;
        }
    };

    const hasRelevantMetafields = () => {
        if (!collection?.metafields || !Array.isArray(collection.metafields)) {
            return false;
        }

        const hasFAQTitle = getMetafield(`about_faq_title_${locale}`) ||
            getMetafield('about_faq_title_fr') ||
            getMetafield('about_faq_title');

        let hasFAQItems = false;
        for (let i = 1; i <= 10; i++) {
            // Try current locale first, then fallback to 'fr', then no suffix
            const hasQuestion = getMetafield(`about_faq_${i}_question_${locale}`) ||
                getMetafield(`about_faq_${i}_question_fr`) ||
                getMetafield(`about_faq_${i}_question`);
            const hasAnswer = getMetafield(`about_faq_${i}_answer_${locale}`) ||
                getMetafield(`about_faq_${i}_answer_fr`) ||
                getMetafield(`about_faq_${i}_answer`);

            if (hasQuestion && hasAnswer) {
                hasFAQItems = true;
                break;
            }
        }

        const result = hasFAQTitle || hasFAQItems;
        return result;
    };

    // DEBUG: Check this early return
    if (!hasRelevantMetafields()) {
        return null;
    }

    const getLocalizedContent = (baseKey, fallbackText) => {
        // Try current locale first, then fallback to 'fr', then no suffix
        const localizedField = getMetafield(`${baseKey}_${locale}`);
        if (localizedField?.value) return localizedField.value;

        const frenchField = getMetafield(`${baseKey}_fr`);
        if (frenchField?.value) return frenchField.value;

        const defaultField = getMetafield(baseKey);
        if (defaultField?.value) return defaultField.value;

        return fallbackText;
    };

    const toggleFAQ = (index) => {
        setOpenFAQ(openFAQ === index ? null : index);
    };

    const faqTitle = getLocalizedContent('about_faq_title',
        locale === 'fr' ? 'QUESTIONS FRÉQUEMMENT POSÉES' : 'FREQUENTLY ASKED QUESTIONS'
    );

    const getFAQsData = () => {
        const faqsData = [];

        // Try to get up to 10 About FAQs from metafields
        for (let i = 1; i <= 10; i++) {
            const question = getLocalizedContent(`about_faq_${i}_question`, '');
            const answer = getLocalizedContent(`about_faq_${i}_answer`, '');

            if (question && answer) {
                faqsData.push({ question, answer });
            }
        }

        return faqsData;
    };

    const faqs = getFAQsData();

    if (faqs.length === 0) {
        return null;
    }


    return (
        <div className="bg-white py-16">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 max-w-7xl mx-auto">

                    <div className="lg:col-span-1 pt-4">
                        <h2 className="text-[32px] lg:text-[40px] font-light text-[#0D2936] font-poppins leading-tight">
                            {faqTitle}
                        </h2>
                    </div>

                    <div className="lg:col-span-2">
                        <div className="space-y-0">
                            {faqs.map((faq, index) => (
                                <div key={index} className="border-b border-gray-200">
                                    <button
                                        onClick={() => toggleFAQ(index)}
                                        className="w-full py-4 lg:py-6 flex items-center justify-between text-left hover:bg-gray-50 transition-colors duration-200 px-4 lg:px-0"
                                    >
                                        <h3 className="text-[16px] lg:text-[20px] font-medium text-[#0D2936] font-poppins pr-4 text-left">
                                            {faq.question}
                                        </h3>
                                        <div className="flex-shrink-0 ml-4">
                                            <svg
                                                className={`w-5 h-5 lg:w-6 lg:h-6 text-[#0D2936] transition-transform duration-300 ${
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
                                        className={`overflow-hidden transition-all duration-500 ease-in-out ${
                                            openFAQ === index
                                                ? 'max-h-[1000px] lg:max-h-[600px] opacity-100'
                                                : 'max-h-0 opacity-0'
                                        }`}
                                    >
                                        <div className="px-4 lg:px-0 pb-4 lg:pb-6">
                                            <p className="text-gray-700 text-[14px] lg:text-[16px] leading-relaxed font-poppins whitespace-pre-line">
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