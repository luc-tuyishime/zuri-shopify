import {Await, useLoaderData, Link, useLocation} from '@remix-run/react';
import {Suspense, useEffect, useMemo, useRef, useState} from 'react';
import {Image} from '@shopify/hydrogen';
import {ProductItem} from '~/components/ProductItem';
import {WigGuideSection} from '~/components/WigGuideSection';
import {CUSTOMER_REVIEWS_QUERY, CustomerReviewsSection} from '~/components/CustomerReviewsSection';
import { EmailCapture } from '~/components/EmailCapture';
import BG from '~/assets/bg.svg'
// import VIDEO1 from '~/assets/video.mp4'
// import VIDEO2 from '~/assets/video.mp4'
// import VIDEO3 from '~/assets/video.mp4'
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

    const bestSellersCollection = context.storefront
        .query(BEST_SELLERS_COLLECTION_QUERY)
        .catch((error) => {
            console.error('Best Sellers collection error:', error);
            return null;
        });

    const reviewsData = context.storefront
        .query(CUSTOMER_REVIEWS_QUERY)
        .catch((error) => {
            console.error('Reviews error:', error);
            return null;
        });

    const recommendedProducts = context.storefront
        .query(RECOMMENDED_PRODUCTS_QUERY)
        .catch((error) => {
            // Log query errors, but don't throw them so the page can still render
            console.error(error);
            return null;
        });

    return {
        bestSellersCollection,
        recommendedProducts,
        reviewsData
    };
}


export default function Homepage() {
    /** @type {LoaderReturnData} */
    const data = useLoaderData();
    return (
        <div className="home">
            <FeaturedCollection collection={data.featuredCollection} />
            {/*<RecommendedProducts products={data.recommendedProducts} />*/}
            <BestSellersProducts
                bestSellersCollection={data.bestSellersCollection}
                fallbackProducts={data.recommendedProducts}
            />
            <WigGuideSection collection={data.featuredCollection} />
            <Suspense fallback={<div>Loading reviews...</div>}>
                <Await resolve={data.reviewsData}>
                    {(reviewsResponse) => (
                        <CustomerReviewsSection reviewsData={reviewsResponse} />
                    )}
                </Await>
            </Suspense>
            {/*<div>*/}

            {/*    <EmailCapture />*/}
            {/*</div>*/}
        </div>
    );
}

/**
 * Updated component to handle Best Sellers collection dynamically
 * @param {{
 *   bestSellersCollection: Promise<BestSellersCollectionQuery | null>;
 *   fallbackProducts: Promise<RecommendedProductsQuery | null>;
 * }}
 */
