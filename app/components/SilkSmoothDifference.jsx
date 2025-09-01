import { useLocale } from '~/hooks/useLocale';

export function SilkSmoothDifference({ product }) {
    console.log('SilkSmoothDifference', product);
    const [locale] = useLocale();

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

        // Check for section title metafields
        const hasSectionTitle = getMetafield(`difference_section_title_${locale}`) ||
            getMetafield('difference_section_title');

        // Check for statistics metafields (check up to 5 statistics)
        let hasStatistics = false;
        for (let i = 1; i <= 5; i++) {
            const hasPercentage = getMetafield(`statistic_${i}_percentage_${locale}`) ||
                getMetafield(`statistic_${i}_percentage`);
            const hasTitle = getMetafield(`statistic_${i}_title_${locale}`) ||
                getMetafield(`statistic_${i}_title`);

            if (hasPercentage || hasTitle) {
                hasStatistics = true;
                break;
            }
        }

        console.log('SilkSmoothDifference metafields check:', {
            hasSectionTitle,
            hasStatistics,
            hasAnyRelevant: hasSectionTitle || hasStatistics
        });

        // Return true if we have either section title OR statistics metafields
        return hasSectionTitle || hasStatistics;
    };

    // Early return - don't render component if no relevant metafields exist
    if (!hasRelevantMetafields()) {
        console.log('SilkSmoothDifference: No relevant metafields found, hiding component');
        return null;
    }

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

    // Get section title
    const sectionTitle = getLocalizedContent(
        'difference_section_title',
        locale === 'fr' ? 'LA DIFFÉRENCE SILK SMOOTH' : 'THE SILK SMOOTH DIFFERENCE'
    );

    // Get statistics data from metafields
    const getStatisticsData = () => {
        const statisticsData = [];

        // Try to get up to 5 statistics from metafields
        for (let i = 1; i <= 5; i++) {
            const percentage = getLocalizedContent(`statistic_${i}_percentage`, '');
            const title = getLocalizedContent(`statistic_${i}_title`, '');

            if (percentage || title) {
                statisticsData.push({ percentage, title });
            }
        }

        return statisticsData;
    };

    const statistics = getStatisticsData();

    // If we have metafields but no valid statistics data, don't render
    if (statistics.length === 0) {
        console.log('SilkSmoothDifference: No valid statistics data, hiding component');
        return null;
    }

    return (
        <div className="py-16">
            <div className="container mx-auto px-4">
                {/* Section Title */}
                <div className="mb-12">
                    <h2 className="text-[16px] font-light text-[#0D2936] tracking-wider uppercase mb-8">
                        {sectionTitle}
                    </h2>
                </div>

                {/* Statistics Grid */}
                <div className={`grid grid-cols-1 gap-8 ${
                    statistics.length === 1 ? 'md:grid-cols-1 max-w-2xl mx-auto' :
                        statistics.length === 2 ? 'md:grid-cols-2 max-w-4xl mx-auto' :
                            statistics.length === 3 ? 'md:grid-cols-3' :
                                statistics.length === 4 ? 'md:grid-cols-2 lg:grid-cols-4' :
                                    'md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5'
                }`}>
                    {statistics.map((stat, index) => (
                        <div key={index} className="flex items-start space-x-6">
                            {/* Large Percentage */}
                            <div className="flex-shrink-0">
                                <span className="text-[48px] md:text-7xl font-light text-[#0D2936] font-poppins">
                                    {stat.percentage}
                                </span>
                            </div>

                            {/* Description Text */}
                            <p className="text-[#0D2936] leading-relaxed font-light font-poppins text-[16px] md:text-base flex-1">
                                {stat.title}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}