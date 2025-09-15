import {useTranslation} from "~/lib/i18n.js";
import {useLocale} from "~/hooks/useLocale.js";

export function WigGuideSection({ collection }) {
    const [locale] = useLocale();
    const t = useTranslation(locale);

    // Helper function to get metafield with null safety
    const getMetafield = (key, namespace = 'custom') => {
        try {
            if (!collection?.metafields || !Array.isArray(collection.metafields)) {
                return null;
            }

            return collection.metafields.find(
                metafield => metafield &&
                    metafield.key === key &&
                    metafield.namespace === namespace
            );
        } catch (error) {
            console.warn('Error getting metafield:', error);
            return null;
        }
    };

    // Get localized content with fallbacks
    const getLocalizedContent = (baseKey, fallbackKey) => {
        // Try language-specific metafield first
        const localizedField = getMetafield(`${baseKey}_${locale}`);
        if (localizedField?.value) return localizedField.value;

        // Fall back to default metafield (usually English)
        const defaultField = getMetafield(baseKey);
        if (defaultField?.value) return defaultField.value;

        // Final fallback to translation file
        return fallbackKey || '';
    };

    // Get section title and description with proper fallbacks
    const sectionTitle = getLocalizedContent(
        'guide_title',
        locale === 'fr'
            ? 'Comment Choisir Votre Perruque Parfaite'
            : 'How To Choose Your Perfect Wig'
    );

    const sectionDescription = getLocalizedContent(
        'guide_description',
        locale === 'fr'
            ? 'Découvrez la confiance dans chaque mèche avec nos conseils d\'experts.'
            : 'Discover confidence in every strand with our expert guidance.'
    );

    // Get step content with localization
    const getStepContent = (stepNumber) => {
        const stepText = getLocalizedContent(
            `guide_step_${stepNumber}_text`,
            locale === 'fr' ? `Étape ${stepNumber}` : `Step ${stepNumber}`
        );

        const stepImage = getMetafield(`guide_step_${stepNumber}_image`)?.reference?.image?.url;

        return {
            text: stepText,
            image: stepImage
        };
    };

    const step1 = getStepContent(1);
    const step2 = getStepContent(2);
    const step3 = getStepContent(3);
    const step4 = getStepContent(4);

    return (
        <div className="wig-guide-section bg-white py-16">
            <div className="container mx-auto px-14">
                {/* Top section with title and description */}
                <div className="grid text-center  gap-12 mb-16">
                    {/* Left side - Title */}
                    <div>
                        <h2 className="text-[45px] font-poppins font-regular text-[#000000] leading-tight">
                            {sectionTitle}
                        </h2>
                    </div>

                    {/* Right side - Description */}
                    {/*<div className="flex items-center">*/}
                    {/*    <p className="text-[19px] font-poppins font-regular text-[#542C17] leading-relaxed">*/}
                    {/*        {sectionDescription}*/}
                    {/*    </p>*/}
                    {/*</div>*/}
                </div>

                {/* Steps section */}
                <div className="steps-container">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        {/* Step 1 */}
                        {/*<div className="step-card relative">*/}
                        {/*    <div*/}
                        {/*        className="w-full h-80 bg-cover bg-center flex items-end justify-end relative"*/}
                        {/*        style={{*/}
                        {/*            backgroundImage: step1.image ? `url(${step1.image})` : "url('')",*/}
                        {/*            backgroundPosition: 'center 30%',*/}
                        {/*        }}*/}
                        {/*    >*/}
                        {/*        <span className="relative z-10 text-white text-xl font-poppins font-medium text-center px-4 py-3 m-4 bg-black bg-opacity-20 rounded-lg">*/}
                        {/*            {step1.text}*/}
                        {/*        </span>*/}
                        {/*    </div>*/}
                        {/*</div>*/}

                        {/* Step 2 */}
                        {/*<div className="step-card relative">*/}
                        {/*    <div*/}
                        {/*        className="w-full h-80 bg-cover bg-center flex items-end justify-end relative"*/}
                        {/*        style={{*/}
                        {/*            backgroundImage: step2.image ? `url(${step2.image})` : "url('')",*/}
                        {/*            backgroundPosition: 'center 30%',*/}
                        {/*        }}*/}
                        {/*    >*/}
                        {/*        <span className="relative z-10 text-white text-xl font-poppins font-medium text-center px-4 py-3 m-4 bg-black bg-opacity-20 rounded-lg">*/}
                        {/*            {step2.text}*/}
                        {/*        </span>*/}
                        {/*    </div>*/}
                        {/*</div>*/}

                        {/* Step 3 */}
                        {/*<div className="step-card relative">*/}
                        {/*    <div*/}
                        {/*        className="w-full h-80 bg-cover bg-center flex items-end justify-end relative"*/}
                        {/*        style={{*/}
                        {/*            backgroundImage: step3.image ? `url(${step3.image})` : "url('')",*/}
                        {/*            backgroundPosition: 'center 30%',*/}
                        {/*        }}*/}
                        {/*    >*/}
                        {/*        <span className="relative z-10 text-white text-xl font-poppins font-medium text-center px-4 py-3 m-4 bg-black bg-opacity-20 rounded-lg">*/}
                        {/*            {step3.text}*/}
                        {/*        </span>*/}
                        {/*    </div>*/}
                        {/*</div>*/}
                    </div>

                    {/* Bottom row - 1 centered step */}
                    <div className="flex justify-center">
                        <div className="step-card relative w-full md:w-5/6 lg:w-2/3 xl:w-3/5">
                            <div
                                className="w-full h-80 bg-cover bg-center flex items-end justify-end relative"
                                style={{
                                    backgroundImage: step4.image ? `url(${step4.image})` : "url('')",
                                    backgroundPosition: 'center 25%',
                                }}
                            >
                                <span className="relative z-10 text-white text-xl font-poppins font-medium text-center px-4 py-3 m-4 bg-black bg-opacity-20 rounded-lg">
                                    {step4.text}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}