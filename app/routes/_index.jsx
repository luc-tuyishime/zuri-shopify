import {Await, useLoaderData, Link} from '@remix-run/react';
import {Suspense, useEffect, useState} from 'react';
import {Image} from '@shopify/hydrogen';
import {ProductItem} from '~/components/ProductItem';
import {WigGuideSection} from '~/components/WigGuideSection';
import {CustomerReviewsSection} from '~/components/CustomerReviewsSection';
import BG from '../assets/bg.svg'
import VIDEO from '../assets/video.mp4'
import {ProductSkeleton} from "~/components/ProductSkeleton.jsx";
import {getLocale, useTranslation} from "~/lib/i18n.js";
import {useLocale} from "~/hooks/useLocale.js";

/**
 * @type {MetaFunction}
 */
export const meta = () => {
  return [{title: 'Zuri | Home'}];
};

/**
 * @param {LoaderFunctionArgs} args
 */
export async function loader(args) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);

  return {...deferredData, ...criticalData};
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 * @param {LoaderFunctionArgs}
 */
async function loadCriticalData({context}) {
  const [{collections}] = await Promise.all([
    context.storefront.query(FEATURED_COLLECTION_QUERY),
    // Add other queries here, so that they are loaded in parallel
  ]);

  return {
    featuredCollection: collections.nodes[0],
  };
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 * @param {LoaderFunctionArgs}
 */
function loadDeferredData({context}) {
  const recommendedProducts = context.storefront
    .query(RECOMMENDED_PRODUCTS_QUERY)
    .catch((error) => {
      // Log query errors, but don't throw them so the page can still render
      console.error(error);
      return null;
    });

  return {
    recommendedProducts,
  };
}

export default function Homepage() {
  /** @type {LoaderReturnData} */
  const data = useLoaderData();
  return (
    <div className="home">
      <FeaturedCollection collection={data.featuredCollection} />
      <RecommendedProducts products={data.recommendedProducts} />
        <WigGuideSection />
        <CustomerReviewsSection />
    </div>
  );
}

/**
 * @param {{
 *   collection: FeaturedCollectionFragment;
 * }}
 */
function FeaturedCollection({collection}) {
    if (!collection) return null;

    return (
        <div
            className="featured-collection-container"
            style={{
                position: 'relative',
                width: '100vw',
                height: '100vh',
                margin: '0',
                padding: '0',
                left: '50%',
                right: '50%',
                marginLeft: '-50vw',
                marginRight: '-50vw',
                overflow: 'hidden'
            }}
        >
            {/* Background Video */}
            <video
                autoPlay
                loop
                muted
                playsInline
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    objectPosition: 'center',
                    zIndex: 1,
                    imageRendering: 'crisp-edges',
                    transform: 'translateZ(0)',
                    backfaceVisibility: 'hidden'
                }}
            >
                <source src={VIDEO} type="video/mp4" />
                {/* Fallback for browsers that don't support video */}
                <img
                    src={BG}
                    alt={collection.title}
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        objectPosition: 'center'
                    }}
                />
            </video>

            <Link
                to={`/collections/${collection.handle}`}
                style={{
                    display: 'block',
                    width: '100%',
                    height: '100%',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    zIndex: 2
                }}
            >
                {/* Content overlay positioned on the left side */}
                <div className="tracking-wider font-medium font-poppins" style={{
                    fontFamily: "'Poppins', sans-serif",
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    paddingLeft: '80px',
                }}>
                    {/* Title text styled as in the screenshot */}
                    <p className="tracking-wider font-medium" style={{
                        fontFamily: "'Poppins', sans-serif",
                        color: 'white',
                        fontSize: '45px',
                        maxWidth: '400px',
                        lineHeight: '1.2',
                        marginBottom: '30px'
                    }}>
                        A relevant title would go here
                    </p>

                    {/* Action button styled as in the screenshot */}
                    <div>
                        <button
                            style={{
                                fontFamily: "'Poppins', sans-serif",
                                color: 'white',
                                backgroundColor: 'transparent',
                                border: '1px solid white',
                                padding: '12px 30px',
                                fontSize: '0.9rem',
                                letterSpacing: '1px',
                                cursor: 'pointer',
                                fontWeight: '500',
                                transition: 'all 0.3s ease'
                            }}
                            onClick={(e) => {
                                e.preventDefault(); // Prevent Link navigation
                                // Add your button action here
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.backgroundColor = 'transparent';
                            }}
                        >
                            AN ACTION
                        </button>
                    </div>
                </div>
            </Link>
        </div>
    );
}
/**
 * @param {{
 *   products: Promise<RecommendedProductsQuery | null>;
 * }}
 */
export function RecommendedProducts({products}) {
    const [locale] = useLocale();
    const t = useTranslation(locale);

    return (
        <div className="recommended-products" >
            <div className="container-fluid mx-auto px-14" id="best-sellers" style={{ scrollMarginTop: '80px' }}>
                <p className="pt-10 pb-10 text-[45px] font-poppins font-regular"> {t.homepage.ourBestSellers}</p>

                <Suspense fallback={
                    <div className="recommended-products-grid grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {Array.from({ length: 8 }).map((_, index) => (
                            <ProductSkeleton key={index} />
                        ))}
                    </div>
                }>
                    <Await resolve={products}>
                        {(response) => (
                            <div className="recommended-products-grid grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                {response
                                    ? response.products.nodes.map((product) => (
                                        <ProductItem key={product.id} product={product}  variant="rounded" />
                                    ))
                                    : null}
                            </div>
                        )}
                    </Await>
                </Suspense>
            </div>
            <br />
        </div>
    );
}

const FEATURED_COLLECTION_QUERY = `#graphql
  fragment FeaturedCollection on Collection {
    id
    title
    image {
      id
      url
      altText
      width
      height
    }
    handle
  }
  query FeaturedCollection($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    collections(first: 1, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        ...FeaturedCollection
      }
    }
  }
`;

const RECOMMENDED_PRODUCTS_QUERY = `#graphql
  fragment RecommendedProduct on Product {
    id
    title
    handle
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
    featuredImage {
      id
      url
      altText
      width
      height
    }
  }
  query RecommendedProducts ($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    products(first: 8, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        ...RecommendedProduct
      }
    }
  }
`;

/** @typedef {import('@shopify/remix-oxygen').LoaderFunctionArgs} LoaderFunctionArgs */
/** @template T @typedef {import('@remix-run/react').MetaFunction<T>} MetaFunction */
/** @typedef {import('storefrontapi.generated').FeaturedCollectionFragment} FeaturedCollectionFragment */
/** @typedef {import('storefrontapi.generated').RecommendedProductsQuery} RecommendedProductsQuery */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
