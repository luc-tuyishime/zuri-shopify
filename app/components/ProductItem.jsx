import {Link} from '@remix-run/react';
import {Image, Money} from '@shopify/hydrogen';
import {useVariantUrl} from '~/lib/variants';
import {useLocale} from "~/hooks/useLocale.js";
import {memo, useCallback, useEffect, useMemo, useState} from "react";



function getReviewData(product) {
    if (!product || !product.metafields || !Array.isArray(product.metafields)) {
        return {
            rating: 0,
            count: 0
        };
    }

    const ratingMetafield = product.metafields.find(m => m && m.key === 'product_rating');
    const countMetafield = product.metafields.find(m => m && m.key === 'review_count');

    return {
        rating: ratingMetafield && ratingMetafield.value ? parseFloat(ratingMetafield.value) || 0 : 0,
        count: countMetafield && countMetafield.value ? parseInt(countMetafield.value) || 0 : 0
    };
}

/**
 * @param {{
 *   product:
 *     | CollectionItemFragment
 *     | ProductItemFragment
 *     | RecommendedProductFragment;
 *   loading?: 'eager' | 'lazy';
 * }}
 */
export const ProductItem = memo(function ProductItem({
                                                         product,
                                                         loading = 'lazy',
                                                         variant = 'rounded',
                                                         fetchpriority = 'auto'
                                                     }) {
    const { rating, count } = getReviewData(product);
    const variantUrl = useVariantUrl(product.handle);
    const image = product.featuredImage;
    const [locale] = useLocale();

    // PERFORMANCE: Optimize image URL (Shopify-safe)
    const optimizedImageSrc = useMemo(() => {
        if (!image?.url) return null;

        // Only optimize if it's a Shopify CDN URL
        if (image.url.includes('cdn.shopify.com') || image.url.includes('shopify.com')) {
            // Add Shopify image transformations - these are safe and widely supported
            const separator = image.url.includes('?') ? '&' : '?';
            return image.url + separator + 'width=400&format=webp&quality=85';
        }

        // Return original URL if not Shopify CDN
        return image.url;
    }, [image?.url]);

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
                backgroundColor: '#f8f9fa',
                // PERFORMANCE: CSS containment for better rendering
                contain: 'layout style paint',
                transform: 'translateZ(0)',
                backfaceVisibility: 'hidden'
            },
            container: {
                display: 'block',
                textDecoration: 'none',
                marginBottom: (isRounded || isRoundedText) ? '20px' : '0',
                // PERFORMANCE: Optimize container rendering
                contain: 'layout style',
                transform: 'translateZ(0)'
            },
            image: {
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center 10%',
                display: 'block',
                transition: 'transform 0.3s ease',
                // PERFORMANCE: Image rendering optimizations
                imageRendering: 'optimizeQuality',
                transform: 'translateZ(0)',
                backfaceVisibility: 'hidden'
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
                // PERFORMANCE: Badge optimizations
                transform: 'translateZ(0)',
                contain: 'layout style'
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
                {/* PERFORMANCE: Optimized image with proper attributes */}
                {image && (
                    <img
                        src={optimizedImageSrc}
                        alt={image.altText || product.title}
                        loading={loading}
                        fetchpriority={fetchpriority}
                        style={styles.image}
                        className="group-hover:scale-105"
                        // PERFORMANCE: Critical image attributes
                        decoding="async"
                        sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        // PERFORMANCE: Provide width/height hints to prevent layout shift
                        width="400"
                        height={variant === 'roundedText' ? "560" : "400"}
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
                                        className={`w-3 h-3 sm:w-4 sm:h-4 fill-current transition-colors ${
                                            i < Math.floor(rating)
                                                ? 'text-yellow-400'
                                                : i < rating
                                                    ? 'text-yellow-300' // For half stars
                                                    : 'text-gray-300'
                                        }`}
                                        viewBox="0 0 20 20"
                                        aria-hidden="true"
                                        style={{ transform: 'translateZ(0)', contain: 'layout style' }}
                                    >
                                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                                    </svg>
                                ))}
                            </div>
                            <span className="ml-1 sm:ml-2 text-xs sm:text-sm text-gray-600">
                       {count > 0
                           ? (locale === 'fr'
                               ? `${count} avis${count !== 1 ? '' : ''}`  // French: "avis" is same for singular/plural
                               : `${count} review${count !== 1 ? 's' : ''}`)  // English: review/reviews
                           : (locale === 'fr'
                               ? 'Aucun avis pour le moment'
                               : 'No reviews yet')
                       }
                        </span>
                        </div>

                        {/* Responsive Price */}
                        <div className="font-semibold font-poppins text-lg sm:text-xl lg:text-2xl text-[#002F45] mb-3 sm:mb-4">
                            {formattedPrice}
                        </div>
                    </div>

                    {/* Responsive Button */}
                    <button
                        className="product-button w-full px-3 py-2 sm:px-4 sm:py-3 bg-white border rounded-lg font-poppins text-xs sm:text-sm border-[#002F45] text-[#002F45] font-medium hover:bg-gray-900 hover:text-white transition-colors duration-200 active:scale-95"
                        // PERFORMANCE: Button optimizations
                        style={{ transform: 'translateZ(0)', contain: 'layout style' }}
                    >
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

                    <div className="flex items-center justify-center mb-2 flex-wrap">
                        <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                                <svg
                                    key={i}
                                    className={`w-3 h-3 sm:w-4 sm:h-4 fill-current transition-colors ${
                                        i < Math.floor(rating)
                                            ? 'text-yellow-400'
                                            : i < rating
                                                ? 'text-yellow-300' // For half stars
                                                : 'text-gray-300'
                                    }`}
                                    viewBox="0 0 20 20"
                                    aria-hidden="true"
                                    style={{ transform: 'translateZ(0)', contain: 'layout style' }}
                                >
                                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                                </svg>
                            ))}
                        </div>
                        <span className="ml-1 sm:ml-2 text-xs sm:text-sm text-gray-600">
                       {count > 0
                           ? (locale === 'fr'
                               ? `${count} avis${count !== 1 ? '' : ''}`  // French: "avis" is same for singular/plural
                               : `${count} review${count !== 1 ? 's' : ''}`)  // English: review/reviews
                           : (locale === 'fr'
                               ? 'Aucun avis pour le moment'
                               : 'No reviews yet')
                       }
                        </span>
                    </div>

                    {/* Show rating number if you want */}
                    {/*{rating > 0 && (*/}
                    {/*    <div className="text-xs text-gray-500 mb-1">*/}
                    {/*        {rating.toFixed(1)} / 5.0*/}
                    {/*    </div>*/}
                    {/*)}*/}

                    {/* Responsive Price */}
                    <div className="font-semibold font-poppins text-base sm:text-lg md:text-xl -mb-4 sm:-mb-4 text-[#0D2936]">
                        {formattedPrice}
                    </div>

                    <button
                        className="product-button w-full px-3 py-2 sm:px-4 sm:py-3 bg-white border rounded-lg font-poppins text-xs sm:text-sm border-[#002F45] text-[#002F45] font-medium hover:bg-gray-900 hover:text-white transition-colors duration-200 active:scale-95"
                        // PERFORMANCE: Button optimizations
                        style={{ transform: 'translateY(-16px) translateZ(0)', contain: 'layout style' }}
                    >
                        {locale === 'fr' ? 'VOIR LE PRODUIT' : 'VIEW PRODUCT'}
                    </button>
                </div>
            )}

            {/* PERFORMANCE: Optimized styles */}
            <style dangerouslySetInnerHTML={{
                __html: `
                /* PERFORMANCE: Reduce motion for better performance */
                @media (prefers-reduced-motion: reduce) {
                    .product-item * {
                        animation: none !important;
                        transition: none !important;
                    }
                    
                    .product-item .group-hover\\:scale-105:hover {
                        transform: none !important;
                    }
                }

                /* PERFORMANCE: Mobile optimizations */
                @media (max-width: 768px) {
                    .product-item {
                        contain: layout style;
                        transform: translateZ(0);
                    }
                    
                    .product-item img {
                        image-rendering: optimizeSpeed;
                    }
                }

                /* PERFORMANCE: Optimize hover effects for capable devices only */
                @media (hover: hover) and (pointer: fine) {
                    .product-item:hover {
                        /* Only apply expensive effects on devices that can handle them */
                        will-change: transform;
                    }
                }

                /* PERFORMANCE: Data saver mode */
                @media (prefers-reduced-data: reduce) {
                    .product-item img {
                        /* Use original image if user prefers reduced data */
                        content-visibility: auto;
                    }
                }
                `
            }} />
        </Link>
    );
});
/** @typedef {import('storefrontapi.generated').ProductItemFragment} ProductItemFragment */
/** @typedef {import('storefrontapi.generated').CollectionItemFragment} CollectionItemFragment */
/** @typedef {import('storefrontapi.generated').RecommendedProductFragment} RecommendedProductFragment */