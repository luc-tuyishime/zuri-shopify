import {Await, useLoaderData, Link} from '@remix-run/react';
import {Suspense, useEffect, useMemo, useRef, useState} from 'react';
import {Image} from '@shopify/hydrogen';
import {ProductItem} from '~/components/ProductItem';
import {WigGuideSection} from '~/components/WigGuideSection';
import {CustomerReviewsSection} from '~/components/CustomerReviewsSection';
import BG from '~/assets/bg.svg'
import VIDEO1 from '~/assets/video.mp4'
import VIDEO2 from '~/assets/video.mp4'
import VIDEO3 from '~/assets/video.mp4'
import MOBILE_VIDEO from '../assets/aaa.webm'
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
    const [isSlowConnection, setIsSlowConnection] = useState(false);
    const [isClient, setIsClient] = useState(false);
    const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
    const [isIntersecting, setIsIntersecting] = useState(false);
    const [shouldLoadVideo, setShouldLoadVideo] = useState(false);
    const [userRequestedVideo, setUserRequestedVideo] = useState(false);

    const containerRef = useRef(null);
    const videoRef = useRef(null);

    // Desktop video slideshow array
    const desktopVideos = [VIDEO1, VIDEO2, VIDEO3];

    // Slideshow content for each video
    const slideContent = [
        {
            title: "Discover Your Perfect Look",
            subtitle: "Premium Quality Wigs",
            buttonText: "SHOP NOW"
        },
        {
            title: "Natural Beauty Redefined",
            subtitle: "100% Human Hair Collection",
            buttonText: "EXPLORE"
        },
        {
            title: "Transform Your Style",
            subtitle: "Expert Crafted Designs",
            buttonText: "VIEW ALL"
        }
    ];

    if (!collection) return null;

    // Intersection Observer for lazy loading
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsIntersecting(true);

                    // Auto-load video only for desktop with good connection
                    if (!isMobile && !isSlowConnection) {
                        // Add small delay to ensure smooth loading
                        setTimeout(() => {
                            setShouldLoadVideo(true);
                        }, 100);
                    }
                }
            },
            {
                threshold: 0.2, // Load when 20% visible
                rootMargin: '50px' // Start loading 50px before visible
            }
        );

        if (containerRef.current) {
            observer.observe(containerRef.current);
        }

        return () => {
            if (containerRef.current) {
                observer.unobserve(containerRef.current);
            }
        };
    }, [isMobile, isSlowConnection]);

    useEffect(() => {
        // Set client-side flag
        setIsClient(true);

        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        // Check for slow connection
        const checkConnection = () => {
            if ('connection' in navigator) {
                const conn = navigator.connection;
                setIsSlowConnection(
                    conn.effectiveType === '2g' ||
                    conn.effectiveType === 'slow-2g' ||
                    conn.effectiveType === '3g'
                );
            }
        };

        checkMobile();
        checkConnection();

        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Desktop slideshow effect - only when video is loaded
    useEffect(() => {
        if (!isMobile && isClient && shouldLoadVideo && desktopVideos.length > 1) {
            const interval = setInterval(() => {
                setCurrentVideoIndex((prevIndex) =>
                    (prevIndex + 1) % desktopVideos.length
                );
                setVideoLoaded(false); // Reset for smooth transition
            }, 8000); // Change video every 8 seconds

            return () => clearInterval(interval);
        }
    }, [isMobile, isClient, shouldLoadVideo, desktopVideos.length]);

    // Handle manual video loading for mobile
    const handlePlayVideo = () => {
        setUserRequestedVideo(true);
        setShouldLoadVideo(true);
    };

    // Determine if video should be shown
    const showVideo = shouldLoadVideo && isIntersecting;

    // For SSR and initial render, show image until we know the device type
    if (!isClient) {
        return (
            <>
                <div ref={containerRef} className="hero-video-container">
                    <div
                        className="hero-background-image"
                        style={{
                            backgroundImage: `url(${BG})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            backgroundRepeat: 'no-repeat'
                        }}
                    />

                    {/* Content Overlay */}
                    <div className="hero-link">
                        <div className="hero-content">
                            <h1 className="hero-title">
                                {slideContent[0].title}
                            </h1>
                            <p className="hero-subtitle">
                                {slideContent[0].subtitle}
                            </p>
                            <button className="hero-button">
                                {slideContent[0].buttonText}
                            </button>
                        </div>
                    </div>
                </div>
                <style dangerouslySetInnerHTML={{
                    __html: styles
                }} />
            </>
        );
    }

    return (
        <>
            <div ref={containerRef} className="hero-video-container">
                {/* Always show background image as base layer */}
                <div
                    className="hero-background-image"
                    style={{
                        backgroundImage: `url(${BG})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat'
                    }}
                />

                {/* Video layer - only loads when conditions are met */}
                {showVideo && (
                    <>
                        {/* Mobile Video - Highly optimized */}
                        {isMobile ? (
                            <video
                                ref={videoRef}
                                key="mobile-video"
                                autoPlay
                                loop
                                muted
                                playsInline
                                preload="none" // Critical: Don't preload on mobile
                                onLoadedData={() => setVideoLoaded(true)}
                                onCanPlay={() => setVideoLoaded(true)}
                                className="hero-video"
                                style={{
                                    opacity: videoLoaded ? 1 : 0,
                                    transition: 'opacity 1s ease',
                                    willChange: 'opacity'
                                }}
                            >
                                <source src={MOBILE_VIDEO} type="video/webm" />
                            </video>
                        ) : (
                            /* Desktop Video Slideshow */
                            <video
                                key={`desktop-video-${currentVideoIndex}`}
                                autoPlay
                                loop
                                muted
                                playsInline
                                preload="metadata" // Only metadata for desktop
                                onLoadedData={() => setVideoLoaded(true)}
                                className="hero-video"
                                style={{
                                    opacity: videoLoaded ? 1 : 0,
                                    transition: 'opacity 0.8s ease'
                                }}
                            >
                                <source src={desktopVideos[currentVideoIndex]} type="video/mp4" />
                            </video>
                        )}
                    </>
                )}

                {/* Mobile: Play button overlay when video not loaded */}
                {isMobile && isIntersecting && !userRequestedVideo && (
                    <div className="video-play-overlay">
                        <button
                            onClick={handlePlayVideo}
                            className="play-button"
                            aria-label="Play background video"
                        >
                            <svg
                                className="play-icon"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path d="M8 5v14l11-7z"/>
                            </svg>
                            <span className="play-text">Play Video</span>
                        </button>
                    </div>
                )}

                {/* Content Overlay - Dynamic content based on current slide */}
                <div className="hero-link">
                    <div className="hero-content">
                        {/* Dynamic Title */}
                        <h1 className="hero-title">
                            {isMobile ? slideContent[0].title : slideContent[currentVideoIndex].title}
                        </h1>

                        {/* Dynamic Subtitle */}
                        <p className="hero-subtitle">
                            {isMobile ? slideContent[0].subtitle : slideContent[currentVideoIndex].subtitle}
                        </p>

                        {/* Dynamic Action Button */}
                        <button className="hero-button">
                            {isMobile ? slideContent[0].buttonText : slideContent[currentVideoIndex].buttonText}
                        </button>
                    </div>

                    {/* Desktop: Slideshow indicators */}
                    {!isMobile && isClient && showVideo && (
                        <div className="slideshow-indicators">
                            {desktopVideos.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => {
                                        setCurrentVideoIndex(index);
                                        setVideoLoaded(false);
                                    }}
                                    className={`indicator ${index === currentVideoIndex ? 'active' : ''}`}
                                    aria-label={`Go to slide ${index + 1}`}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Enhanced styles with performance optimizations */}
            <style dangerouslySetInnerHTML={{
                __html: styles
            }} />
        </>
    );
}

const styles = `
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
        /* GPU acceleration */
        transform: translateZ(0);
        backface-visibility: hidden;
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

    .hero-video {
        /* Performance optimizations */
        transform: translateZ(0);
        backface-visibility: hidden;
        perspective: 1000px;
        will-change: opacity;
    }

    /* Critical: Optimize video loading on mobile */
    @media (max-width: 768px) {
        .hero-video-container {
            height: 70vh;
            min-height: 400px;
        }
        
        .hero-video {
            /* Reduce quality on mobile for performance */
            image-rendering: optimizeSpeed;
            image-rendering: -webkit-optimize-contrast;
            image-rendering: optimize-contrast;
        }
    }

    .video-play-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(0, 0, 0, 0.3);
        z-index: 5;
        backdrop-filter: blur(2px);
    }

    .play-button {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        background: rgba(255, 255, 255, 0.9);
        border: none;
        border-radius: 50px;
        padding: 20px 30px;
        cursor: pointer;
        transition: all 0.3s ease;
        backdrop-filter: blur(10px);
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    }

    .play-button:hover {
        background: rgba(255, 255, 255, 1);
        transform: scale(1.05);
    }

    .play-icon {
        width: 24px;
        height: 24px;
        color: #333;
        margin-bottom: 8px;
    }

    .play-text {
        font-size: 14px;
        font-weight: 600;
        color: #333;
        text-transform: uppercase;
        letter-spacing: 0.5px;
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
        margin: 0 0 20px 0;
        max-width: min(500px, 80vw);
        letter-spacing: 0.5px;
        transition: opacity 0.5s ease;
        text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
    }

    .hero-subtitle {
        font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        color: rgba(255, 255, 255, 0.9);
        font-size: clamp(16px, 3vw, 22px);
        font-weight: 300;
        line-height: 1.4;
        margin: 0 0 30px 0;
        max-width: min(400px, 80vw);
        transition: opacity 0.5s ease;
        text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
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
        backdrop-filter: blur(10px);
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
    }

    .hero-button:hover {
        background-color: rgba(255, 255, 255, 0.1);
        transform: translateY(-1px);
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
    }

    .hero-button:active {
        transform: translateY(0);
    }

    /* Slideshow indicators */
    .slideshow-indicators {
        position: absolute;
        bottom: 30px;
        left: 80px;
        display: flex;
        gap: 12px;
        z-index: 3;
    }

    .indicator {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        border: 2px solid rgba(255, 255, 255, 0.5);
        background-color: transparent;
        cursor: pointer;
        transition: all 0.3s ease;
    }

    .indicator.active {
        background-color: white;
        border-color: white;
    }

    .indicator:hover {
        border-color: white;
        background-color: rgba(255, 255, 255, 0.7);
    }

    @media (max-width: 768px) {
        .hero-content {
            padding: 20px;
            text-align: center;
            align-items: center;
        }

        .hero-title {
            font-size: 32px;
            margin-bottom: 16px;
            max-width: 90vw;
            text-align: center;
        }

        .hero-subtitle {
            font-size: 18px;
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

        .slideshow-indicators {
            display: none;
        }
    }

    @media (min-width: 769px) and (max-width: 1024px) {
        .hero-content {
            padding-left: 40px;
        }

        .hero-title {
            font-size: 38px;
        }

        .slideshow-indicators {
            left: 40px;
        }
    }

    /* Critical: Reduce motion for performance */
    @media (prefers-reduced-motion: reduce) {
        .hero-button,
        .play-button {
            transition: none;
        }
        
        .hero-button:hover,
        .play-button:hover {
            transform: none;
        }

        .hero-video {
            animation-play-state: paused;
        }

        .hero-title, .hero-subtitle {
            transition: none;
        }
    }

    /* Critical: Data saver mode */
    @media (prefers-reduced-data: reduce) {
        .hero-video {
            display: none !important;
        }
        
        .video-play-overlay {
            display: none !important;
        }
    }

    /* Performance optimization for older devices */
    @media (max-width: 768px) and (-webkit-min-device-pixel-ratio: 1) {
        .hero-video {
            transform: translate3d(0, 0, 0);
            -webkit-transform: translate3d(0, 0, 0);
        }
    }
`;

/**
 * @param {{
 *   products: Promise<RecommendedProductsQuery | null>;
 * }}
 */
export function RecommendedProducts({products}) {
    const [locale] = useLocale();
    const t = useTranslation(locale);

    const fallbackSkeleton = useMemo(() => (
        <div className="recommended-products-grid mobile-single-column gap-4 md:gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
                <ProductSkeleton key={index} />
            ))}
        </div>
    ), []);

    const gridClasses = useMemo(() =>
            "recommended-products-grid mobile-single-column gap-4 md:gap-6",
        []
    );

    return (
        <div className="recommended-products" >
            <div className="container-fluid mx-auto px-4 md:px-14" id="best-sellers" style={{ scrollMarginTop: '80px' }}>
                <p className="pt-6 pb-6 md:pt-10 md:pb-10 text-2xl md:text-[45px] font-poppins font-regular"> {t.homepage.ourBestSellers}</p>

                <Suspense fallback={fallbackSkeleton}>
                    <Await resolve={products}>
                        {(response) => (
                            <div className={gridClasses}>
                                {response
                                    ? response.products.nodes.map((product) => (
                                        <ProductItem key={product.id} product={product}  variant="roundedText"  />
                                    ))
                                    : null}
                            </div>
                        )}
                    </Await>
                </Suspense>
            </div>
            <style dangerouslySetInnerHTML={{
                __html: `
                /* Mobile single column for products */
                .mobile-single-column {
                    display: grid;
                    grid-template-columns: 1fr;
                }

                @media (min-width: 640px) {
                    .mobile-single-column {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }

                @media (min-width: 768px) {
                    .mobile-single-column {
                        grid-template-columns: repeat(3, 1fr);
                    }
                }

                @media (min-width: 1024px) {
                    .mobile-single-column {
                        grid-template-columns: repeat(4, 1fr);
                    }
                }
                `
            }} />
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