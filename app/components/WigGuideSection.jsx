import {useTranslation} from "~/lib/i18n.js";
import {useLocale} from "~/hooks/useLocale.js";

export function WigGuideSection({ collection }) {
    const [locale] = useLocale();
    const t = useTranslation(locale);

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

    const getLocalizedContent = (baseKey, fallbackKey) => {
        const localizedField = getMetafield(`${baseKey}_${locale}`);
        if (localizedField?.value) return localizedField.value;

        const defaultField = getMetafield(baseKey);
        if (defaultField?.value) return defaultField.value;

        return fallbackKey || '';
    };

    const sectionTitle = getLocalizedContent(
        'guide_title',
        locale === 'fr'
            ? 'Comment Choisir Votre Perruque Parfaite'
            : 'How To Choose Your Perfect Wig'
    );

    const step4Text = getLocalizedContent(
        'guide_step_4_text',
        locale === 'fr' ? 'Étape 4' : 'Step 4'
    );

    const step4Image = getMetafield('guide_step_4_image')?.reference?.image?.url;

    return (
        <div className="wig-guide-section bg-white py-16">
            <div className="container mx-auto px-4 md:px-14">
                {/* Section title - left aligned on mobile, centered on desktop */}
                <div className="text-left md:text-center mb-5 md:mb-14">
                    <p className="text-2xl md:text-[45px] leading-tight font-poppins font-regular">
                        {sectionTitle}
                    </p>
                </div>

                {/* Only Step 4 - full width on mobile with left alignment */}
                <div className="flex justify-start md:justify-center">
                    <div className="step-card relative w-full md:w-5/6 lg:w-2/3 xl:w-3/5">
                        <div className="w-full relative overflow-hidden rounded-lg">
                            {step4Image ? (
                                <div className="relative">
                                    <img
                                        src={step4Image}
                                        alt="Wig guide step"
                                        className="w-full h-auto object-cover md:object-contain rounded-lg"
                                        onLoad={(e) => {
                                            console.log('Image dimensions:', e.target.naturalWidth, 'x', e.target.naturalHeight);
                                        }}
                                    />

                                    {/* Text overlay positioned absolutely over the image */}
                                    {/*{step4Text && (*/}
                                    {/*    <div className="absolute inset-0 flex items-end justify-end">*/}
                                    {/*        <span className="text-white text-xl font-poppins font-medium text-center px-4 py-3 m-4 bg-black bg-opacity-50 rounded-lg backdrop-blur-sm">*/}
                                    {/*            {step4Text}*/}
                                    {/*        </span>*/}
                                    {/*    </div>*/}
                                    {/*)}*/}
                                </div>
                            ) : (
                                <div className="w-full h-80 bg-gray-200 flex items-center justify-center">
                                    <span className="text-gray-500">No image available</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @media (max-width: 768px) {
                    .wig-guide-section {
                        padding-left: 0;
                        padding-right: 0;
                    }
                    
                    .wig-guide-section .container {
                        padding-left: 0;
                        padding-right: 0;
                        max-width: 100%;
                    }
                    
                    .step-card {
                        margin-left: 0;
                        margin-right: 0;
                    }
                    
                    .step-card .w-full {
                        border-radius: 0;
                    }
                }
            `}</style>
        </div>
    );
}