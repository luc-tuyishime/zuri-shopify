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

    // Get content from metafields with fallbacks
    const sectionTitle = getMetafield('guide_title')?.value || t.homepage.howToChoose || 'How To Choose Your Perfect Wig';
    const sectionDescription = getMetafield('guide_description')?.value || t.homepage.discoverConfidence || 'Discover confidence in every strand with our expert guidance.';

    // Get step content
    const getStepContent = (stepNumber) => {
        const stepText = getMetafield(`guide_step_${stepNumber}_text`)?.value || `Step ${stepNumber}`;
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

    // Default colors for steps (can be overridden with metafields if needed)
    const stepColors = ['#E8B4A0', '#D4A574', '#5C2E1C', '#E8C4A0'];

    return (
        <div className="wig-guide-section bg-white py-16">
            <div className="container mx-auto px-14">
                {/* Top section with title and description */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
                    {/* Left side - Title */}
                    <div>
                        <h2 className="text-[45px] font-poppins font-regular text-[#000000] leading-tight">
                            {sectionTitle}
                        </h2>
                    </div>

                    {/* Right side - Description */}
                    <div className="flex items-center">
                        <p className="text-[19px] font-poppins font-regular text-[#542C17] leading-relaxed">
                            {sectionDescription}
                        </p>
                    </div>
                </div>

                {/* Steps section */}
                <div className="steps-container">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        {/* Step 1 */}
                        <div className="step-card relative">
                            <div
                                className="w-full h-80 bg-cover bg-center flex items-center justify-center relative"
                                style={{
                                    backgroundImage: step1.image ? `url(${step1.image})` : "url('')",
                                }}
                            >
                                <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                                <span className="relative z-10 text-white text-xl font-poppins font-medium text-center px-4">
                                    {step1.text}
                                </span>
                            </div>
                        </div>

                        {/* Step 2 */}
                        <div className="step-card relative">
                            <div
                                className="w-full h-80 bg-cover bg-center flex items-center justify-center relative"
                                style={{
                                    backgroundImage: step2.image ? `url(${step2.image})` : "url('')",
                                }}
                            >
                                <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                                <span className="relative z-10 text-white text-xl font-poppins font-medium text-center px-4">
                                    {step2.text}
                                </span>
                            </div>
                        </div>

                        {/* Step 3 */}
                        <div className="step-card relative">
                            <div
                                className="w-full h-80 bg-cover bg-center flex items-center justify-center relative"
                                style={{
                                    backgroundImage: step3.image ? `url(${step3.image})` : "url('')",
                                }}
                            >
                                <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                                <span className="relative z-10 text-white text-xl font-poppins font-medium text-center px-4">
                                    {step3.text}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Bottom row - 1 centered step */}
                    <div className="flex justify-center">
                        <div className="step-card relative w-full md:w-5/6 lg:w-2/3 xl:w-3/5">
                            <div
                                className="w-full h-80 bg-cover bg-center flex items-center justify-center relative"
                                style={{
                                    backgroundImage: step4.image ? `url(${step4.image})` : "url('')",
                                }}
                            >
                                <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                                <span className="relative z-10 text-white text-xl font-poppins font-medium text-center px-4">
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