export function BestSellersProducts({bestSellersCollection, fallbackProducts}) {
    const [locale] = useLocale();
    const t = useTranslation(locale);
    const sectionRef = useRef(null);
    const scrollContainerRef = useRef(null);
    const [isVisible, setIsVisible] = useState(false);
    const [shouldPrioritizeImages, setShouldPrioritizeImages] = useState(false);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);
    const [isMobile, setIsMobile] = useState(false);
    const location = useLocation();
    const isAboutPage = location.pathname === '/about';

    // Check if mobile
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Scroll functions (only for desktop)
    const scrollLeft = () => {
        if (scrollContainerRef.current && !isMobile) {
            scrollContainerRef.current.scrollBy({ left: -300, behavior: 'smooth' });
        }
    };

    const scrollRight = () => {
        if (scrollContainerRef.current && !isMobile) {
            scrollContainerRef.current.scrollBy({ left: 300, behavior: 'smooth' });
        }
    };

    // Check scroll position (only for desktop)
    const checkScrollPosition = () => {
        if (scrollContainerRef.current && !isMobile) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
            setCanScrollLeft(scrollLeft > 5);
            setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5);
        }
    };

    // Intersection Observer
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    setShouldPrioritizeImages(true);
                }
            },
            {
                threshold: 0.1,
                rootMargin: '100px'
            }
        );

        if (sectionRef.current) {
            observer.observe(sectionRef.current);
        }

        return () => {
            if (sectionRef.current) {
                observer.unobserve(sectionRef.current);
            }
        };
    }, []);

    // Scroll position tracking (desktop only)
    useEffect(() => {
        if (isMobile) return;

        const container = scrollContainerRef.current;
        if (container) {
            container.addEventListener('scroll', checkScrollPosition);

            const resizeObserver = new ResizeObserver(() => {
                checkScrollPosition();
            });
            resizeObserver.observe(container);

            const timeoutId = setTimeout(() => {
                checkScrollPosition();
            }, 100);

            return () => {
                container.removeEventListener('scroll', checkScrollPosition);
                resizeObserver.disconnect();
                clearTimeout(timeoutId);
            };
        }
    }, [isMobile]);

    // Preload images
    useEffect(() => {
        if (shouldPrioritizeImages && bestSellersCollection) {
            const preloadImages = async () => {
                try {
                    const response = await bestSellersCollection;
                    if (response?.collection?.products?.nodes) {
                        response.collection.products.nodes.slice(0, 4).forEach((product) => {
                            if (product.featuredImage?.url) {
                                const link = document.createElement('link');
                                link.rel = 'preload';
                                link.as = 'image';
                                const imageUrl = product.featuredImage.url.includes('cdn.shopify.com')
                                    ? product.featuredImage.url + '?width=400&format=webp&quality=85'
                                    : product.featuredImage.url;
                                link.href = imageUrl;
                                link.type = 'image/webp';
                                document.head.appendChild(link);
                            }
                        });
                    }
                } catch (error) {
                    console.log('Preload failed:', error);
                }
            };

            preloadImages();
        }
    }, [shouldPrioritizeImages, bestSellersCollection]);

    const fallbackSkeleton = useMemo(() => (
        <div className={isMobile ? "mobile-grid-container" : "horizontal-scroll-container"}>
            <div className={isMobile ? "mobile-grid" : "horizontal-scroll-grid"}>
                {Array.from({ length: isMobile ? 6 : 8 }).map((_, index) => (
                    <ProductSkeleton key={index} />
                ))}
            </div>
        </div>
    ), [isMobile]);

    return (
        <div className="recommended-products" ref={sectionRef}>
            <div className={`container-fluid mx-auto ${isMobile ? 'px-2' : 'px-4 md:px-14'}`} id="best-sellers" style={{ scrollMarginTop: '80px' }}>
                {/* Header with scroll controls (desktop only) */}
                <div className="flex items-center justify-between pt-8 pb-8 md:pt-14 md:pb-14">
                    <p className="text-2xl md:text-[45px] font-poppins font-regular">
                        {isAboutPage
                            ? (locale === 'fr' ? 'NOTRE COLLECTION DIAMANT' : 'OUR DIAMANT COLLECTION')
                            : (locale === 'fr' ? 'NOS MEILLEURES VENTES' : 'OUR BEST SELLERS')
                        }
                    </p>

                    {/* Desktop scroll controls */}
                    {!isMobile && (
                        <div className="hidden md:flex items-center space-x-2">
                            <button
                                onClick={scrollLeft}
                                disabled={!canScrollLeft}
                                className={`p-2 rounded-full border ${
                                    canScrollLeft
                                        ? 'border-gray-300 hover:border-gray-500 text-gray-700 hover:text-gray-900'
                                        : 'border-gray-200 text-gray-300 cursor-not-allowed'
                                } transition-colors`}
                                aria-label="Scroll left"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            <button
                                onClick={scrollRight}
                                disabled={!canScrollRight}
                                className={`p-2 rounded-full border ${
                                    canScrollRight
                                        ? 'border-[#8B4513] hover:border-gray-500 text-[#8B4513] hover:text-[#8B4513]'
                                        : 'border-gray-200 text-gray-300 cursor-not-allowed'
                                } transition-colors`}
                                aria-label="Scroll right"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>
                    )}
                </div>

                <Suspense fallback={fallbackSkeleton}>
                    <Await resolve={bestSellersCollection}>
                        {(bestSellersResponse) => (
                            <>
                                {bestSellersResponse?.collection?.products?.nodes?.length > 0 ? (
                                    <div className={isMobile ? "mobile-grid-container" : "horizontal-scroll-container"}>
                                        <div
                                            ref={scrollContainerRef}
                                            className={isMobile ? "mobile-grid" : "horizontal-scroll-grid"}
                                        >
                                            {bestSellersResponse.collection.products.nodes
                                                .map((product, index) => (
                                                    <div key={product.id} className={isMobile ? "mobile-grid-item" : "horizontal-scroll-item"}>
                                                        <ProductItem
                                                            product={product}
                                                            variant="roundedText"
                                                            loading={index < 4 ? "eager" : "lazy"}
                                                            fetchpriority={index < 4 ? "high" : "auto"}
                                                        />
                                                    </div>
                                                ))}
                                        </div>
                                    </div>
                                ) : (
                                    /* Fallback to recommended products */
                                    <Suspense fallback={fallbackSkeleton}>
                                        <Await resolve={fallbackProducts}>
                                            {(fallbackResponse) => (
                                                <>
                                                    {fallbackResponse?.products?.nodes ? (
                                                        <div className={isMobile ? "mobile-grid-container" : "horizontal-scroll-container"}>
                                                            <div
                                                                ref={scrollContainerRef}
                                                                className={isMobile ? "mobile-grid" : "horizontal-scroll-grid"}
                                                            >
                                                                {fallbackResponse.products.nodes
                                                                    .slice(0, isMobile ? 6 : undefined)
                                                                    .map((product, index) => (
                                                                        <div key={product.id} className={isMobile ? "mobile-grid-item" : "horizontal-scroll-item"}>
                                                                            <ProductItem
                                                                                product={product}
                                                                                variant="roundedText"
                                                                                loading={index < 4 ? "eager" : "lazy"}
                                                                                fetchpriority={index < 4 ? "high" : "auto"}
                                                                            />
                                                                        </div>
                                                                    ))}
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="text-center py-12">
                                                            <p className="text-gray-500">
                                                                {locale === 'fr'
                                                                    ? 'Configuration de la collection en cours...'
                                                                    : 'Setting up collection...'
                                                                }
                                                            </p>
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </Await>
                                    </Suspense>
                                )}
                            </>
                        )}
                    </Await>
                </Suspense>
            </div>

            {/* Updated styles with mobile grid support */}
            <style dangerouslySetInnerHTML={{
                __html: `
                /* Desktop horizontal scroll container */
                .horizontal-scroll-container {
                    position: relative;
                    width: 100%;
                }
                
                .mobile-grid-item button,
.horizontal-scroll-item button {
    font-size: 11px !important; /* Smaller font for long text */
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    min-width: 0;
    max-width: 100%;
    box-sizing: border-box;
}

/* For mobile, allow text wrapping on very long buttons */
@media (max-width: 480px) {
    .mobile-grid-item button {
        white-space: normal !important;
        line-height: 1.2 !important;
        height: auto !important;
        min-height: 40px !important;
        font-size: 10px !important;
    }
}

                .horizontal-scroll-grid {
                    display: flex;
                    gap: 1.5rem;
                    overflow-x: auto;
                    padding-bottom: 1rem;
                    scroll-behavior: smooth;
                    scrollbar-width: none;
                    -ms-overflow-style: none;
                }

                .horizontal-scroll-grid::-webkit-scrollbar {
                    display: none;
                }

                .horizontal-scroll-item {
                    flex: 0 0 280px;
                    max-width: 280px;
                }

                /* Mobile grid container */
                .mobile-grid-container {
                    position: relative;
                    width: 100%;
                    margin: 0;
                }

                .mobile-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 0.75rem;
                    padding: 0;
                    width: 100%;
                }

                .mobile-grid-item {
                    width: 100%;
                    min-width: 0; /* Prevent grid blowout */
                    overflow: hidden; /* Prevent content overflow */
                }

                /* Mobile breakpoints */
                @media (max-width: 480px) {
                    .mobile-grid {
                        gap: 0.75rem;
                    }
                }

                /* Performance optimizations */
                .horizontal-scroll-grid,
                .mobile-grid {
                    transform: translateZ(0);
                    backface-visibility: hidden;
                    contain: layout style paint;
                }

                .horizontal-scroll-item,
                .mobile-grid-item {
                    contain: layout style;
                    transform: translateZ(0);
                    will-change: transform;
                }

                /* Hover effects only on capable devices */
                @media (hover: hover) and (pointer: fine) {
                    .horizontal-scroll-item:hover,
                    .mobile-grid-item:hover {
                        transform: translateZ(0) translateY(-2px);
                        transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                    }
                }

                /* Reduce motion for accessibility */
                @media (prefers-reduced-motion: reduce) {
                    .horizontal-scroll-grid {
                        scroll-behavior: auto;
                    }
                    
                    .horizontal-scroll-item,
                    .mobile-grid-item {
                        transition: none !important;
                        will-change: auto !important;
                    }
                    
                    .horizontal-scroll-item:hover,
                    .mobile-grid-item:hover {
                        transform: translateZ(0) !important;
                    }
                }
                `
            }} />
        </div>
    );
}


/**
 * @param {{
 *   collection: FeaturedCollectionFragment;
 * }}
 */
function FeaturedCollection({ collection }) {
    const [isMobile, setIsMobile] = useState(() => {
        if (typeof window !== 'undefined') {
            return window.innerWidth < 768;
        }
        return false;
    });
    const [videoLoaded, setVideoLoaded] = useState(false);
    const [isSlowConnection, setIsSlowConnection] = useState(false);
    const [isClient, setIsClient] = useState(false);
    const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
    const [isIntersecting, setIsIntersecting] = useState(false);
    const [shouldLoadVideo, setShouldLoadVideo] = useState(false);
    const [videoErrors, setVideoErrors] = useState(new Set());

    const containerRef = useRef(null);
    const videoRef = useRef(null);
    const [locale] = useLocale();
    const t = useTranslation(locale);

    const mobileHideCSS = `
    @media (max-width: 767px) {
        .desktop-video-only {
            display: none !important;
        }
    }
`;

    const getMetafield = (key, namespace = 'custom') => {
        try {
            if (!collection?.metafields || !Array.isArray(collection.metafields)) {
                return null;
            }

            return collection.metafields.find(
                metafield => metafield &&
                    metafield.key === key &&
                    metafield.namespace === namespace
            );
        } catch (error) {
            console.warn('Error getting metafield:', error);
            return null;
        }
    };

    const getVideoAspectRatio = (videoUrl) => {
        // For now, assume vertical videos for mobile, horizontal for desktop
        // You could enhance this by actually loading video metadata
        return isMobile ? 'vertical' : 'horizontal';
    };

    // 2. Dynamic object positioning based on device and aspect ratio
    const getObjectPosition = (videoUrl = null) => {
        if (isMobile) {
            // On mobile, show more of the top portion of videos
            return 'center 20%';
        }
        // On desktop, center the video
        return 'center center';
    };

    const getVideoStyleProps = (videoUrl) => {
        const aspectRatio = getVideoAspectRatio(videoUrl);
        const objectPosition = getObjectPosition(videoUrl);

        return {
            objectFit: 'cover',
            objectPosition,
            // Add data attribute for CSS targeting if needed
            'data-aspect': aspectRatio
        };
    };

    const handleVideoError = (videoUrl) => {
        console.error('❌ Video failed to load:', videoUrl);
        setVideoErrors(prev => new Set([...prev, videoUrl]));
    };

    const collectionUrl = useMemo(() => {
        return collection?.handle ? `/collections/${collection.handle}` : '/collections/all';
    }, [collection?.handle]);

    // Mobile videos array - checks for mobile-specific first, falls back to desktop
    const mobileVideos = useMemo(() => {
        const videos = [];

        // Mobile video 1 - Check for mobile-specific first, then fallback to desktop
        const mobileVideo1 = getMetafield('hero_mobile_video') || getMetafield('hero_background_image');
        if (mobileVideo1?.value && typeof mobileVideo1.value === 'string' && mobileVideo1.value.startsWith('http')) {
            videos.push(mobileVideo1.value);
        } else if (mobileVideo1?.reference?.sources?.[0]?.url) {
            videos.push(mobileVideo1.reference.sources[0].url);
        }

        // Mobile video 2 - Check for mobile-specific first, then fallback to desktop
        const mobileVideo2 = getMetafield('hero_mobile_video_slide_2') || getMetafield('hero_background_image_slide_2');
        if (mobileVideo2?.value && typeof mobileVideo2.value === 'string' && mobileVideo2.value.startsWith('http')) {
            videos.push(mobileVideo2.value);
        } else if (mobileVideo2?.reference?.sources?.[0]?.url) {
            videos.push(mobileVideo2.reference.sources[0].url);
        }

        // Mobile video 3 - Check for mobile-specific first, then fallback to desktop
        const mobileVideo3 = getMetafield('hero_mobile_video_slide_3') || getMetafield('hero_background_image_slide_3');
        if (mobileVideo3?.value && typeof mobileVideo3.value === 'string' && mobileVideo3.value.startsWith('http')) {
            videos.push(mobileVideo3.value);
        } else if (mobileVideo3?.reference?.sources?.[0]?.url) {
            videos.push(mobileVideo3.reference.sources[0].url);
        }

        return videos;
    }, [collection?.metafields]);

    const desktopVideos = useMemo(() => {
        const videos = [];

        const video1Metafield = getMetafield('hero_background_image');
        if (video1Metafield?.value && typeof video1Metafield.value === 'string' && video1Metafield.value.startsWith('http')) {
            videos.push(video1Metafield.value);
        } else if (video1Metafield?.reference?.sources?.[0]?.url) {
            videos.push(video1Metafield.reference.sources[0].url);
        }

        // Get video 2 (slide 2)
        const video2Metafield = getMetafield('hero_background_image_slide_2');
        if (video2Metafield?.value && typeof video2Metafield.value === 'string' && video2Metafield.value.startsWith('http')) {
            videos.push(video2Metafield.value);
        } else if (video2Metafield?.reference?.sources?.[0]?.url) {
            videos.push(video2Metafield.reference.sources[0].url);
        }

        // Get video 3 (slide 3) - Check multiple possible keys
        let video3Metafield = getMetafield('hero_background_image_slide_3');
        // If not found, try alternative keys that might exist in Shopify
        if (!video3Metafield) {
            video3Metafield = getMetafield('hero_background_image_3') ||
                getMetafield('hero_video_slide_3') ||
                getMetafield('background_video_3');
        }

        if (video3Metafield?.value && typeof video3Metafield.value === 'string' && video3Metafield.value.startsWith('http')) {
            videos.push(video3Metafield.value);
        } else if (video3Metafield?.reference?.sources?.[0]?.url) {
            videos.push(video3Metafield.reference.sources[0].url);
        }

        return videos;
    }, [collection?.metafields]);

    // Updated getCurrentVideoSource to handle both mobile and desktop
    const getCurrentVideoSource = useMemo(() => {
        try {
            const videosToUse = isMobile ? mobileVideos : desktopVideos;

            if (videosToUse.length > 0) {
                const safeIndex = Math.max(0, Math.min(currentVideoIndex, videosToUse.length - 1));
                const videoUrl = videosToUse[safeIndex];

                if (!videoErrors.has(videoUrl)) {
                    return videoUrl;
                }
            }

            return null;
        } catch (error) {
            console.error('🚨 Error getting video source:', error);
            return null;
        }
    }, [currentVideoIndex, mobileVideos, desktopVideos, isMobile, videoErrors]);

    // Updated slideshow effect to work for both mobile and desktop
    useEffect(() => {
        const videosToUse = isMobile ? mobileVideos : desktopVideos;

        // Only start slideshow if we have more than 1 video and we're intersecting
        if (isClient && isIntersecting && videosToUse.length > 1) {
            const interval = setInterval(() => {
                setCurrentVideoIndex((prevIndex) => {
                    const nextIndex = (prevIndex + 1) % videosToUse.length;
                    setVideoLoaded(false);
                    return nextIndex;
                });
            }, 8000);

            return () => {
                clearInterval(interval);
            };
        }
    }, [isMobile, isClient, isIntersecting, mobileVideos.length, desktopVideos.length]);

    const slideContent = useMemo(() => {
        try {
            const slides = [];
            const isEnglish = locale === 'en';

            // Only add slide content if we have a corresponding video
            const video1Metafield = getMetafield('hero_background_image');
            const video2Metafield = getMetafield('hero_background_image_slide_2');
            const video3Metafield = getMetafield('hero_background_image_slide_3');

            // Slide 1 - Only add if video exists
            if (video1Metafield?.value && typeof video1Metafield.value === 'string' && video1Metafield.value.startsWith('http')) {
                const slide1Title = getMetafield(isEnglish ? 'hero_title_en' : 'hero_title');
                const slide1Subtitle = getMetafield(isEnglish ? 'hero_subtitle_en' : 'hero_subtitle');
                const slide1Button = getMetafield(isEnglish ? 'hero_button_text_en' : 'hero_button_text');
                const slide1Url = getMetafield('hero_button_url_slide_1');

                slides.push({
                    title: slide1Title?.value ||
                        (isEnglish ? t.hero?.defaultTitle : `Découvrez ${collection?.title || 'Notre Collection'}`) ||
                        `Discover ${collection?.title || 'Our Collection'}`,
                    subtitle: slide1Subtitle?.value ||
                        (isEnglish ? t.hero?.defaultSubtitle : 'Collection de Qualité Premium') ||
                        'Premium Quality Collection',
                    buttonText: slide1Button?.value ||
                        (isEnglish ? t.hero?.defaultButton : 'ACHETER LA COLLECTION') ||
                        'SHOP COLLECTION',
                    url: slide1Url?.value || collectionUrl
                });
            }

            // Slide 2 - Only add if video exists
            if (video2Metafield?.value && typeof video2Metafield.value === 'string' && video2Metafield.value.startsWith('http')) {
                const slide2Title = getMetafield(isEnglish ? 'hero_title_slide_2_en' : 'hero_title_slide_2');
                const slide2Subtitle = getMetafield(isEnglish ? 'hero_subtitle_slide_2_en' : 'hero_subtitle_slide_2');
                const slide2Button = getMetafield(isEnglish ? 'hero_button_text_slide_2_en' : 'hero_button_text_slide_2');
                const slide2Url = getMetafield('hero_button_url_slide_2');

                slides.push({
                    title: slide2Title?.value ||
                        (isEnglish ? t.hero?.slide2Title : 'Beauté Naturelle Redéfinie') ||
                        'Natural Beauty Redefined',
                    subtitle: slide2Subtitle?.value ||
                        (isEnglish ? t.hero?.slide2Subtitle : 'Collection 100% Cheveux Humains') ||
                        '100% Human Hair Collection',
                    buttonText: slide2Button?.value ||
                        (isEnglish ? t.hero?.slide2Button : 'EXPLORER LES STYLES') ||
                        'EXPLORE STYLES',
                    url: slide2Url?.value || collectionUrl
                });
            }

            // Slide 3 - Only add if video exists
            if (video3Metafield?.value && typeof video3Metafield.value === 'string' && video3Metafield.value.startsWith('http')) {
                const slide3Title = getMetafield(isEnglish ? 'hero_title_slide_3_en' : 'hero_title_slide_3');
                const slide3Subtitle = getMetafield(isEnglish ? 'hero_subtitle_slide_3_en' : 'hero_subtitle_slide_3');
                const slide3Button = getMetafield(isEnglish ? 'hero_button_text_slide_3_en' : 'hero_button_text_slide_3');
                const slide3Url = getMetafield('hero_button_url_slide_3');

                slides.push({
                    title: slide3Title?.value ||
                        (isEnglish ? t.hero?.slide3Title : 'Transformez Votre Style') ||
                        'Transform Your Style',
                    subtitle: slide3Subtitle?.value ||
                        (isEnglish ? t.hero?.slide3Subtitle : 'Designs Fabriqués par des Experts') ||
                        'Expert Crafted Designs',
                    buttonText: slide3Button?.value ||
                        (isEnglish ? t.hero?.slide3Button : 'VOIR TOUT') ||
                        'VIEW ALL',
                    url: slide3Url?.value || collectionUrl
                });
            }

            return slides;

        } catch (error) {
            console.error('Error generating slide content:', error);
            return [
                {
                    title: locale === 'en' ? 'Our Collection' : 'Notre Collection',
                    subtitle: locale === 'en' ? 'Premium Quality' : 'Qualité Premium',
                    buttonText: locale === 'en' ? 'SHOP NOW' : 'ACHETER MAINTENANT',
                    url: '/collections/all'
                }
            ];
        }
    }, [collection?.title, collection?.handle, collection?.metafields, t, locale, collectionUrl]);

    const getCurrentSlideContent = () => {
        if (!slideContent || slideContent.length === 0) {
            return {
                title: collection?.title || 'Our Collection',
                subtitle: 'Premium Quality',
                buttonText: 'SHOP NOW',
                url: collectionUrl
            };
        }

        const safeIndex = Math.max(0, Math.min(currentVideoIndex, slideContent.length - 1));
        return slideContent[safeIndex] || slideContent[0];
    };

    if (!collection) {
        return (
            <div className="hero-video-container" style={{
                height: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)'
            }}>
                <div style={{ textAlign: 'center', color: '#64748b' }}>
                    <div style={{
                        fontSize: '18px',
                        marginBottom: '8px',
                        animation: 'pulse 2s infinite'
                    }}>
                        Loading Collection...
                    </div>
                    <div style={{ fontSize: '14px' }}>
                        Fetching hero content from Shopify
                    </div>
                </div>
            </div>
        );
    }

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsIntersecting(true);

                    // Always load video when intersecting and we have a video source
                    if (getCurrentVideoSource) {
                        setTimeout(() => {
                            setShouldLoadVideo(true);
                        }, 500);
                    }
                }
            },
            {
                threshold: 0.1,
                rootMargin: '100px'
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
    }, [getCurrentVideoSource]);

    useEffect(() => {
        setIsClient(true);

        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

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

    const showVideo = isIntersecting;

    if (!isClient) {
        const currentContent = slideContent[0] || {
            title: 'Our Collection',
            subtitle: 'Premium Quality',
            buttonText: 'SHOP NOW',
            url: '/collections/all'
        };

        return (
            <>
                <div ref={containerRef} className="hero-video-container">
                    {/* Only show videos - no background images */}
                    {!isMobile && getCurrentVideoSource && (
                        <video
                            key={`bg-video-${currentVideoIndex}`}
                            autoPlay
                            loop
                            muted
                            playsInline
                            className="hero-background-video desktop-video-only"
                            preload="metadata"
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                objectPosition: 'center',
                                zIndex: 1,
                                opacity: 0,
                                transition: 'opacity 1s ease',
                                ...getVideoStyleProps(getCurrentVideoSource)
                            }}
                            onError={() => handleVideoError(getCurrentVideoSource)}
                            onCanPlay={(e) => {
                                e.target.style.opacity = '1';
                            }}
                            data-aspect={getVideoAspectRatio(getCurrentVideoSource)}
                        >
                            <source src={getCurrentVideoSource} type="video/mp4" />
                        </video>
                    )}

                    {(showVideo || getCurrentVideoSource) && (
                        <>
                            {/* Updated Mobile/Desktop Video Logic */}
                            {isMobile && mobileVideos.length > 0 && getCurrentVideoSource ? (
                                <video
                                    ref={videoRef}
                                    key={`mobile-video-${currentVideoIndex}`}
                                    autoPlay
                                    loop
                                    muted
                                    playsInline
                                    preload="metadata"
                                    onLoadedData={() => setVideoLoaded(true)}
                                    onCanPlay={() => setVideoLoaded(true)}
                                    className="hero-video"
                                    style={{
                                        opacity: videoLoaded ? 1 : 0,
                                        transition: 'opacity 1s ease',
                                        willChange: 'opacity',
                                        zIndex: 2,
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        width: '100%',
                                        height: '100%',
                                        ...getVideoStyleProps(getCurrentVideoSource)
                                    }}
                                    onError={() => handleVideoError(getCurrentVideoSource)}
                                    decoding="async"
                                    disablePictureInPicture
                                    data-aspect={getVideoAspectRatio(getCurrentVideoSource)}
                                >
                                    <source src={getCurrentVideoSource} type="video/mp4" />
                                </video>
                            ) : (
                                /* Desktop Video - Only show on desktop when videos exist */
                                !isMobile && desktopVideos.length > 0 && getCurrentVideoSource && (
                                    <video
                                        key={`desktop-video-${currentVideoIndex}`}
                                        autoPlay
                                        loop
                                        muted
                                        playsInline
                                        preload="metadata"
                                        onLoadedData={() => setVideoLoaded(true)}
                                        className="hero-video"
                                        style={{
                                            opacity: videoLoaded ? 1 : 0,
                                            transition: 'opacity 0.8s ease',
                                            zIndex: 2,
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover'
                                        }}
                                        onError={() => handleVideoError(getCurrentVideoSource)}
                                        decoding="async"
                                        disablePictureInPicture
                                    >
                                        <source src={getCurrentVideoSource} type="video/mp4" />
                                        <source src={getCurrentVideoSource.replace('.mp4', '.webm')} type="video/webm" />
                                    </video>
                                )
                            )}
                        </>
                    )}

                    <div className="hero-link">
                        <div className="hero-content">
                            <h1 className="hero-title" key={`title-${currentVideoIndex}`}>
                                {getCurrentSlideContent().title}
                            </h1>
                            <p className="hero-subtitle" key={`subtitle-${currentVideoIndex}`}>
                                {getCurrentSlideContent().subtitle}
                            </p>
                            <Link
                                to={getCurrentSlideContent().url}
                                className="hero-button"
                                key={`button-${currentVideoIndex}`}
                            >
                                {getCurrentSlideContent().buttonText}
                            </Link>
                        </div>

                        {/* Updated slideshow indicators to show on both mobile and desktop */}
                        {isClient && showVideo && (
                            (isMobile ? mobileVideos.length : desktopVideos.length) > 1
                        ) && (
                            <div className="slideshow-indicators">
                                {(isMobile ? mobileVideos : desktopVideos).map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => {
                                            setCurrentVideoIndex(index);
                                            setVideoLoaded(false);
                                        }}
                                        className={`indicator ${index === currentVideoIndex ? 'active' : ''}`}
                                        aria-label={`Go to slide ${index + 1}: ${slideContent[index]?.title || 'Slide'}`}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <style dangerouslySetInnerHTML={{
                    __html: styles + `
                .hero-background-video {
                    transform: translateZ(0);
                    backface-visibility: hidden;
                    perspective: 1000px;
                    will-change: opacity;
                }
                
                @media (prefers-reduced-motion: reduce) {
                    .hero-background-video {
                        transition: none !important;
                    }
                }
            `
                }} />
            </>
        );
    }

    return (
        <>
            <div ref={containerRef} className="hero-video-container">
                {/* Only show videos from metafields - no background images */}
                {getCurrentVideoSource && (
                    <video
                        key={`bg-video-${currentVideoIndex}`}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="hero-background-video desktop-video-only"
                        src={getCurrentVideoSource}
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            zIndex: 1,
                            transition: 'opacity 0.5s ease',
                            ...getVideoStyleProps(getCurrentVideoSource)
                        }}
                        onError={(e) => {
                            console.error('❌ Video background failed to load:', getCurrentVideoSource);
                            handleVideoError(getCurrentVideoSource);
                        }}
                        data-aspect={getVideoAspectRatio(getCurrentVideoSource)}
                    >
                        <source src={getCurrentVideoSource} type="video/mp4" />
                        <source src={getCurrentVideoSource.replace('.mp4', '.webm')} type="video/webm" />
                    </video>
                )}

                {(showVideo || getCurrentVideoSource) && (
                    <>
                        {/* Updated Mobile/Desktop Video Logic */}
                        {isMobile && mobileVideos.length > 0 && getCurrentVideoSource ? (
                            <video
                                ref={videoRef}
                                key={`mobile-video-${currentVideoIndex}`}
                                autoPlay
                                loop
                                muted
                                playsInline
                                preload="metadata"
                                onLoadedData={() => setVideoLoaded(true)}
                                onCanPlay={() => setVideoLoaded(true)}
                                className="hero-video"
                                style={{
                                    opacity: videoLoaded ? 1 : 0,
                                    transition: 'opacity 1s ease',
                                    willChange: 'opacity',
                                    zIndex: 2,
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '100%',
                                    height: '100%',
                                    ...getVideoStyleProps(getCurrentVideoSource)
                                }}
                                decoding="async"
                                disablePictureInPicture
                            >
                                <source src={getCurrentVideoSource} type="video/mp4" />
                            </video>
                        ) : (
                            /* Desktop Video - Only show on desktop when videos exist */
                            !isMobile && desktopVideos.length > 0 && getCurrentVideoSource && (
                                <video
                                    key={`desktop-video-${currentVideoIndex}`}
                                    autoPlay
                                    loop
                                    muted
                                    playsInline
                                    preload="metadata"
                                    onLoadedData={() => setVideoLoaded(true)}
                                    className="hero-video"
                                    style={{
                                        opacity: videoLoaded ? 1 : 0,
                                        transition: 'opacity 0.8s ease',
                                        zIndex: 2,
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover'
                                    }}
                                    onError={() => handleVideoError(getCurrentVideoSource)}
                                    decoding="async"
                                    disablePictureInPicture
                                >
                                    <source src={getCurrentVideoSource} type="video/mp4" />
                                    <source src={getCurrentVideoSource.replace('.mp4', '.webm')} type="video/webm" />
                                </video>
                            )
                        )}
                    </>
                )}

                <div className="hero-link">
                    <div className="hero-content">
                        <h1 className="hero-title" key={`title-${currentVideoIndex}`}>
                            {getCurrentSlideContent().title}
                        </h1>
                        <p className="hero-subtitle" key={`subtitle-${currentVideoIndex}`}>
                            {getCurrentSlideContent().subtitle}
                        </p>
                        <Link
                            to={getCurrentSlideContent().url}
                            className="hero-button"
                            key={`button-${currentVideoIndex}`}
                        >
                            {getCurrentSlideContent().buttonText}
                        </Link>
                    </div>

                    {/* Updated slideshow indicators to show on both mobile and desktop */}
                    {isClient && showVideo && (
                        (isMobile ? mobileVideos.length : desktopVideos.length) > 1
                    ) && (
                        <div className="slideshow-indicators">
                            {(isMobile ? mobileVideos : desktopVideos).map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => {
                                        setCurrentVideoIndex(index);
                                    }}
                                    className={`indicator ${index === currentVideoIndex ? 'active' : ''}`}
                                    aria-label={`Go to slide ${index + 1}: ${slideContent[index]?.title || 'Slide'}`}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: styles + `
                
                 @media (max-width: 767px) {
                  .hero-background-video {
                  display: none !important;
                  }
                }
        
                .hero-background-video {
                    transform: translateZ(0);
                    backface-visibility: hidden;
                    perspective: 1000px;
                    will-change: opacity;
                }
                
                .hero-title, .hero-subtitle, .hero-button {
                    transition: opacity 0.5s ease, transform 0.5s ease;
                }
                
                .hero-content > * {
                    animation: fadeInUp 0.8s ease-out;
                }
                
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                @media (prefers-reduced-motion: reduce) {
                    .hero-title, .hero-subtitle, .hero-button, .hero-background-video {
                        transition: none !important;
                        animation: none !important;
                    }
                }
                
                @media (max-width: 768px) {
                    .hero-background-video {
                        image-rendering: optimizeSpeed;
                        image-rendering: -webkit-optimize-contrast;
                        image-rendering: optimize-contrast;
                    }
                }
            `
            }} />
        </>
    );
}


