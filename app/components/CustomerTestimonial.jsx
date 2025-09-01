import { useLocale } from '~/hooks/useLocale';
import IMAGE from '../assets/testimony.svg';

export function CustomerTestimonial({ product, testimonial, productImage }) {
    console.log(productImage);
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

    // Check if ANY relevant metafields exist
    const hasRelevantMetafields = () => {
        if (!product?.metafields || !Array.isArray(product.metafields)) {
            return false;
        }

        // Check for testimonial-related metafields
        const hasTestimonialQuote = getMetafield(`testimonial_quote_${locale}`) ||
            getMetafield('testimonial_quote');

        const hasTestimonialAuthor = getMetafield(`testimonial_author_${locale}`) ||
            getMetafield('testimonial_author');

        const hasTestimonialProduct = getMetafield(`testimonial_product_${locale}`) ||
            getMetafield('testimonial_product');

        const hasTestimonialImage = getMetafield('testimonial_image');

        console.log('CustomerTestimonial metafields check:', {
            hasTestimonialQuote,
            hasTestimonialAuthor,
            hasTestimonialProduct,
            hasTestimonialImage,
            hasTestimonialProp: Boolean(testimonial),
            hasAnyRelevant: hasTestimonialQuote || hasTestimonialAuthor || hasTestimonialProduct || hasTestimonialImage || Boolean(testimonial)
        });

        // Return true if we have any testimonial metafields OR the testimonial prop
        return hasTestimonialQuote || hasTestimonialAuthor || hasTestimonialProduct || hasTestimonialImage || Boolean(testimonial);
    };

    // Early return - don't render component if no relevant metafields or testimonial prop exist
    if (!hasRelevantMetafields()) {
        console.log('CustomerTestimonial: No relevant metafields or testimonial prop found, hiding component');
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

        // Final fallback to provided text (only if we have metafields)
        return fallbackText;
    };

    // Get testimonial image from metafields
    const getTestimonialImage = () => {
        const imageMetafield = getMetafield('testimonial_image');

        if (imageMetafield?.reference?.image?.url) {
            return imageMetafield.reference.image.url;
        }

        return productImage || IMAGE;
    };

    // Get testimonial content from metafields or props
    const getTestimonialContent = () => {
        // If testimonial prop is passed, use it (for backward compatibility)
        if (testimonial) {
            return testimonial;
        }

        // Otherwise, get from metafields (no fallback defaults since we checked for metafields existence)
        const quote = getLocalizedContent('testimonial_quote', '');
        const author = getLocalizedContent('testimonial_author', '');
        const productName = getLocalizedContent('testimonial_product', '');

        return {
            quote,
            author,
            product: productName
        };
    };

    const currentTestimonial = getTestimonialContent();
    const testimonialImage = getTestimonialImage();

    // Additional safety check - if we have metafields but no actual content, don't render
    if (!testimonial && (!currentTestimonial.quote || !currentTestimonial.author)) {
        console.log('CustomerTestimonial: No valid testimonial content found, hiding component');
        return null;
    }

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
                {/* Left Side - Image */}
                <div
                    className="order-2 lg:order-1 bg-cover bg-center bg-no-repeat min-h-[300px] sm:min-h-[400px] lg:min-h-full"
                    style={{
                        backgroundImage: `url(${testimonialImage})`,
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
                            {currentTestimonial.product && (
                                <div className="font-semibold text-[#0D2936] text-sm sm:text-base lg:text-[16px] font-poppins">
                                    {currentTestimonial.product}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}