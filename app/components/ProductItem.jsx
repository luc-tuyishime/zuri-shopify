import {Link} from '@remix-run/react';
import {Image, Money} from '@shopify/hydrogen';
import {useVariantUrl} from '~/lib/variants';
import {useLocale} from "~/hooks/useLocale.js";
import {memo, useMemo} from "react";

/**
 * @param {{
 *   product:
 *     | CollectionItemFragment
 *     | ProductItemFragment
 *     | RecommendedProductFragment;
 *   loading?: 'eager' | 'lazy';
 * }}
 */
export const ProductItem = memo(function ProductItem({ product, loading = 'lazy', variant = 'rounded' }) {
    const variantUrl = useVariantUrl(product.handle);
    const image = product.featuredImage;
    const [locale] = useLocale();

    // Memoize styles to prevent recalculation on every render
    const styles = useMemo(() => {
        const isRounded = variant === 'rounded';
        const isRoundedText = variant === 'roundedText';
        const isCollection = variant === 'collection';

        return {
            imageContainer: {
                overflow: 'hidden',
                borderRadius: (isRounded || isRoundedText) ? '999px 999px 0 0' : '8px',
                aspectRatio: (isRounded || isRoundedText) ? '1/1.4' : '1/1',
                position: 'relative',
                backgroundColor: '#f8f9fa', // Placeholder color while loading
            },
            container: {
                display: 'block',
                textDecoration: 'none',
                marginBottom: (isRounded || isRoundedText) ? '20px' : '0',
            },
            image: {
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center 10%',
                display: 'block',
                transition: 'transform 0.3s ease',
            },
            badge: {
                position: 'absolute',
                top: '8px',
                right: '8px',
                backgroundColor: '#00C176',
                color: 'white',
                borderRadius: '50%',
                width: '24px',
                height: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                fontSize: '12px',
                zIndex: 2,
            }
        };
    }, [variant]);

    // Memoize price calculation
    const formattedPrice = useMemo(() => {
        if (!product.priceRange?.minVariantPrice) return '';
        const { amount, currencyCode } = product.priceRange.minVariantPrice;
        const symbol = currencyCode === 'EUR' ? '€' : '$';
        return `${symbol}${parseFloat(amount).toFixed(2)}`;
    }, [product.priceRange]);

    // Check if product is featured
    const isFeatured = useMemo(() =>
            product.tags?.includes('featured'),
        [product.tags]
    );

    return (
        <Link
            className="product-item group"
            key={product.id}
            prefetch="intent"
            to={variantUrl}
            style={styles.container}
        >
            {/* Image Container with responsive hover effects */}
            <div
                style={styles.imageContainer}
                className="group-hover:shadow-lg transition-shadow duration-300"
            >
                {image && (
                    <img
                        src={image.url}
                        alt={image.altText || product.title}
                        loading={loading}
                        style={styles.image}
                        className="group-hover:scale-105"
                        // Performance: Add sizes for responsive images
                        sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                    />
                )}

                {/* Featured Badge - Responsive sizing */}
                {isFeatured && (
                    <div
                        style={styles.badge}
                        className="sm:w-8 sm:h-8 sm:text-sm"
                    >
                        F
                    </div>
                )}
            </div>

            {/* Product Info for Collection Variant - Fully Responsive */}
            {variant === 'collection' && (
                <div className="product-info p-3 sm:p-4">
                    <div className="product-content">
                        {/* Responsive Title */}
                        <h3 className="font-regular font-poppins text-base sm:text-lg lg:text-xl text-[#002F45] mb-2 line-clamp-1 leading-tight text-ellipsis">
                            {product.title}
                        </h3>

                        {/* Responsive Star Rating */}
                        <div className="flex items-center mb-2 flex-wrap">
                            <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                    <svg
                                        key={i}
                                        className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 fill-current"
                                        viewBox="0 0 20 20"
                                        aria-hidden="true"
                                    >
                                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                                    </svg>
                                ))}
                            </div>
                            <span className="ml-1 sm:ml-2 text-xs sm:text-sm text-gray-600">123 reviews</span>
                        </div>

                        {/* Responsive Price */}
                        <div className="font-semibold font-poppins text-lg sm:text-xl lg:text-2xl text-[#002F45] mb-3 sm:mb-4">
                            {formattedPrice}
                        </div>
                    </div>

                    {/* Responsive Button */}
                    <button className="product-button w-full px-3 py-2 sm:px-4 sm:py-3 bg-white border rounded-lg font-poppins text-xs sm:text-sm border-[#002F45] text-[#002F45] font-medium hover:bg-gray-900 hover:text-white transition-colors duration-200 active:scale-95">
                        {locale === 'fr' ? 'AJOUTER AU PANIER' : 'ADD TO CART'}
                    </button>
                </div>
            )}

            {/* Product Info for RoundedText Variant - Clean & Minimal */}
            {variant === 'roundedText' && (
                <div className="product-info p-2 sm:p-3 text-center">
                    {/* Responsive Title */}
                    <h3 className="font-light font-poppins text-sm sm:text-base md:text-lg text-[#002F45] mb-1 sm:mb-2 line-clamp-2 leading-tight">
                        {product.title}
                    </h3>

                    {/* Responsive Price */}
                    <div className="font-semibold font-poppins text-base sm:text-lg md:text-xl text-[#0D2936]">
                        {formattedPrice}
                    </div>
                </div>
            )}
        </Link>
    );
});

/** @typedef {import('storefrontapi.generated').ProductItemFragment} ProductItemFragment */
/** @typedef {import('storefrontapi.generated').CollectionItemFragment} CollectionItemFragment */
/** @typedef {import('storefrontapi.generated').RecommendedProductFragment} RecommendedProductFragment */