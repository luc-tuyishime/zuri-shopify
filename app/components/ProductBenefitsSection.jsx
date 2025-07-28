import { useState } from 'react';
import { useLocale } from '~/hooks/useLocale';

export function ProductBenefitsSection({ product }) {

    const [locale] = useLocale();
    const [activeTab, setActiveTab] = useState('benefits');

    // Helper function to get metafield with null safety
    const getMetafield = (key, namespace = 'custom') => {
        try {
            if (!product?.metafields || !Array.isArray(product.metafields)) {
                return null;
            }

            // Filter out null values first, then find the metafield
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

    // Get localized content with fallback
    const getLocalizedContent = (baseKey, fallbackText) => {
        // Try language-specific metafield first
        const localizedField = getMetafield(`${baseKey}_${locale}`);
        if (localizedField?.value) return localizedField.value;

        // Fall back to default metafield
        const defaultField = getMetafield(baseKey);
        if (defaultField?.value) return defaultField.value;

        // Final fallback to provided text
        return fallbackText;
    };

    // Tab labels with metafield support
    const tabs = [
        {
            id: 'benefits',
            label: getLocalizedContent('benefits_tab_label', locale === 'fr' ? 'AVANTAGES' : 'BENEFITS')
        },
        {
            id: 'ingredients',
            label: getLocalizedContent('ingredients_tab_label', locale === 'fr' ? 'INGRÉDIENTS' : 'INGREDIENTS')
        },
        {
            id: 'usage',
            label: getLocalizedContent('usage_tab_label', locale === 'fr' ? 'UTILISATION' : 'HOW TO USE')
        },
    ];

    // Get benefits data from metafields or use defaults
    const getBenefitsData = () => {
        const benefitsData = [];

        // Try to get up to 6 benefits from metafields
        for (let i = 1; i <= 6; i++) {
            const title = getLocalizedContent(`benefit_${i}_title`, '');
            const description = getLocalizedContent(`benefit_${i}_description`, '');

            if (title || description) {
                benefitsData.push({
                    title: title || `Benefit ${i}`,
                    description: description || 'Description à venir'
                });
            }
        }

        // If no metafields found, use default benefits
        if (benefitsData.length === 0) {
            return [
                {
                    title: locale === 'fr' ? 'Nutrition Profonde' : 'Deep Nourishment',
                    description: locale === 'fr'
                        ? 'Enrichi d\'ingrédients hydratants qui aident à restaurer et maintenir l\'équilibre hydrique naturel de vos cheveux, les laissant doux, hydratés et en bonne santé.'
                        : 'Enriched with moisturizing ingredients that help restore and maintain your hair\'s natural moisture balance, leaving it soft, hydrated, and healthy.'
                },
                {
                    title: locale === 'fr' ? 'Éclat Rehaussé' : 'Enhanced Shine',
                    description: locale === 'fr'
                        ? 'Formulé pour rehausser l\'éclat naturel de vos cheveux, Silk Smooth apporte une finition soyeuse et radieuse après chaque lavage.'
                        : 'Formulated to enhance the natural shine of your hair, Silk Smooth brings out a silky, radiant finish after every wash.'
                },
                {
                    title: locale === 'fr' ? 'Nettoyage Doux' : 'Gentle Cleansing',
                    description: locale === 'fr'
                        ? 'Sa formule douce mais efficace élimine les impuretés sans éliminer les huiles essentielles, garantissant que vos cheveux restent maniables, lisses et revitalisés.'
                        : 'Its gentle yet effective formula removes impurities without stripping essential oils, ensuring your hair stays manageable, smooth, and revitalized.'
                },
                {
                    title: locale === 'fr' ? 'Contrôle des Frisottis' : 'Frizz Control',
                    description: locale === 'fr'
                        ? 'Aide à dompter les frisottis et les cheveux rebelles, laissant les cheveux lisses, soyeux et faciles à coiffer, même dans des conditions humides.'
                        : 'Helps tame frizz and flyaways, leaving hair smooth, sleek, and easy to style, even in humid conditions.'
                }
            ];
        }

        return benefitsData;
    };

    // Get ingredients content
    const getIngredientsContent = () => {
        const title = getLocalizedContent('ingredients_title', locale === 'fr' ? 'Ingrédients Naturels' : 'Natural Ingredients');
        const description = getLocalizedContent('ingredients_description',
            locale === 'fr'
                ? 'Notre formule contient des ingrédients soigneusement sélectionnés pour nourrir et protéger vos cheveux naturellement.'
                : 'Our formula contains carefully selected ingredients to nourish and protect your hair naturally.'
        );
        const ingredientsList = getLocalizedContent('ingredients_list', '');

        return { title, description, ingredientsList };
    };

    // Get usage steps
    const getUsageSteps = () => {
        const title = getLocalizedContent('usage_title', locale === 'fr' ? 'Mode d\'emploi' : 'How to Use');
        const steps = [];

        // Try to get up to 8 usage steps from metafields
        for (let i = 1; i <= 8; i++) {
            const step = getLocalizedContent(`usage_step_${i}`, '');
            if (step) {
                steps.push(step);
            }
        }

        // If no metafields found, use default steps
        if (steps.length === 0) {
            return {
                title,
                steps: [
                    locale === 'fr'
                        ? 'Mouillez abondamment vos cheveux avec de l\'eau tiède.'
                        : 'Wet your hair thoroughly with lukewarm water.',
                    locale === 'fr'
                        ? 'Appliquez une petite quantité de shampooing sur vos cheveux mouillés.'
                        : 'Apply a small amount of shampoo to your wet hair.',
                    locale === 'fr'
                        ? 'Massez doucement le cuir chevelu et les cheveux pour créer une mousse riche.'
                        : 'Gently massage scalp and hair to create a rich lather.',
                    locale === 'fr'
                        ? 'Rincez abondamment à l\'eau tiède et répétez si nécessaire.'
                        : 'Rinse thoroughly with lukewarm water and repeat if necessary.'
                ]
            };
        }

        return { title, steps };
    };

    const benefits = getBenefitsData();
    const ingredientsContent = getIngredientsContent();
    const usageContent = getUsageSteps();

    return (
        <div className="bg-gray-50 py-8 md:py-16">
            <div className="container mx-auto px-4">
                {/* Tab Navigation */}
                <div className="flex justify-center mb-8 md:mb-14">
                    <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-8 md:space-x-16">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`pb-2 text-sm sm:text-base md:text-[20px] font-medium tracking-wider transition-all duration-200 ${
                                    activeTab === tab.id
                                        ? 'text-[#002F45] border-b-2 border-[#002F45]'
                                        : 'text-gray-400 hover:text-gray-600'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Benefits Content */}
                {activeTab === 'benefits' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-6xl mx-auto">
                        {benefits.map((benefit, index) => (
                            <div key={index} className="flex items-start space-x-3 md:space-x-4">
                                {/* Check Mark Icon */}
                                <div className="flex-shrink-0 self-center">
                                    <div className="w-6 h-6 md:w-8 md:h-8 bg-[#002F45] rounded-full flex items-center justify-center">
                                        <svg
                                            className="w-3 h-3 md:w-5 md:h-5 text-white"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M5 13l4 4L19 7"
                                            />
                                        </svg>
                                    </div>
                                </div>

                                {/* Benefit Content */}
                                <div className="flex-1">
                                    <h3 className="text-sm sm:text-base md:text-[16px] font-semibold text-[#002F45] mb-2 md:mb-3 font-poppins">
                                        {benefit.title}
                                    </h3>
                                    <p className="text-sm sm:text-base md:text-[16px] text-[#002F45] font-light leading-relaxed font-poppins">
                                        {benefit.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Ingredients Content */}
                {activeTab === 'ingredients' && (
                    <div className="max-w-4xl mx-auto text-center">
                        <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-[#002F45] mb-4 md:mb-6 font-poppins">
                            {ingredientsContent.title}
                        </h3>
                        <p className="text-sm sm:text-base md:text-[16px] text-[#002F45] font-light leading-relaxed font-poppins mb-6">
                            {ingredientsContent.description}
                        </p>
                        {ingredientsContent.ingredientsList && (
                            <div className="text-left">
                                <div className="bg-white p-6 rounded-lg shadow-sm">
                                    <div className="whitespace-pre-line text-sm sm:text-base md:text-[16px] text-[#002F45] font-light font-poppins">
                                        {ingredientsContent.ingredientsList}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Usage Content */}
                {activeTab === 'usage' && (
                    <div className="max-w-4xl mx-auto text-center">
                        <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-[#002F45] mb-4 md:mb-6 font-poppins">
                            {usageContent.title}
                        </h3>
                        <div className="text-left space-y-3 md:space-y-4">
                            {usageContent.steps.map((step, index) => (
                                <div key={index} className="flex items-start space-x-3">
                                    <span className="flex-shrink-0 w-5 h-5 md:w-6 md:h-6 bg-[#002F45] text-white rounded-full flex items-center justify-center text-xs md:text-sm font-medium">
                                        {index + 1}
                                    </span>
                                    <p className="text-sm sm:text-base md:text-[16px] text-[#002F45] font-light font-poppins">
                                        {step}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}