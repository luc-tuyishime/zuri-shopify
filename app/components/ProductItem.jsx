import {Link} from '@remix-run/react';
import {Image, Money, CartForm} from '@shopify/hydrogen';
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
                                                         fetchpriority = 'auto',
                                                         open // Add open function as prop
                                                     }) {
    const { rating, count } = getReviewData(product);
    const variantUrl = useVariantUrl(product.handle);
    const image = product.featuredImage;
    const [locale] = useLocale();

    // Get the first available variant for add to cart
    const selectedVariant = useMemo(() => {
        const variant = product.variants?.nodes?.[0] || null;

        // Debug logging - let's see ALL available fields
        console.log('Product:', product.title);
        console.log('Selected variant FULL OBJECT:', JSON.stringify(variant, null, 2));

        return variant;
    }, [product.variants, product.title]);

    // Add to cart handler using the same logic as your AddToCartButton
    const handleAddToCart = useCallback((e) => {
        console.log('🛒 Adding to cart:', {
            lines: selectedVariant ? [{
                merchandiseId: selectedVariant.id,
                quantity: 1,
                productTitle: product.title,
                variantTitle: selectedVariant.title
            }] : []
        });

        // Don't open cart immediately - let the form submit first
        // The cart will open after successful submission
    }, [selectedVariant, product.title]);

    // Prepare lines for CartForm (same as your AddToCartButton)
    const cartLines = useMemo(() => {
        // Create a mock variant if selectedVariant is null
        const variantToUse = selectedVariant || {
            id: `gid://shopify/ProductVariant/${product.id.split('/').pop()}-default`,
            price: product.priceRange?.minVariantPrice,
            availableForSale: true
        };

        return [
            {
                merchandiseId: variantToUse.id,
                quantity: 1,
                selectedVariant: {
                    ...variantToUse,
                    product: {
                        handle: product.handle,
                        title: product.title,
                        featuredImage: product.featuredImage
                    }
                }
            }
        ];
    }, [selectedVariant, product]);

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

    console.log('🔍 Debug for product:', product.title);
    console.log('Product.variants:', product.variants);
    console.log('Product.variants?.nodes:', product.variants?.nodes);
    console.log('Selected variant:', selectedVariant);
    console.log('Product tags:', product.tags);
    console.log('Has sold-out tag:', product.tags?.includes('sold-out'));
    console.log('Button should be disabled?', !selectedVariant || product.tags?.includes('sold-out'));

// Also add this to see the FULL product object structure:
    console.log('FULL PRODUCT OBJECT:', JSON.stringify(product, null, 2));

    return (
        <div className="product-item group" style={styles.container}>
            {/* Image Container with responsive hover effects */}
            <Link to={variantUrl} prefetch="intent">
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
            </Link>

            {/* Product Info for Collection Variant - Fully Responsive */}
            {variant === 'collection' && (
                <div className="product-info p-3 sm:p-4">
                    <div className="product-content">
                        {/* Responsive Title */}
                        <h3 className="font-regular font-poppins text-base sm:text-lg lg:text-xl text-[#002F45] mb-2 leading-tight overflow-hidden whitespace-nowrap text-ellipsis">
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
                            {locale === 'fr' ? `A partir de ${formattedPrice}` : `From ${formattedPrice}`}
                        </div>
                    </div>

                    {/* Two Buttons Side by Side */}
                    <div className="flex gap-2 sm:gap-3">
                        {/* View Product Button */}
                        <Link
                            to={variantUrl}
                            prefetch="intent"
                            className="flex-1 px-2 py-2 sm:px-3 sm:py-3 bg-white border rounded-lg font-poppins text-xs sm:text-sm border-[#002F45] text-[#002F45] font-medium hover:bg-gray-900 hover:text-white transition-colors duration-200 active:scale-95 flex items-center justify-center"
                            style={{ transform: 'translateZ(0)', contain: 'layout style' }}
                        >
                            {locale === 'fr' ? 'VOIR' : 'VIEW'}
                        </Link>

                        {/* Add to Cart Button */}
                        <CartForm route="/cart" inputs={{lines: cartLines}} action={CartForm.ACTIONS.LinesAdd}>
                            {(fetcher) => {
                                // Open cart when submission is successful
                                useEffect(() => {
                                    if (fetcher.state === 'idle' && fetcher.data && open) {
                                        open('cart');
                                    }
                                }, [fetcher.state, fetcher.data]);

                                return (
                                    <button
                                        type="submit"
                                        onClick={handleAddToCart}
                                        disabled={!selectedVariant || product.tags?.includes('sold-out') || fetcher.state !== 'idle'}
                                        className={`flex-1 px-2 py-2 sm:px-3 sm:py-3 bg-[#002F45] border rounded-lg font-poppins text-xs sm:text-sm border-[#002F45] text-white font-medium hover:bg-gray-900 hover:border-gray-900 transition-colors duration-200 active:scale-95 ${
                                            (!selectedVariant || product.tags?.includes('sold-out') || fetcher.state !== 'idle') ? 'opacity-50 cursor-not-allowed' : ''
                                        }`}
                                        style={{ transform: 'translateZ(0)', contain: 'layout style' }}
                                    >
                                        {!selectedVariant
                                            ? (locale === 'fr' ? 'NON DISPONIBLE' : 'UNAVAILABLE')
                                            : product.tags?.includes('sold-out')
                                                ? (locale === 'fr' ? 'ÉPUISÉ' : 'SOLD OUT')
                                                : fetcher.state !== 'idle'
                                                    ? (locale === 'fr' ? 'AJOUT...' : 'ADDING...')
                                                    : (locale === 'fr' ? 'AJOUTER AU PANIER' : 'ADD TO CART')
                                        }
                                    </button>
                                );
                            }}
                        </CartForm>
                    </div>
                </div>
            )}

            {/* Product Info for RoundedText Variant - Clean & Minimal */}
            {variant === 'roundedText' && (
                <div className="product-info p-2 sm:p-3 text-center">
                    {/* Responsive Title */}
                    <h3 className="font-light font-poppins text-sm sm:text-base md:text-lg text-[#002F45] mb-1 sm:mb-2 leading-tight overflow-hidden whitespace-nowrap text-ellipsis">
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

                    {/* Responsive Price */}
                    <div className="font-semibold font-poppins text-base sm:text-lg md:text-xl mb-2 sm:mb-3 text-[#0D2936]">
                        {locale === 'fr' ? `A partir de ${formattedPrice}` : `From ${formattedPrice}`}
                    </div>

                    {/* Two Buttons Side by Side for RoundedText variant */}
                    <div className="flex gap-2 sm:gap-3">
                        {/* View Product Button */}
                        <Link
                            to={variantUrl}
                            prefetch="intent"
                            className="flex-shrink-0 px-3 py-2 sm:px-4 sm:py-3 bg-white border rounded-lg font-poppins text-xs sm:text-sm border-[#002F45] text-[#002F45] font-medium hover:bg-gray-900 hover:text-white transition-colors duration-200 active:scale-95 flex items-center justify-center min-w-[60px]"
                            style={{ transform: 'translateZ(0)', contain: 'layout style' }}
                        >
                            {locale === 'fr' ? 'VOIR' : 'VIEW'}
                        </Link>

                        {/* Add to Cart Button using CartForm */}
                        <CartForm route="/cart" inputs={{lines: cartLines}} action={CartForm.ACTIONS.LinesAdd}>
                            {(fetcher) => {
                                // Open cart when submission is successful
                                useEffect(() => {
                                    if (fetcher.state === 'idle' && fetcher.data && open) {
                                        open('cart');
                                    }
                                }, [fetcher.state, fetcher.data]);

                                return (
                                    <button
                                        type="submit"
                                        onClick={handleAddToCart}
                                        disabled={product.tags?.includes('sold-out') || fetcher.state !== 'idle'}
                                        className={`flex-1 px-3 py-2 sm:px-4 sm:py-3 border rounded-lg font-poppins text-xs sm:text-sm transition-colors duration-200 active:scale-95 flex items-center justify-center ${
                                            (!selectedVariant || product.tags?.includes('sold-out') || fetcher.state !== 'idle')
                                                ? 'bg-gray-400 border-gray-400 text-white opacity-50 cursor-not-allowed'
                                                : 'bg-[#002F45] border-[#002F45] text-white font-medium hover:bg-gray-900 hover:border-gray-900'
                                        }`}
                                        style={{ transform: 'translateZ(0)', contain: 'layout style' }}
                                    >
                                        {product.tags?.includes('sold-out')
                                            ? (locale === 'fr' ? 'ÉPUISÉ' : 'SOLD OUT')
                                            : fetcher.state !== 'idle'
                                                ? (locale === 'fr' ? 'AJOUT..' : 'ADDING...')
                                                : (locale === 'fr' ? 'AJOUTER' : 'ADD TO CART')
                                        }
                                    </button>
                                );
                            }}
                        </CartForm>
                    </div>
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
        </div>
    );
});

/** @typedef {import('storefrontapi.generated').ProductItemFragment} ProductItemFragment */
/** @typedef {import('storefrontapi.generated').CollectionItemFragment} CollectionItemFragment */
/** @typedef {import('storefrontapi.generated').RecommendedProductFragment} RecommendedProductFragment */