const styles = `
    .hero-video-container {
    position: relative;
    width: 100vw;
    height: 100vh;
    margin: 0;
    padding: 0;
    left: 50%;
    right: 50%;
    margin-left: -50vw;
    margin-right: -50vw;
    overflow: hidden;
    transform: translateZ(0);
    backface-visibility: hidden;
    
    /* Responsive heights */
    height: 100vh; /* Desktop default */
    min-height: 500px;
}

    .hero-background-image,
    .hero-video {
         position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    transform: translateZ(0);
    backface-visibility: hidden;
    perspective: 1000px;
    will-change: opacity;
    }
    
    @media (max-width: 768px) {
    .hero-video {
        /* Optimize for mobile performance */
        image-rendering: optimizeSpeed;
        image-rendering: -webkit-optimize-contrast;
        image-rendering: optimize-contrast;
        
        /* Better object positioning for mobile */
        object-position: center center;
    }
    
    /* For vertical videos on mobile */
    .hero-video[data-aspect="vertical"] {
        object-position: center top;
    }
    
    /* For square videos on mobile */
    .hero-video[data-aspect="square"] {
        object-position: center center;
    }
}

@media (min-width: 769px) and (max-width: 1024px) {
    .hero-video-container {
        height: 80vh;
        min-height: 450px;
    }
}

/* Large desktop */
@media (min-width: 1440px) {
    .hero-video-container {
        height: 100vh;
        min-height: 600px;
   
    }
}

    .hero-video {
        /* Performance optimizations */
        transform: translateZ(0);
        backface-visibility: hidden;
        perspective: 1000px;
        will-change: opacity;
    }
    
    @media (max-width: 480px) {
    .hero-video-container {
        height: 60vh;
        min-height: 350px;
    }
}

@media (max-width: 768px) and (orientation: landscape) {
    .hero-video-container {
        height: 85vh;
        min-height: 300px;
    }
}

    /* Critical: Optimize video loading on mobile */
    @media (max-width: 768px) {
        .hero-video-container {
            height: 70vh;
            min-height: 400px;
            max-height: 600px;
        }
        
        .hero-video {
            /* Reduce quality on mobile for performance */
            image-rendering: optimizeSpeed;
            image-rendering: -webkit-optimize-contrast;
            image-rendering: optimize-contrast;
        }
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
    
    @media (max-width: 767px) {
    .slideshow-indicators {
        display: none !important;
    }
    
    .hero-video-container {
        height: 70vh; /* Optimize mobile height */
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
    const sectionRef = useRef(null);
    const [isVisible, setIsVisible] = useState(false);
    const [shouldPrioritizeImages, setShouldPrioritizeImages] = useState(false);

    // PERFORMANCE: Intersection Observer for lazy section loading
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsIntersecting(true);

                    // Always load video when intersecting and we have a video source
                    if (getCurrentVideoSource) {
                        setTimeout(() => {
                            setShouldLoadVideo(true);
                        }, 500);
                    }
                }
            },
            {
                threshold: 0.1,
                rootMargin: '100px'
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
    }, [getCurrentVideoSource]);

    // PERFORMANCE: Preload critical images when section becomes visible
    useEffect(() => {
        if (shouldPrioritizeImages && products) {
            // Preload first 2 product images for faster LCP
            const preloadImages = async () => {
                try {
                    const response = await products;
                    if (response?.products?.nodes) {
                        response.products.nodes.slice(0, 2).forEach((product, index) => {
                            if (product.featuredImage?.url) {
                                const link = document.createElement('link');
                                link.rel = 'preload';
                                link.as = 'image';
                                // Use optimized URL if possible
                                const imageUrl = product.featuredImage.url.includes('cdn.shopify.com')
                                    ? product.featuredImage.url + '?width=400&format=webp&quality=85'
                                    : product.featuredImage.url;
                                link.href = imageUrl;
                                link.type = 'image/webp';
                                document.head.appendChild(link);
                            }
                        });
                    }
                } catch (error) {
                    console.log('Preload failed:', error);
                }
            };

            preloadImages();
        }
    }, [shouldPrioritizeImages, products]);

    // Keep your original skeleton structure
    const fallbackSkeleton = useMemo(() => (
        <div className="recommended-products-grid mobile-single-column gap-4 md:gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
                <ProductSkeleton key={index} />
            ))}
        </div>
    ), []);

    // Keep your original grid classes exactly as they were
    const gridClasses = useMemo(() =>
            "recommended-products-grid mobile-single-column gap-4 md:gap-6",
        []
    );

    return (
        <div className="recommended-products" ref={sectionRef}>
            <div className="container-fluid mx-auto px-4 md:px-14" id="best-sellers" style={{ scrollMarginTop: '80px' }}>
                <p className="pt-8 pb-8 md:pt-14 md:pb-14 text-2xl md:text-[45px] font-poppins font-regular">  {isAboutPage
                    ? (locale === 'fr' ? 'NOTRE COLLECTION DIAMANT' : 'OUR DIAMANT COLLECTION')
                    : (locale === 'fr' ? 'NOS MEILLEURES VENTES' : 'OUR BEST SELLERS')
                }</p>

                <Suspense fallback={fallbackSkeleton}>
                    <Await resolve={products}>
                        {(response) => (
                            <div className={gridClasses}>
                                {response
                                    ? response.products.nodes.map((product, index) => {
                                        return (
                                        <ProductItem
                                            key={product.id}
                                            product={product}
                                            variant="roundedText"
                                            // PERFORMANCE: Smart loading strategy
                                            loading={index < 4 ? "eager" : "lazy"}
                                            fetchpriority={index < 2 ? "high" : "auto"}
                                        />
                                        )
                                    })
                                    : null}
                            </div>
                        )}
                    </Await>
                </Suspense>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                /* Keep your EXACT original mobile single column structure */
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

                /* FIX: Row gap control */
                .recommended-products-grid {
                    row-gap: 1rem !important;
                    /* PERFORMANCE: Advanced CSS containment */
                    contain: layout style paint;
                    transform: translateZ(0);
                    backface-visibility: hidden;
                    /* PERFORMANCE: Content visibility for better rendering */
                    content-visibility: auto;
                    contain-intrinsic-size: 800px;
                }

                @media (min-width: 768px) {
                    .recommended-products-grid {
                        row-gap: 1.5rem !important;
                    }
                }

                /* PERFORMANCE: Section optimizations */
                .recommended-products {
                    margin: 0;
                    /* PERFORMANCE: GPU acceleration */
                    transform: translateZ(0);
                    backface-visibility: hidden;
                    /* PERFORMANCE: Layout containment */
                    contain: layout style;
                }

                /* PERFORMANCE: Grid item optimizations */
                .recommended-products-grid > * {
                    contain: layout style;
                    transform: translateZ(0);
                    /* PERFORMANCE: Optimize will-change usage */
                    will-change: transform;
                }

                /* PERFORMANCE: Hover effects only on capable devices */
                @media (hover: hover) and (pointer: fine) {
                    .recommended-products-grid > *:hover {
                        transform: translateZ(0) translateY(-2px);
                        transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                    }
                }

                /* PERFORMANCE: Reduce motion for accessibility and performance */
                @media (prefers-reduced-motion: reduce) {
                    .recommended-products-grid > * {
                        transition: none !important;
                        will-change: auto !important;
                    }
                    
                    .recommended-products-grid > *:hover {
                        transform: translateZ(0) !important;
                    }
                }

                /* PERFORMANCE: Mobile optimizations */
                @media (max-width: 767px) {
                    .recommended-products-grid {
                        /* Simplify on mobile for better performance */
                        will-change: scroll-position;
                        contain: layout;
                        /* PERFORMANCE: Reduce complexity on mobile */
                        content-visibility: visible;
                    }
                    
                    .recommended-products-grid > * {
                        /* Reduce GPU layers on mobile */
                        will-change: auto;
                    }
                }

                /* PERFORMANCE: Data saver mode optimizations */
                @media (prefers-reduced-data: reduce) {
                    .recommended-products {
                        content-visibility: visible;
                    }
                    
                    .recommended-products-grid {
                        content-visibility: visible;
                    }
                    
                    .recommended-products-grid > * {
                        will-change: auto;
                        transform: none;
                    }
                }

                /* PERFORMANCE: High contrast mode optimizations */
                @media (prefers-contrast: high) {
                    .recommended-products-grid > * {
                        /* Disable complex effects in high contrast mode */
                        filter: none !important;
                        backdrop-filter: none !important;
                    }
                }

                /* PERFORMANCE: Print media optimization */
                @media print {
                    .recommended-products-grid > * {
                        transform: none !important;
                        transition: none !important;
                        will-change: auto !important;
                    }
                }
                `
            }} />
        </div>
    );
}

