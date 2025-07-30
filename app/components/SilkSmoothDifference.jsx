import { useLocale } from '~/hooks/useLocale';

export function SilkSmoothDifference({ product }) {
    console.log('SilkSmoothDifference', product);
    const [locale] = useLocale();
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

    // Get section title
    const sectionTitle = getLocalizedContent(
        'difference_section_title',
        locale === 'fr' ? 'LA DIFFÉRENCE SILK SMOOTH' : 'THE SILK SMOOTH DIFFERENCE'
    );

    // Get statistics data from metafields or use defaults
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

        // If no metafields found, use default statistics
        if (statisticsData.length === 0) {
            return [
                {
                    percentage: '85%',
                    title: locale === 'fr'
                        ? 'Des utilisateurs ont signalé des cheveux plus lisses et plus maniables après avoir utilisé le shampooing Silk Smooth.*'
                        : 'Of users reported smoother, more manageable hair after using Silk Smooth Shampoo.*'
                },
                {
                    percentage: '90%',
                    title: locale === 'fr'
                        ? 'Des utilisateurs ont remarqué une amélioration visible de l\'éclat naturel de leurs cheveux après avoir intégré Silk Smooth dans leur routine.*'
                        : 'Of users noticed a visible improvement in their hair\'s natural shine after incorporating Silk Smooth into their routine.*'
                },
                {
                    percentage: '92%',
                    title: locale === 'fr'
                        ? 'Des utilisateurs recommanderaient le shampooing Silk Smooth à un ami ou un membre de la famille pour sa formule douce mais efficace.*'
                        : 'Of users would recommend Silk Smooth Shampoo to a friend or family member for its gentle yet effective formula.*'
                }
            ];
        }

        return statisticsData;
    };


    const statistics = getStatisticsData();

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