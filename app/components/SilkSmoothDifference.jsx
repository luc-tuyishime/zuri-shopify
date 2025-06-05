import { useLocale } from '~/hooks/useLocale';

export function SilkSmoothDifference() {
    const [locale] = useLocale();

    const statistics = [
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

    return (
        <div className="py-16">
            <div className="container mx-auto px-4">
                {/* Section Title */}
                <div className="mb-12">
                    <h2 className="text-[16px] font-light text-[#0D2936] tracking-wider uppercase mb-8">
                        {locale === 'fr' ? 'LA DIFFÉRENCE SILK SMOOTH' : 'THE SILK SMOOTH DIFFERENCE'}
                    </h2>
                </div>

                {/* Statistics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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