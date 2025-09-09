import {useRef, useState} from "react";
import {useLocale} from "~/hooks/useLocale.js";

export function CustomerTestimonial({ product, testimonial, productImage }) {
    console.log(productImage);
    const [locale] = useLocale();
    const [mediaLoaded, setMediaLoaded] = useState(false);
    const videoRef = useRef(null);

    // Helper function to get metafield with null safety
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

    // Check if ANY relevant metafields exist - MUST BE CALLED EARLY
    const hasRelevantMetafields = () => {
        if (!product?.metafields || !Array.isArray(product.metafields)) {
            return Boolean(testimonial); // Only show if testimonial prop exists
        }

        const hasTestimonialQuote = getMetafield(`testimonial_quote_${locale}`) ||
            getMetafield('testimonial_quote');
        const hasTestimonialAuthor = getMetafield(`testimonial_author_${locale}`) ||
            getMetafield('testimonial_author');
        const hasTestimonialProduct = getMetafield(`testimonial_product_${locale}`) ||
            getMetafield('testimonial_product');
        const hasTestimonialImage = getMetafield('testimonial_image');
        const hasTestimonialVideo = getMetafield('testimonial_video');

        const hasAnyContent = hasTestimonialQuote || hasTestimonialAuthor || hasTestimonialProduct ||
            hasTestimonialImage || hasTestimonialVideo || Boolean(testimonial);

        console.log('CustomerTestimonial content check:', {
            hasQuote: !!hasTestimonialQuote,
            hasAuthor: !!hasTestimonialAuthor,
            hasProduct: !!hasTestimonialProduct,
            hasImage: !!hasTestimonialImage,
            hasVideo: !!hasTestimonialVideo,
            hasTestimonialProp: Boolean(testimonial),
            shouldShow: hasAnyContent
        });

        return hasAnyContent;
    };

    // EARLY RETURN - Add this check immediately
    if (!hasRelevantMetafields()) {
        console.log('CustomerTestimonial: No relevant metafields or testimonial prop found, hiding component');
        return null;
    }

    // Get testimonial media with video priority
    const getTestimonialMedia = () => {
        const videoMetafield = getMetafield('testimonial_video');
        if (videoMetafield?.value && typeof videoMetafield.value === 'string' && videoMetafield.value.trim()) {
            console.log('🎥 Using video metafield:', videoMetafield.value);
            return videoMetafield.value;
        }

        const imageMetafield = getMetafield('testimonial_image');

        if (imageMetafield?.reference?.image?.url) {
            console.log('📷 Using image reference:', imageMetafield.reference.image.url);
            return imageMetafield.reference.image.url;
        }

        if (imageMetafield?.value && typeof imageMetafield.value === 'string' && imageMetafield.value.startsWith('http')) {
            console.log('🔗 Using direct URL:', imageMetafield.value);
            return imageMetafield.value;
        }

        console.log('🔄 Using fallback image');
        return productImage || IMAGE;
    };

    // Determine media type
    const determineMediaType = () => {
        const videoMetafield = getMetafield('testimonial_video');
        if (videoMetafield?.value && typeof videoMetafield.value === 'string' && videoMetafield.value.trim()) {
            return 'video';
        }

        const imageMetafield = getMetafield('testimonial_image');
        if (imageMetafield?.value && typeof imageMetafield.value === 'string') {
            const url = imageMetafield.value.toLowerCase();
            const isVideo = url.includes('.mp4') ||
                url.includes('.webm') ||
                url.includes('.mov') ||
                url.includes('video/upload') ||
                url.includes('/video/') ||
                url.includes('youtube.com') ||
                url.includes('vimeo.com');

            if (isVideo) {
                return 'video';
            }
        }

        return 'image';
    };

    // Get localized content with fallback
    const getLocalizedContent = (baseKey, fallbackText = '') => {
        const localizedField = getMetafield(`${baseKey}_${locale}`);
        if (localizedField?.value) return localizedField.value;

        const defaultField = getMetafield(baseKey);
        if (defaultField?.value) return defaultField.value;

        return fallbackText;
    };

    // Get testimonial content from metafields or props
    const getTestimonialContent = () => {
        if (testimonial) {
            return testimonial;
        }

        const quote = getLocalizedContent('testimonial_quote');
        const author = getLocalizedContent('testimonial_author');
        const productName = getLocalizedContent('testimonial_product');

        return {
            quote,
            author,
            product: productName
        };
    };

    const currentTestimonial = getTestimonialContent();
    const testimonialMedia = getTestimonialMedia();
    const mediaType = determineMediaType();
    const isVideo = mediaType === 'video';

    // Additional safety check
    if (!testimonial && (!currentTestimonial.quote || !currentTestimonial.author)) {
        console.log('CustomerTestimonial: No valid testimonial content found, hiding component');
        return null;
    }

    const handleVideoError = () => {
        console.error('❌ Testimonial video failed to load:', testimonialMedia);
        setMediaLoaded(true); // Set to loaded to hide spinner even on error
    };

    // Fix for image loading - use img element instead of background-image for onLoad
    const handleImageLoad = () => {
        console.log('📷 Image loaded successfully');
        setMediaLoaded(true);
    };

    const handleImageError = () => {
        console.error('❌ Image failed to load:', testimonialMedia);
        setMediaLoaded(true); // Set to loaded to hide spinner even on error
    };

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
                {/* Left Side - Image or Video */}
                <div className="order-2 lg:order-1 relative min-h-[300px] sm:min-h-[400px] lg:min-h-full overflow-hidden">
                    {isVideo ? (
                        <video
                            ref={videoRef}
                            autoPlay
                            loop
                            muted
                            playsInline
                            className="absolute inset-0 w-full h-full object-cover"
                            style={{
                                opacity: mediaLoaded ? 1 : 0,
                                transition: 'opacity 1s ease'
                            }}
                            onLoadedData={() => setMediaLoaded(true)}
                            onCanPlay={() => setMediaLoaded(true)}
                            onError={handleVideoError}
                        >
                            <source src={testimonialMedia} type="video/mp4" />
                            <source src={testimonialMedia.replace('.mp4', '.webm')} type="video/webm" />
                        </video>
                    ) : (
                        <>
                            {/* Use img element for proper onLoad handling */}
                            <img
                                src={testimonialMedia}
                                alt="Customer testimonial"
                                className="absolute inset-0 w-full h-full object-cover"
                                style={{
                                    opacity: mediaLoaded ? 1 : 0,
                                    transition: 'opacity 1s ease'
                                }}
                                onLoad={handleImageLoad}
                                onError={handleImageError}
                            />
                        </>
                    )}

                    {/* Loading placeholder */}
                    {!mediaLoaded && (
                        <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
                            <div className="w-8 h-8 border-4 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
                        </div>
                    )}
                </div>

                {/* Right Side - Testimonial */}
                <div className="order-1 lg:order-2 flex flex-col justify-center px-4 sm:px-6 lg:px-16 py-8 sm:py-12 lg:py-16">
                    <div className="max-w-lg">
                        <blockquote className="mb-6 lg:mb-8">
                            <p className="text-2xl sm:text-3xl lg:text-[40px] md:text-3xl font-light text-[#0D2936] leading-relaxed font-poppins" style={{ lineHeight: '1.2' }}>
                                "{currentTestimonial.quote}"
                            </p>
                        </blockquote>

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