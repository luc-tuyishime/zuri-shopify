import { useLocale } from '~/hooks/useLocale';
import IMAGE from '../assets/testimony.svg';

export function CustomerTestimonial({ testimonial, productImage }) {
    const [locale] = useLocale();

    const defaultTestimonial = {
        quote: locale === 'fr'
            ? "Ce shampooing est parfait pour mon cuir chevelu sensible. Il nettoie en profondeur tout en gardant mes cheveux doux."
            : "This shampoo is perfect for my sensitive scalp. Cleans thoroughly while keeping my hair soft.",
        author: locale === 'fr' ? "Marie D." : "Jamie P.",
        product: locale === 'fr' ? "Shampooing Silk Smooth, Cliente" : "Silk Smooth Shampoo, Customer"
    };

    const currentTestimonial = testimonial || defaultTestimonial;

    return (
        <div className="bg-[#EBEBEB]" style={{
            width: '100vw',
            position: 'relative',
            left: '50%',
            right: '50%',
            marginLeft: '-50vw',
            marginRight: '-50vw'
        }}>
            <div className="grid grid-cols-1 lg:grid-cols-2" style={{ minHeight: '600px' }}>
                <div
                    className="order-2 lg:order-1 bg-cover bg-center bg-no-repeat min-h-[300px] sm:min-h-[400px] lg:min-h-full"
                    style={{
                        backgroundImage: `url(${productImage || IMAGE})`,

                    }}
                >
                </div>

                {/* Right Side - Testimonial */}
                <div className="order-1 lg:order-2 flex flex-col justify-center px-4 sm:px-6 lg:px-16 py-8 sm:py-12 lg:py-16">
                    <div className="max-w-lg">

                        {/* Quote */}
                        <blockquote className="mb-6 lg:mb-8">
                            <p className="text-2xl sm:text-3xl lg:text-[40px] md:text-3xl font-light text-[#0D2936] leading-relaxed font-poppins" style={{ lineHeight: '1.2' }}>
                                "{currentTestimonial.quote}"
                            </p>
                        </blockquote>

                        {/* Attribution */}
                        <div className="border-l-4 border-[#002F45] pl-4 lg:pl-6">
                            <div className="font-semibold text-[#0D2936] text-sm sm:text-base lg:text-[16px] font-poppins mb-1">
                                — {currentTestimonial.author}
                            </div>
                            <div className="font-semibold text-[#0D2936] text-sm sm:text-base lg:text-[16px] font-poppins">
                                {currentTestimonial.product}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}