import {Await, useLoaderData, Link} from '@remix-run/react';
import {Suspense, useEffect, useMemo, useRef, useState} from 'react';
import {Image} from '@shopify/hydrogen';
import {ProductItem} from '~/components/ProductItem';
import {WigGuideSection} from '~/components/WigGuideSection';
import {CUSTOMER_REVIEWS_QUERY, CustomerReviewsSection} from '~/components/CustomerReviewsSection';
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
    const [isVisible, setIsVisible] = useState(false);
    const [shouldPrioritizeImages, setShouldPrioritizeImages] = useState(false);

    // PERFORMANCE: Intersection Observer for lazy section loading
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    setShouldPrioritizeImages(true);
                    observer.disconnect();
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

        return () => observer.disconnect();
    }, []);

    // PERFORMANCE: Preload critical images when section becomes visible
    useEffect(() => {
        if (shouldPrioritizeImages && bestSellersCollection) {
            const preloadImages = async () => {
                try {
                    const response = await bestSellersCollection;
                    if (response?.collection?.products?.nodes) {
                        response.collection.products.nodes.slice(0, 2).forEach((product) => {
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
        <div className="recommended-products" ref={sectionRef}>
            <div className="container-fluid mx-auto px-4 md:px-14" id="best-sellers" style={{ scrollMarginTop: '80px' }}>
                <p className="pt-8 pb-8 md:pt-14 md:pb-14 text-2xl md:text-[45px] font-poppins font-regular">
                    {t.homepage.ourBestSellers}
                </p>

                <Suspense fallback={fallbackSkeleton}>
                    <Await resolve={bestSellersCollection}>
                        {(bestSellersResponse) => (
                            <>
                                {/* Show Best Sellers Collection if it exists and has products */}
                                {bestSellersResponse?.collection?.products?.nodes?.length > 0 ? (
                                    <div className={gridClasses}>
                                        {bestSellersResponse.collection.products.nodes.map((product, index) => (
                                            <ProductItem
                                                key={product.id}
                                                product={product}
                                                variant="roundedText"
                                                loading={index < 4 ? "eager" : "lazy"}
                                                fetchpriority={index < 2 ? "high" : "auto"}
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    /* Fallback to recommended products if Best Sellers collection is empty */
                                    <Suspense fallback={fallbackSkeleton}>
                                        <Await resolve={fallbackProducts}>
                                            {(fallbackResponse) => (
                                                <>
                                                    {fallbackResponse?.products?.nodes ? (
                                                        <>
                                                            {/* Show message that Best Sellers collection is being set up */}
                                                            {/*<div className="mb-6 p-4 bg-gray-50 rounded-lg border-l-4 border-blue-500">*/}
                                                            {/*    <p className="text-sm text-gray-600">*/}
                                                            {/*        {locale === 'fr'*/}
                                                            {/*            ? 'Collection "Meilleures Ventes" en cours de configuration. Affichage des produits recommandés.'*/}
                                                            {/*            : 'Best Sellers collection is being set up. Showing recommended products.'*/}
                                                            {/*        }*/}
                                                            {/*    </p>*/}
                                                            {/*</div>*/}

                                                            <div className={gridClasses}>
                                                                {fallbackResponse.products.nodes.map((product, index) => (
                                                                    <ProductItem
                                                                        key={product.id}
                                                                        product={product}
                                                                        variant="roundedText"
                                                                        loading={index < 4 ? "eager" : "lazy"}
                                                                        fetchpriority={index < 2 ? "high" : "auto"}
                                                                    />
                                                                ))}
                                                            </div>
                                                        </>
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

            {/* Keep your existing styles */}
            <style dangerouslySetInnerHTML={{
                __html: `
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

        .recommended-products-grid {
          row-gap: 1rem !important;
          contain: layout style paint;
          transform: translateZ(0);
          backface-visibility: hidden;
          content-visibility: auto;
          contain-intrinsic-size: 800px;
        }

        @media (min-width: 768px) {
          .recommended-products-grid {
            row-gap: 1.5rem !important;
          }
        }

        .recommended-products {
          margin: 0;
          transform: translateZ(0);
          backface-visibility: hidden;
          contain: layout style;
        }

        .recommended-products-grid > * {
          contain: layout style;
          transform: translateZ(0);
          will-change: transform;
        }

        @media (hover: hover) and (pointer: fine) {
          .recommended-products-grid > *:hover {
            transform: translateZ(0) translateY(-2px);
            transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .recommended-products-grid > * {
            transition: none !important;
            will-change: auto !important;
          }
          
          .recommended-products-grid > *:hover {
            transform: translateZ(0) !important;
          }
        }

        @media (max-width: 767px) {
          .recommended-products-grid {
            will-change: scroll-position;
            contain: layout;
            content-visibility: visible;
          }
          
          .recommended-products-grid > * {
            will-change: auto;
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
    const [isMobile, setIsMobile] = useState(false);
    const [videoLoaded, setVideoLoaded] = useState(false);
    const [isSlowConnection, setIsSlowConnection] = useState(false);
    const [isClient, setIsClient] = useState(false);
    const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
    const [isIntersecting, setIsIntersecting] = useState(false);
    const [shouldLoadVideo, setShouldLoadVideo] = useState(false);
    const [userRequestedVideo, setUserRequestedVideo] = useState(false);
    const [videoErrors, setVideoErrors] = useState(new Set());

    const containerRef = useRef(null);
    const videoRef = useRef(null);
    const [locale] = useLocale();
    const t = useTranslation(locale);

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

    const getCurrentBackgroundMedia = useMemo(() => {
        try {
            let customBg = null;

            switch (currentVideoIndex) {
                case 0:
                    customBg = getMetafield('hero_background_image');
                    break;
                case 1:
                    customBg = getMetafield('hero_background_image_slide_2');
                    break;
                case 2:
                    customBg = getMetafield('hero_background_image_slide_3');
                    break;
                default:
                    customBg = getMetafield('hero_background_image');
            }


            if (customBg && customBg.reference) {
                if (customBg.reference.sources && Array.isArray(customBg.reference.sources) && customBg.reference.sources.length > 0) {
                    const videoSource = customBg.reference.sources[0];
                    let videoUrl = videoSource.url;

                    if (videoErrors.has(videoUrl)) {
                        console.log('⚠️ Video previously failed, using fallback immediately');
                    } else {
                        console.log('✅ Attempting to use video:', videoUrl);
                        return {
                            type: 'video',
                            url: videoUrl,
                            fallbackImage: collection?.image?.url
                        };
                    }
                }

                if (customBg.reference.image && customBg.reference.image.url) {
                    const imageUrl = customBg.reference.image.url;
                    console.log('🔄 Using image fallback:', imageUrl);
                    const baseUrl = imageUrl.split('?')[0];
                    return {
                        type: 'image',
                        url: `${baseUrl}?width=1920&format=webp&quality=80&crop=center`
                    };
                }
            }

            if (collection?.image?.url) {
                const baseUrl = collection.image.url.split('?')[0];
                return {
                    type: 'image',
                    url: `${baseUrl}?width=1920&format=webp&quality=80&crop=center`
                };
            }

            return {
                type: 'image',
                url: `data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTkyMCIgaGVpZ2h0PSIxMDgwIiB2aWV3Qm94PSIwIDAgMTkyMCAxMDgwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8ZGVmcz4KPGF2YXJHcmFkaWVudCBpZD0iZ3JhZGllbnQiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPgo8c3RvcCBvZmZzZXQ9IjAlIiBzdHlsZT0ic3RvcC1jb2xvcjojZjFmNWY5O3N0b3Atb3BhY2l0eToxIiAvPgo8c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiNlMmU4ZjA7c3RvcC1vcGFjaXR5OjEiIC8+CjwvbGluZWFyR3JhZGllbnQ+CjwvZGVmcz4KPHJlY3Qgd2lkdGg9IjE5MjAiIGhlaWdodD0iMTA4MCIgZmlsbD0idXJsKCNncmFkaWVudCkiLz4KPHRleHQgeD0iOTYwIiB5PSI1MDAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM2Mzc1ODAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSI0OCI+U2xpZGUgJHtjdXJyZW50VmlkZW9JbmRleCArIDF9PC90ZXh0Pgo8L3N2Zz4K`
            };

        } catch (error) {
            console.error('🚨 Error in getCurrentBackgroundMedia:', error);
            return {
                type: 'image',
                url: collection?.image?.url || ''
            };
        }
    }, [currentVideoIndex, collection?.metafields, collection?.image?.url, videoErrors]);

    const handleVideoError = (videoUrl) => {
        console.error('❌ Video failed to load:', videoUrl);
        console.log('🔄 Adding to failed videos list and switching to fallback');
        setVideoErrors(prev => new Set([...prev, videoUrl]));
    };

    useEffect(() => {
        console.log('\n🔍🔍🔍 METAFIELD DEEP INSPECTION 🔍🔍🔍');

        if (collection?.metafields?.length > 0) {
            const backgroundMetafields = collection.metafields.filter(m =>
                m?.key?.includes('hero_background_image')
            );

            console.log('📋 BACKGROUND METAFIELDS FOUND:', backgroundMetafields.length);

            backgroundMetafields.forEach((metafield, index) => {
                console.log(`\n--- BACKGROUND METAFIELD ${index + 1} ---`);
                console.log('Key:', metafield.key);
                console.log('Value (GID):', metafield.value);
                console.log('Type:', metafield.type);
                console.log('Reference object:', metafield.reference);

                if (metafield.reference) {
                    console.log('Reference keys:', Object.keys(metafield.reference));

                    if (metafield.value?.includes('Video/')) {
                        console.log('🎥 THIS IS A VIDEO METAFIELD');
                        console.log('But reference structure:', metafield.reference);
                    }
                }
            });
        }

        console.log('🔍🔍🔍 END METAFIELD INSPECTION 🔍🔍🔍\n');
    }, [collection?.metafields]);

    const collectionUrl = useMemo(() => {
        return collection?.handle ? `/collections/${collection.handle}` : '/collections/all';
    }, [collection?.handle]);

    const OPTIMIZED_MOBILE_VIDEO = typeof MOBILE_VIDEO !== 'undefined' ? MOBILE_VIDEO : null;
    const desktopVideos = [
        typeof VIDEO1 !== 'undefined' ? VIDEO1 : null,
        typeof VIDEO2 !== 'undefined' ? VIDEO2 : null,
        typeof VIDEO3 !== 'undefined' ? VIDEO3 : null
    ].filter(Boolean);

    const slideContent = useMemo(() => {
        try {
            const slides = [];

            const slide1Title = getMetafield('hero_title');
            const slide1Subtitle = getMetafield('hero_subtitle');
            const slide1Button = getMetafield('hero_button_text');

            slides.push({
                title: slide1Title?.value || t.hero?.defaultTitle || `Discover ${collection?.title || 'Our Collection'}`,
                subtitle: slide1Subtitle?.value || t.hero?.defaultSubtitle || 'Premium Quality Collection',
                buttonText: slide1Button?.value || t.hero?.defaultButton || 'SHOP COLLECTION',
                url: collectionUrl
            });

            const slide2Title = getMetafield('hero_title_slide_2');
            const slide2Subtitle = getMetafield('hero_subtitle_slide_2');
            const slide2Button = getMetafield('hero_button_text_slide_2');

            slides.push({
                title: slide2Title?.value || t.hero?.slide2Title || 'Natural Beauty Redefined',
                subtitle: slide2Subtitle?.value || t.hero?.slide2Subtitle || '100% Human Hair Collection',
                buttonText: slide2Button?.value || t.hero?.slide2Button || 'EXPLORE STYLES',
                url: collectionUrl
            });

            const slide3Title = getMetafield('hero_title_slide_3');
            const slide3Subtitle = getMetafield('hero_subtitle_slide_3');
            const slide3Button = getMetafield('hero_button_text_slide_3');

            slides.push({
                title: slide3Title?.value || t.hero?.slide3Title || 'Transform Your Style',
                subtitle: slide3Subtitle?.value || t.hero?.slide3Subtitle || 'Expert Crafted Designs',
                buttonText: slide3Button?.value || t.hero?.slide3Button || 'VIEW ALL',
                url: collectionUrl
            });

            return slides;

        } catch (error) {
            console.error('Error generating slide content:', error);
            return [
                {
                    title: 'Our Collection',
                    subtitle: 'Premium Quality',
                    buttonText: 'SHOP NOW',
                    url: '/collections/all'
                }
            ];
        }
    }, [collection?.title, collection?.handle, collection?.metafields, t, locale, collectionUrl]);

    const getCurrentSlideContent = () => {
        if (slideContent.length === 0) {
            return {
                title: 'Our Collection',
                subtitle: 'Premium Quality',
                buttonText: 'SHOP NOW',
                url: '/collections/all'
            };
        }

        const slideIndex = currentVideoIndex % slideContent.length;
        return slideContent[slideIndex];
    };

    useEffect(() => {

        if (collection?.metafields?.length > 0) {
            console.log('📋 ALL METAFIELDS COUNT:', collection.metafields.length);

            const bg1 = getMetafield('hero_background_image');
            const bg2 = getMetafield('hero_background_image_slide_2');
            const bg3 = getMetafield('hero_background_image_slide_3');

            console.log('🖼️ BACKGROUND METAFIELDS:');
            console.log('Slide 1 background:', bg1 ? 'Found' : 'Not found');
            console.log('Slide 2 background:', bg2 ? 'Found' : 'Not found');
            console.log('Slide 3 background:', bg3 ? 'Found' : 'Not found');

            console.log('🎬 CONTENT METAFIELDS:');
            console.log('Slide 1:', {
                title: getMetafield('hero_title')?.value || 'Not set',
                subtitle: getMetafield('hero_subtitle')?.value || 'Not set',
                button: getMetafield('hero_button_text')?.value || 'Not set'
            });
            console.log('Slide 2:', {
                title: getMetafield('hero_title_slide_2')?.value || 'Not set',
                subtitle: getMetafield('hero_subtitle_slide_2')?.value || 'Not set',
                button: getMetafield('hero_button_text_slide_2')?.value || 'Not set'
            });
            console.log('Slide 3:', {
                title: getMetafield('hero_title_slide_3')?.value || 'Not set',
                subtitle: getMetafield('hero_subtitle_slide_3')?.value || 'Not set',
                button: getMetafield('hero_button_text_slide_3')?.value || 'Not set'
            });

        } else {
            console.log('❌ No metafields found');
        }


    }, [collection, slideContent, currentVideoIndex, getCurrentBackgroundMedia]);

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
        if (getCurrentBackgroundMedia.url &&
            getCurrentBackgroundMedia.url.startsWith('http') &&
            getCurrentBackgroundMedia.type === 'image') {

            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'image';
            link.href = getCurrentBackgroundMedia.url;
            link.type = 'image/webp';
            link.fetchPriority = 'high';
            link.onerror = () => console.warn('Failed to preload background image:', getCurrentBackgroundMedia.url);
            link.onload = () => console.log('✅ Background image preloaded successfully');

            document.head.appendChild(link);

            return () => {
                try {
                    if (document.head.contains(link)) {
                        document.head.removeChild(link);
                    }
                } catch (error) {
                    console.warn('Error removing preload link:', error);
                }
            };
        }
    }, [getCurrentBackgroundMedia]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsIntersecting(true);

                    if (!isMobile && !isSlowConnection && desktopVideos.length > 0) {
                        setTimeout(() => {
                            setShouldLoadVideo(true);
                        }, 1000);
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
    }, [isMobile, isSlowConnection, desktopVideos.length]);

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

    useEffect(() => {
        if (!isMobile && isClient && shouldLoadVideo && desktopVideos.length > 1) {
            const interval = setInterval(() => {
                setCurrentVideoIndex((prevIndex) =>
                    (prevIndex + 1) % desktopVideos.length
                );
                setVideoLoaded(false);
            }, 8000);

            return () => clearInterval(interval);
        }
    }, [isMobile, isClient, shouldLoadVideo, desktopVideos.length]);

    const handlePlayVideo = () => {
        setUserRequestedVideo(true);
        setShouldLoadVideo(true);
    };

    const showVideo = shouldLoadVideo && isIntersecting;

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
                    {getCurrentBackgroundMedia.type === 'video' && !videoErrors.has(getCurrentBackgroundMedia.url) ? (
                        <>
                            <div
                                className="hero-background-image"
                                style={{
                                    backgroundImage: getCurrentBackgroundMedia.fallbackImage ?
                                        `url(${getCurrentBackgroundMedia.fallbackImage})` :
                                        collection?.image?.url ? `url(${collection.image.url})` : 'none',
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    backgroundRepeat: 'no-repeat',
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '100%',
                                    height: '100%',
                                    zIndex: 1
                                }}
                            />

                            <video
                                key={`bg-video-${currentVideoIndex}`}
                                autoPlay
                                loop
                                muted
                                playsInline
                                className="hero-background-video"
                                preload="metadata"
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                    objectPosition: 'center',
                                    zIndex: 2,
                                    opacity: 0,
                                    transition: 'opacity 1s ease'
                                }}
                                onError={() => handleVideoError(getCurrentBackgroundMedia.url)}
                                onCanPlay={(e) => {
                                    console.log('✅ Video loaded successfully, fading in...');
                                    e.target.style.opacity = '1';
                                }}
                                onLoadStart={() => console.log('🎥 Video loading started...')}
                                onLoadedData={() => console.log('✅ Video data loaded')}
                            >
                                <source src={getCurrentBackgroundMedia.url} type="video/mp4" />
                            </video>
                        </>
                    ) : (
                        <div
                            className="hero-background-image"
                            style={{
                                backgroundImage: `url(${getCurrentBackgroundMedia.url})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                backgroundRepeat: 'no-repeat',
                                transition: 'opacity 0.5s ease',
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                zIndex: 1
                            }}
                            key={`background-${currentVideoIndex}`}
                        />
                    )}

                    {showVideo && desktopVideos.length > 0 && (
                        <>
                            {isMobile && OPTIMIZED_MOBILE_VIDEO ? (
                                <video
                                    ref={videoRef}
                                    key="mobile-video"
                                    autoPlay
                                    loop
                                    muted
                                    playsInline
                                    preload="none"
                                    onLoadedData={() => setVideoLoaded(true)}
                                    onCanPlay={() => setVideoLoaded(true)}
                                    className="hero-video"
                                    style={{
                                        opacity: videoLoaded ? 1 : 0,
                                        transition: 'opacity 1s ease',
                                        willChange: 'opacity',
                                        zIndex: 3
                                    }}
                                    decoding="async"
                                    disablePictureInPicture
                                >
                                    <source src={OPTIMIZED_MOBILE_VIDEO} type="video/webm" />
                                </video>
                            ) : !isMobile && desktopVideos[currentVideoIndex] ? (
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
                                        zIndex: 3
                                    }}
                                    decoding="async"
                                    disablePictureInPicture
                                >
                                    <source src={desktopVideos[currentVideoIndex]} type="video/mp4" />
                                </video>
                            ) : null}
                        </>
                    )}

                    {isMobile && isIntersecting && !userRequestedVideo && OPTIMIZED_MOBILE_VIDEO && (
                        <div className="video-play-overlay">
                            <button
                                onClick={handlePlayVideo}
                                className="play-button"
                                aria-label="Play background video"
                            >
                                <svg className="play-icon" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M8 5v14l11-7z"/>
                                </svg>
                                <span className="play-text">Play Video</span>
                            </button>
                        </div>
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

                        {!isMobile && isClient && showVideo && desktopVideos.length > 1 && (
                            <div className="slideshow-indicators">
                                {desktopVideos.map((_, index) => (
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
                
                .hero-background-image {
                    transition: opacity 0.5s ease !important;
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
                {getCurrentBackgroundMedia.type === 'video' ? (
                    <video
                        key={`bg-video-${currentVideoIndex}`}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="hero-background-video"
                        src={getCurrentBackgroundMedia.url}
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            objectPosition: 'center',
                            zIndex: 1,
                            transition: 'opacity 0.5s ease'
                        }}
                        onError={(e) => {
                            console.error('❌ Video background failed to load:', getCurrentBackgroundMedia.url);
                            console.error('Error details:', e);

                            const videoElement = e.target;
                            if (videoElement && videoElement.error) {
                                console.error('🔍 Video Error Code:', videoElement.error.code);
                                console.error('🔍 Video Error Message:', videoElement.error.message);
                                console.error('🔍 Full Error Object:', videoElement.error);
                            }

                            handleVideoError(getCurrentBackgroundMedia.url);
                            console.log('🔄 Falling back to collection image due to video error');
                        }}
                        onLoadStart={() => console.log('🎥 Video background loading started...')}
                        onCanPlay={() => console.log('✅ Video background ready to play')}
                        onLoadedData={() => console.log('✅ Video background data loaded')}
                        onLoadedMetadata={() => console.log('✅ Video background metadata loaded')}
                    >
                        <source src={getCurrentBackgroundMedia.url} type="video/mp4" />
                        <source src={getCurrentBackgroundMedia.url.replace('.mp4', '.webm')} type="video/webm" />

                        <div
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                backgroundImage: collection?.image?.url ? `url(${collection.image.url})` : 'none',
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                backgroundRepeat: 'no-repeat'
                            }}
                        />
                    </video>
                ) : (
                    <div
                        className="hero-background-image"
                        style={{
                            backgroundImage: `url(${getCurrentBackgroundMedia.url})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            backgroundRepeat: 'no-repeat',
                            transition: 'opacity 0.5s ease',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            zIndex: 1
                        }}
                        key={`background-${currentVideoIndex}`}
                    />
                )}

                {showVideo && desktopVideos.length > 0 && (
                    <>
                        {isMobile && OPTIMIZED_MOBILE_VIDEO ? (
                            <video
                                ref={videoRef}
                                key="mobile-video"
                                autoPlay
                                loop
                                muted
                                playsInline
                                preload="none"
                                onLoadedData={() => setVideoLoaded(true)}
                                onCanPlay={() => setVideoLoaded(true)}
                                className="hero-video"
                                style={{
                                    opacity: videoLoaded ? 1 : 0,
                                    transition: 'opacity 1s ease',
                                    willChange: 'opacity',
                                    zIndex: 2
                                }}
                                decoding="async"
                                disablePictureInPicture
                            >
                                <source src={OPTIMIZED_MOBILE_VIDEO} type="video/webm" />
                            </video>
                        ) : !isMobile && desktopVideos[currentVideoIndex] ? (
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
                                    zIndex: 2
                                }}
                                decoding="async"
                                disablePictureInPicture
                            >
                                <source src={desktopVideos[currentVideoIndex]} type="video/mp4" />
                            </video>
                        ) : null}
                    </>
                )}

                {isMobile && isIntersecting && !userRequestedVideo && OPTIMIZED_MOBILE_VIDEO && (
                    <div className="video-play-overlay">
                        <button
                            onClick={handlePlayVideo}
                            className="play-button"
                            aria-label="Play background video"
                        >
                            <svg className="play-icon" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z"/>
                            </svg>
                            <span className="play-text">Play Video</span>
                        </button>
                    </div>
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

                    {!isMobile && isClient && showVideo && desktopVideos.length > 1 && (
                        <div className="slideshow-indicators">
                            {desktopVideos.map((_, index) => (
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
                
                .hero-background-image {
                    transition: opacity 0.5s ease !important;
                }
                
                @media (prefers-reduced-motion: reduce) {
                    .hero-title, .hero-subtitle, .hero-button, .hero-background-image, .hero-background-video {
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
    const sectionRef = useRef(null);
    const [isVisible, setIsVisible] = useState(false);
    const [shouldPrioritizeImages, setShouldPrioritizeImages] = useState(false);

    // PERFORMANCE: Intersection Observer for lazy section loading
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    // PERFORMANCE: Start prioritizing images when section becomes visible
                    setShouldPrioritizeImages(true);
                    observer.disconnect(); // Stop observing once visible
                }
            },
            {
                threshold: 0.1,
                rootMargin: '100px' // Start loading 100px before visible
            }
        );

        if (sectionRef.current) {
            observer.observe(sectionRef.current);
        }

        return () => observer.disconnect();
    }, []);

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
                <p className="pt-8 pb-8 md:pt-14 md:pb-14 text-2xl md:text-[45px] font-poppins font-regular"> {t.homepage.ourBestSellers}</p>

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
      {namespace: "custom", key: "hero_background_image"},
      {namespace: "custom", key: "hero_title"},
      {namespace: "custom", key: "hero_subtitle"},
      {namespace: "custom", key: "hero_button_text"},
      
      # Slide 2
      {namespace: "custom", key: "hero_background_image_slide_2"},
      {namespace: "custom", key: "hero_title_slide_2"},
      {namespace: "custom", key: "hero_subtitle_slide_2"},
      {namespace: "custom", key: "hero_button_text_slide_2"},
      
      # Slide 3
      {namespace: "custom", key: "hero_background_image_slide_3"},
      {namespace: "custom", key: "hero_title_slide_3"},
      {namespace: "custom", key: "hero_subtitle_slide_3"},
      {namespace: "custom", key: "hero_button_text_slide_3"},
      
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
      {namespace: "custom", key: "guide_step_4_image"}
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
  query BestSellersCollection($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    collection(handle: "best-sellers") {
      id
      title
      handle
      products(first: 8) {
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