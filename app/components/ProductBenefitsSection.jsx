import { useState } from 'react';
import { useLocale } from '~/hooks/useLocale';

export function ProductBenefitsSection({ product }) {
    const [locale] = useLocale();
    const [activeTab, setActiveTab] = useState('benefits');

    const tabs = [
        { id: 'benefits', label: locale === 'fr' ? 'AVANTAGES' : 'BENEFITS' },
        { id: 'ingredients', label: locale === 'fr' ? 'INGRÉDIENTS' : 'INGREDIENTS' },
        { id: 'usage', label: locale === 'fr' ? 'UTILISATION' : 'HOW TO USE' },
    ];

    const benefits = [
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

    return (
        <div className="bg-gray-50 py-16">
            <div className="container mx-auto px-4">
                {/* Tab Navigation */}
                <div className="flex justify-center mb-14">
                    <div className="flex space-x-16">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`pb-2 text-[20px] font-medium tracking-wider transition-all duration-200 ${
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
                        {benefits.map((benefit, index) => (
                            <div key={index} className="flex items-start space-x-4">
                                {/* Check Mark Icon */}
                                <div className="flex-shrink-0 self-center">
                                    <div className="w-8 h-8 bg-[#002F45] rounded-full flex items-center justify-center">
                                        <svg
                                            className="w-5 h-5 text-white"
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
                                    <h3 className="text-[16px] font-semibold text-[#002F45] mb-3 font-poppins">
                                        {benefit.title}
                                    </h3>
                                    <p className="text-[16px] text-[#002F45] font-light leading-relaxed font-poppins">
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
                        <h3 className="text-2xl font-semibold text-[#002F45] mb-6 font-poppins">
                            {locale === 'fr' ? 'Ingrédients Naturels' : 'Natural Ingredients'}
                        </h3>
                        <p className="text-[#002F45] font-light leading-relaxed font-poppins">
                            {locale === 'fr'
                                ? 'Notre formule contient des ingrédients soigneusement sélectionnés pour nourrir et protéger vos cheveux naturellement.'
                                : 'Our formula contains carefully selected ingredients to nourish and protect your hair naturally.'
                            }
                        </p>
                        {/* Add actual ingredients list here */}
                    </div>
                )}

                {/* Usage Content */}
                {activeTab === 'usage' && (
                    <div className="max-w-4xl mx-auto text-center">
                        <h3 className="text-2xl font-semibold text-[#002F45] mb-6 font-poppins">
                            {locale === 'fr' ? 'Mode d\'emploi' : 'How to Use'}
                        </h3>
                        <div className="text-left space-y-4">
                            <div className="flex items-start space-x-3">
                                <span className="flex-shrink-0 w-6 h-6 bg-[#002F45] text-white rounded-full flex items-center justify-center text-sm font-medium">1</span>
                                <p className="text-[#002F45] font-light font-poppins">
                                    {locale === 'fr'
                                        ? 'Mouillez abondamment vos cheveux avec de l\'eau tiède.'
                                        : 'Wet your hair thoroughly with lukewarm water.'
                                    }
                                </p>
                            </div>
                            <div className="flex items-start space-x-3">
                                <span className="flex-shrink-0 w-6 h-6 bg-[#002F45] text-white rounded-full flex items-center justify-center text-sm font-medium">2</span>
                                <p className="text-[#002F45] font-light font-poppins">
                                    {locale === 'fr'
                                        ? 'Appliquez une petite quantité de shampooing sur vos cheveux mouillés.'
                                        : 'Apply a small amount of shampoo to your wet hair.'
                                    }
                                </p>
                            </div>
                            <div className="flex items-start space-x-3">
                                <span className="flex-shrink-0 w-6 h-6 bg-[#002F45] text-white rounded-full flex items-center justify-center text-sm font-medium">3</span>
                                <p className="text-[#002F45] font-light font-poppins">
                                    {locale === 'fr'
                                        ? 'Massez doucement le cuir chevelu et les cheveux pour créer une mousse riche.'
                                        : 'Gently massage scalp and hair to create a rich lather.'
                                    }
                                </p>
                            </div>
                            <div className="flex items-start space-x-3">
                                <span className="flex-shrink-0 w-6 h-6 bg-[#002F45] text-white rounded-full flex items-center justify-center text-sm font-medium">4</span>
                                <p className="text-[#002F45] font-light font-poppins">
                                    {locale === 'fr'
                                        ? 'Rincez abondamment à l\'eau tiède et répétez si nécessaire.'
                                        : 'Rinse thoroughly with lukewarm water and repeat if necessary.'
                                    }
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}