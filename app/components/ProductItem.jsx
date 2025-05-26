import {Link} from '@remix-run/react';
import {Image, Money} from '@shopify/hydrogen';
import {useVariantUrl} from '~/lib/variants';

/**
 * @param {{
 *   product:
 *     | CollectionItemFragment
 *     | ProductItemFragment
 *     | RecommendedProductFragment;
 *   loading?: 'eager' | 'lazy';
 * }}
 */
export function ProductItem({product, loading}) {
    const variantUrl = useVariantUrl(product.handle);
    const image = product.featuredImage;
    return (
        <Link
            className="product-item"
            key={product.id}
            prefetch="intent"
            to={variantUrl}
            style={{
                display: 'block',
                textDecoration: 'none',
                marginBottom: '20px'
            }}
        >
            <div style={{
                overflow: 'hidden',
                borderRadius: '999px 999px 0 0',
                aspectRatio: '1/1',
                position: 'relative'
            }}>
                {image && (
                    <img
                        src={image.url}
                        alt={image.altText || product.title}
                        loading={loading}
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            objectPosition: 'center 10%', // This should work now
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
        </Link>
    );
}

/** @typedef {import('storefrontapi.generated').ProductItemFragment} ProductItemFragment */
/** @typedef {import('storefrontapi.generated').CollectionItemFragment} CollectionItemFragment */
/** @typedef {import('storefrontapi.generated').RecommendedProductFragment} RecommendedProductFragment */
