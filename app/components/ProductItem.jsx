import {Link} from '@remix-run/react';
import {Image, Money} from '@shopify/hydrogen';
import {useVariantUrl} from '~/lib/variants';
import {useLocale} from "~/hooks/useLocale.js";

/**
 * @param {{
 *   product:
 *     | CollectionItemFragment
 *     | ProductItemFragment
 *     | RecommendedProductFragment;
 *   loading?: 'eager' | 'lazy';
 * }}
 */
export function ProductItem({product, loading, variant = 'rounded'}) {
    const variantUrl = useVariantUrl(product.handle);
    const image = product.featuredImage;
    const [locale] = useLocale();

    // Different styles based on variant
    const imageStyles = variant === 'rounded'
        ? {
            overflow: 'hidden',
            borderRadius: '999px 999px 0 0', // Rounded top for homepage
            aspectRatio: '1/1.4',
            position: 'relative'
        }
        : {
            overflow: 'hidden',
            borderRadius: '8px', // Square corners for collection page
            aspectRatio: '1/1',
            position: 'relative'
        };

    const containerStyles = variant === 'rounded'
        ? {
            display: 'block',
            textDecoration: 'none',
            marginBottom: '20px'
        }
        : {
            display: 'block',
            textDecoration: 'none',
            marginBottom: '0'
        };

    return (
        <Link
            className="product-item"
            key={product.id}
            prefetch="intent"
            to={variantUrl}
            style={containerStyles}
        >
            <div style={imageStyles}>
                {image && (
                    <img
                        src={image.url}
                        alt={image.altText || product.title}
                        loading={loading}
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            objectPosition: 'center 10%',
                            display: 'block'
                        }}
                    />
                )}

                {product.tags?.includes('featured') && (
                    <div style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        backgroundColor: '#00C176',
                        color: 'white',
                        borderRadius: '50%',
                        width: '30px',
                        height: '30px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 'bold'
                    }}>
                        F
                    </div>
                )}
            </div>

            {/* Product Info - Different layout for collection page */}
            {variant === 'collection' && (
                <div className="p-4">
                    <h3 className="font-regular font-poppins text-[20px] text-[#002F45] mb-2">
                        {product.title}
                    </h3>

                    {/* Rating */}
                    <div className="flex items-center mb-2">
                        <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                                <svg
                                    key={i}
                                    className="w-4 h-4 text-yellow-400 fill-current"
                                    viewBox="0 0 20 20"
                                >
                                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                                </svg>
                            ))}
                        </div>
                        <span className="ml-2 text-sm text-gray-600">123 reviews</span>
                    </div>

                    <div className="font-semibold font-poppins text-[20px] text-[#002F45]">
                        {product.priceRange.minVariantPrice.currencyCode === 'EUR' ? '€' : '$'}
                        {parseFloat(product.priceRange.minVariantPrice.amount).toFixed(2)}
                    </div>

                    <button className="w-full mt-4 px-4 py-2 bg-white border rounded-lg font-poppins text-[14px] border-[#002F45] text-[#002F45] font-medium hover:bg-gray-900 hover:text-white transition-colors duration-200">
                        {locale === 'fr' ? 'AJOUTER AU PANIER' : 'ADD TO CART'}
                    </button>
                </div>
            )}
        </Link>
    );
}

/** @typedef {import('storefrontapi.generated').ProductItemFragment} ProductItemFragment */
/** @typedef {import('storefrontapi.generated').CollectionItemFragment} CollectionItemFragment */
/** @typedef {import('storefrontapi.generated').RecommendedProductFragment} RecommendedProductFragment */