const FEATURED_COLLECTION_QUERY = `#graphql
  fragment FeaturedCollection on Collection {
    id
    title
    description
    handle
    image {
      id
      url
      altText
      width
      height
    }
    # 🎬 MINIMAL: Only use confirmed Video fields
    metafields(identifiers: [
      # Slide 1
      {namespace: "custom", key: "hero_mobile_video"},
      {namespace: "custom", key: "hero_mobile_video_slide_2"},
      {namespace: "custom", key: "hero_mobile_video_slide_3"},
      {namespace: "custom", key: "hero_background_image"},
      {namespace: "custom", key: "hero_title"},
      {namespace: "custom", key: "hero_subtitle"},
      {namespace: "custom", key: "hero_button_text"},
      {namespace: "custom", key: "hero_button_url_slide_1"},  # ✅ ADD THIS
      
      {namespace: "custom", key: "hero_title_en"},
      {namespace: "custom", key: "hero_subtitle_en"},
      {namespace: "custom", key: "hero_button_text_en"},
      
      {namespace: "custom", key: "hero_title_slide_2_en"},
      {namespace: "custom", key: "hero_subtitle_slide_2_en"},
      {namespace: "custom", key: "hero_button_text_slide_2_en"},
      
      {namespace: "custom", key: "hero_title_slide_3_en"},
      {namespace: "custom", key: "hero_subtitle_slide_3_en"},
      {namespace: "custom", key: "hero_button_text_slide_3_en"},
      
      # Slide 2
      {namespace: "custom", key: "hero_background_image_slide_2"},
      {namespace: "custom", key: "hero_title_slide_2"},
      {namespace: "custom", key: "hero_subtitle_slide_2"},
      {namespace: "custom", key: "hero_button_text_slide_2"},
      {namespace: "custom", key: "hero_button_url_slide_2"},  # ✅ ADD THIS
      
      # Slide 3
      {namespace: "custom", key: "hero_background_image_slide_3"},
      {namespace: "custom", key: "hero_title_slide_3"},
      {namespace: "custom", key: "hero_subtitle_slide_3"},
      {namespace: "custom", key: "hero_button_text_slide_3"},
      {namespace: "custom", key: "hero_button_url_slide_3"},  # ✅ ADD THIS
      
      # Guide
      {namespace: "custom", key: "guide_title"},
      {namespace: "custom", key: "guide_description"},
      {namespace: "custom", key: "guide_step_1_text"},
      {namespace: "custom", key: "guide_step_1_image"},
      {namespace: "custom", key: "guide_step_2_text"},
      {namespace: "custom", key: "guide_step_2_image"},
      {namespace: "custom", key: "guide_step_3_text"},
      {namespace: "custom", key: "guide_step_3_image"},
      {namespace: "custom", key: "guide_step_4_text"},
      {namespace: "custom", key: "guide_step_4_image"},
      {namespace: "custom", key: "guide_title_en"},
      {namespace: "custom", key: "guide_description_en"},
      {namespace: "custom", key: "guide_step_1_text_en"},
      {namespace: "custom", key: "guide_step_2_text_en"},
      {namespace: "custom", key: "guide_step_3_text_en"},
      {namespace: "custom", key: "guide_step_4_text_en"},
    ]) {
      id
      namespace
      key
      value
      type
      reference {
        # Support for MediaImage (images)
        ... on MediaImage {
          id
          image {
            url
            altText
          }
        }
        # 🎥 MINIMAL: Only use basic Video fields that definitely exist
        ... on Video {
          id
          sources {
            url
            mimeType
            format
            height
            width
          }
        }
        # Support for generic files
        ... on GenericFile {
          id
          url
          originalFileSize
        }
      }
    }
    products(first: 4) {
      nodes {
        id
        title
        handle
        featuredImage {
          url
          altText
        }
        priceRange {
          minVariantPrice {
            amount
            currencyCode
          }
        }
      }
    }
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

const BEST_SELLERS_COLLECTION_QUERY = `#graphql
  fragment BestSellersProduct on Product {
    id
    title
    handle
    tags                    # ← ADD THIS (copy from collection)
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
    variants(first: 10) {   # ← ADD THIS ENTIRE BLOCK (copy from collection)
      nodes {
        id
        title
        availableForSale
        price {
          amount
          currencyCode
        }
        selectedOptions {
          name
          value
        }
      }
    }
    # Add metafields for ratings
    metafields(identifiers: [
      {namespace: "custom", key: "product_rating"},
      {namespace: "custom", key: "review_count"}
    ]) {
      key
      value
    }
  }
  query BestSellersCollection($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    collection(handle: "best-sellers") {
      id
      title
      handle
      products(
        first: 20      
        sortKey: TITLE 
        reverse: false 
      ) {
        nodes {
          ...BestSellersProduct
        }
      }
    }
  }
`;

const RECOMMENDED_PRODUCTS_QUERY = `#graphql
  fragment RecommendedProduct on Product {
    id
    title
    handle
    tags                    # ✅ Already has this
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
    variants(first: 10) {   # ← ADD THIS ENTIRE BLOCK (missing from your query)
      nodes {
        id
        title
        availableForSale
        price {
          amount
          currencyCode
        }
        selectedOptions {
          name
          value
        }
      }
    }
    # Add metafields for ratings
    metafields(identifiers: [
      {namespace: "custom", key: "product_rating"},
      {namespace: "custom", key: "review_count"}
    ]) {
      key
      value
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