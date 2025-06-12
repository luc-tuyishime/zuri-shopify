import {Await, useLoaderData, Link} from '@remix-run/react';
import {Suspense, useEffect, useMemo, useState} from 'react';
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
function FeaturedCollection({ collection }) {
    const [isMobile, setIsMobile] = useState(false);
    const [videoLoaded, setVideoLoaded] = useState(false);

    if (!collection) return null;

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    return (
        <>
            <div className="hero-video-container">
                {/* Optimized Background Media */}
                {isMobile ? (
                    // Mobile: Use image instead of video for better performance
                    <div
                        className="hero-background-image"
                        style={{
                            backgroundImage: `url(${BG})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            backgroundRepeat: 'no-repeat'
                        }}
                    />
                ) : (
                    // Desktop: Use optimized video
                    <>
                        {/* Fallback image while video loads */}
                        {!videoLoaded && (
                            <div
                                className="hero-background-image"
                                style={{
                                    backgroundImage: `url(${BG})`,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    backgroundRepeat: 'no-repeat'
                                }}
                            />
                        )}

                        <video
                            autoPlay
                            loop
                            muted
                            playsInline
                            preload="metadata"
                            onLoadedData={() => setVideoLoaded(true)}
                            className="hero-video"
                            style={{
                                opacity: videoLoaded ? 1 : 0,
                                transition: 'opacity 0.5s ease'
                            }}
                        >
                            <source src={VIDEO} type="video/mp4" />
                        </video>
                    </>
                )}

                {/* Content Overlay - Fully Responsive */}
                <div
                    className="hero-link"
                >
                    <div className="hero-content">
                        {/* Responsive Title */}
                        <h1 className="hero-title">
                            A relevant title would go here
                        </h1>

                        {/* Responsive Action Button */}
                        <button className="hero-button">
                            AN ACTION
                        </button>
                    </div>
                </div>
            </div>

            {/* Move styles to external CSS or use CSS Modules */}
            <style dangerouslySetInnerHTML={{
                __html: `
                .hero-video-container {
                    position: relative;
                    width: 100vw;
                    height: 100vh;
                    min-height: 500px;
                    margin: 0;
                    padding: 0;
                    left: 50%;
                    right: 50%;
                    margin-left: -50vw;
                    margin-right: -50vw;
                    overflow: hidden;
                }

                .hero-background-image,
                .hero-video {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    object-position: center;
                    z-index: 1;
                }

                .hero-link {
                    display: block;
                    width: 100%;
                    height: 100%;
                    position: absolute;
                    top: 0;
                    left: 0;
                    z-index: 2;
                    text-decoration: none;
                }

                .hero-content {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    padding: 20px;
                    padding-left: 80px;
                }

                .hero-title {
                    font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    color: white;
                    font-size: clamp(28px, 5vw, 45px);
                    font-weight: 500;
                    line-height: 1.2;
                    margin: 0 0 30px 0;
                    max-width: min(400px, 80vw);
                    letter-spacing: 0.5px;
                }

                .hero-button {
                    font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    color: white;
                    background-color: transparent;
                    border: 1px solid white;
                    padding: 12px 30px;
                    font-size: clamp(14px, 2vw, 16px);
                    letter-spacing: 1px;
                    cursor: pointer;
                    font-weight: 500;
                    transition: all 0.3s ease;
                    border-radius: 0;
                    text-transform: uppercase;
                    width: fit-content;
                }

                .hero-button:hover {
                    background-color: rgba(255, 255, 255, 0.1);
                    transform: translateY(-1px);
                }

                .hero-button:active {
                    transform: translateY(0);
                }

                @media (max-width: 768px) {
                    .hero-video-container {
                        height: 70vh;
                        min-height: 400px;
                    }

                    .hero-content {
                        padding: 20px;
                        text-align: center;
                        align-items: center;
                    }

                    .hero-title {
                        font-size: 32px;
                        margin-bottom: 24px;
                        max-width: 90vw;
                        text-align: center;
                    }

                    .hero-button {
                        padding: 14px 24px;
                        font-size: 14px;
                        width: auto;
                        min-width: 160px;
                    }
                }

                @media (min-width: 769px) and (max-width: 1024px) {
                    .hero-content {
                        padding-left: 40px;
                    }

                    .hero-title {
                        font-size: 38px;
                    }
                }

                @media (prefers-reduced-motion: reduce) {
                    .hero-button {
                        transition: none;
                    }
                    
                    .hero-button:hover {
                        transform: none;
                    }
                }

                @media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
                    .hero-background-image {
                        background-size: cover;
                    }
                }
                `
            }} />
        </>
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

    const fallbackSkeleton = useMemo(() => (
        <div className="recommended-products-grid grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
                <ProductSkeleton key={index} />
            ))}
        </div>
    ), []);

    const gridClasses = useMemo(() =>
            "recommended-products-grid grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6",
        []
    );

    return (
        <div className="recommended-products" >
            <div className="container-fluid mx-auto px-14" id="best-sellers" style={{ scrollMarginTop: '80px' }}>
                <p className="pt-10 pb-10 text-[45px] font-poppins font-regular"> {t.homepage.ourBestSellers}</p>

                <Suspense fallback={fallbackSkeleton}>
                    <Await resolve={products}>
                        {(response) => (
                            <div className={gridClasses}>
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
