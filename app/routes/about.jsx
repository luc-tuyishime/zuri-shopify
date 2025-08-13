import { useLocale } from '~/hooks/useLocale';
import { Link, useLocation, useLoaderData } from "@remix-run/react";
import { useEffect, useState, useRef, useMemo } from 'react';
import { json } from '@shopify/remix-oxygen';
import Logo from '../assets/Vector3.svg';
import aboutBg from '~/assets/aboutbg.svg';
import founderImage from '~/assets/ceo.svg';
import VIDEO1 from '~/assets/video.mp4'
import VIDEO2 from '~/assets/video.mp4'
import VIDEO3 from '~/assets/video.mp4'
import MOBILE_VIDEO from '../assets/aaa.webm'
import {BestSellersProducts} from "~/routes/_index.jsx";
import {FAQ} from "~/components/Faq.jsx";

// Add the Best Sellers and Recommended Products queries at the top of the file
const BEST_SELLERS_COLLECTION_QUERY = `#graphql
  fragment BestSellersProduct on Product {
    id
    title
    handle
    tags
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
    variants(first: 10) {
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
    tags
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
    variants(first: 10) {
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

// Updated GraphQL query to include FeaturedCollection data
const ABOUT_PAGE_QUERY = `#graphql
  query AboutPage {
    shop {
      metafields(identifiers: [
        {namespace: "custom", key: "hero_title_en"},
        {namespace: "custom", key: "hero_title_fr"},
        {namespace: "custom", key: "hero_background_image"},
        {namespace: "custom", key: "stats_text_en"},
        {namespace: "custom", key: "stats_text_fr"},
        {namespace: "custom", key: "logos_banner_image"},
        {namespace: "custom", key: "founder_name"},
        {namespace: "custom", key: "founder_title_en"},
        {namespace: "custom", key: "founder_title_fr"},
        {namespace: "custom", key: "founder_bio_paragraph_1_en"},
        {namespace: "custom", key: "founder_bio_paragraph_1_fr"},
        {namespace: "custom", key: "founder_bio_paragraph_2_en"},
        {namespace: "custom", key: "founder_bio_paragraph_2_fr"},
        {namespace: "custom", key: "founder_bio_paragraph_3_en"},
        {namespace: "custom", key: "founder_bio_paragraph_3_fr"},
        {namespace: "custom", key: "founder_quote_en"},
        {namespace: "custom", key: "founder_quote_fr"},
        {namespace: "custom", key: "founder_image"}
      ]) {
        key
        value
        reference {
          ... on MediaImage {
            image {
              url
              altText
              width
              height
            }
          }
        }
      }
    }
    
    # Get featured collection for hero section
    collections(first: 1, sortKey: UPDATED_AT, reverse: true) {
      nodes {
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
        metafields(identifiers: [
          # Slide 1
          {namespace: "custom", key: "hero_background_image"},
          {namespace: "custom", key: "hero_title"},
          {namespace: "custom", key: "hero_subtitle"},
          {namespace: "custom", key: "hero_button_text"},
          {namespace: "custom", key: "hero_button_url_slide_1"},
          
          # Slide 2
          {namespace: "custom", key: "hero_background_image_slide_2"},
          {namespace: "custom", key: "hero_title_slide_2"},
          {namespace: "custom", key: "hero_subtitle_slide_2"},
          {namespace: "custom", key: "hero_button_text_slide_2"},
          {namespace: "custom", key: "hero_button_url_slide_2"},
          
          # Slide 3
          {namespace: "custom", key: "hero_background_image_slide_3"},
          {namespace: "custom", key: "hero_title_slide_3"},
          {namespace: "custom", key: "hero_subtitle_slide_3"},
          {namespace: "custom", key: "hero_button_text_slide_3"},
          {namespace: "custom", key: "hero_button_url_slide_3"}
        ]) {
          id
          namespace
          key
          value
          type
          reference {
            ... on MediaImage {
              id
              image {
                url
                altText
              }
            }
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
    }
  }
`;

// Updated loader function to include best sellers data
export async function loader({ context }) {
    try {
        const { storefront } = context;

        // Fetch all data in parallel
        const [aboutData, bestSellersResult, recommendedProductsResult] = await Promise.all([
            storefront.query(ABOUT_PAGE_QUERY),
            // Add best sellers collection query
            storefront.query(BEST_SELLERS_COLLECTION_QUERY, {
                variables: {
                    country: 'FR',
                    language: 'FR',
                },
            }).catch((error) => {
                console.error('Best Sellers collection error:', error);
                return null;
            }),
            // Add recommended products as fallback
            storefront.query(RECOMMENDED_PRODUCTS_QUERY, {
                variables: {
                    country: 'FR',
                    language: 'FR',
                },
            }).catch((error) => {
                console.error('Recommended products error:', error);
                return null;
            })
        ]);

        const { shop, collections } = aboutData;

        return json({
            shop,
            featuredCollection: collections.nodes[0] || null,
            bestSellersCollection: bestSellersResult,
            recommendedProducts: recommendedProductsResult
        });
    } catch (error) {
        console.error('Error loading about page data:', error);
        return json({
            shop: { metafields: [] },
            featuredCollection: null,
            bestSellersCollection: null,
            recommendedProducts: null
        });
    }
}

export const meta = () => {
    return [{title: `Zuri | About Us`}];
};

export const handle = {
    noLayout: true // Custom flag
};

// Helper function to get metafield value
function getMetafieldValue(metafields, key, fallback = '') {
    const metafield = metafields?.find(m => m?.key === key);
    if (metafield?.reference?.image?.url) {
        return metafield.reference.image.url;
    }
    return metafield?.value || fallback;
}

function TransparentHeader({ cart, header, isLoggedIn, publicStoreDomain }) {
    const [locale] = useLocale();
    const location = useLocation();
    const [isScrolled, setIsScrolled] = useState(false);

    // Create language switcher URLs that preserve current route
    const createLanguageUrl = (newLocale) => {
        const url = new URL(location.pathname + location.search, 'https://example.com');
        url.searchParams.set('locale', newLocale);
        return url.pathname + url.search;
    };

    // Handle scroll effect
    useEffect(() => {
        const handleScroll = () => {
            const scrollTop = window.scrollY;
            setIsScrolled(scrollTop > 50);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <header
            className="transparent-header transition-all duration-300"
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                zIndex: 9999,
                background: isScrolled ? 'rgba(139, 69, 19, 1)' : 'transparent',
                display: 'block',
                visibility: 'visible',
                opacity: 1
            }}
        >
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between py-4 sm:py-6">
                    {/* Logo */}
                    <Link to="/" className="flex items-center">
                        <img src={Logo} alt={header?.shop?.name || 'ZURI'} />
                    </Link>

                    {/* Right side - Navigation and actions */}
                    <div className="flex items-center space-x-8">
                        {/* Navigation */}
                        <nav className="hidden md:flex items-center space-x-8">
                            <Link
                                to="/collections/all"
                                className="text-white opacity-65 hover:text-gray-200 transition-colors  font-regular  font-inter  text-[15px]  uppercase tracking-wide"
                            >
                                {locale === 'fr' ? 'ACHETER MAINTENANT' : 'SHOP NOW'}
                            </Link>
                            <Link
                                to="/#best-sellers"
                                className="text-white opacity-65 hover:text-gray-200 transition-colors font-regular  font-inter  text-[15px] text-sm uppercase tracking-wide"
                            >
                                {locale === 'fr' ? 'Nos Meilleures Ventes' : 'OUR BEST SELLERS'}
                            </Link>
                            <Link
                                to="/about"
                                className="text-white/100 hover:text-gray-200 transition-colors font-semibold  font-inter  text-[15px] uppercase tracking-wide border-b border-white"
                            >
                                {locale === 'fr' ? 'À PROPOS' : 'ABOUT US'}
                            </Link>
                        </nav>

                        {/* Right side actions */}
                        <div className="flex items-center space-x-4">
                            {/* Search */}
                            <Link to="/search" className="text-white hover:text-gray-200 transition-colors">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </Link>

                            {/* Cart */}
                            <Link to="/cart" className="text-white hover:text-gray-200 transition-colors relative">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l-1 12H6L5 9z" />
                                </svg>
                                {cart?.totalQuantity > 0 && (
                                    <span className="absolute -top-2 -right-2 bg-white text-[#8B4513] text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                                        {cart.totalQuantity}
                                    </span>
                                )}
                            </Link>

                            {/* Account */}
                            <Link
                                to={isLoggedIn ? "/account" : ""}
                                className="text-white hover:text-gray-200 transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </Link>

                            {/* Mobile Menu Button */}
                            <button className="md:hidden text-white">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}

// FeaturedCollection Component (adapted for About page)
function AboutHeroFeaturedCollection({ collection }) {
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

    const getCurrentVideoSource = useMemo(() => {
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

            if (customBg && customBg.reference && customBg.reference.sources && Array.isArray(customBg.reference.sources) && customBg.reference.sources.length > 0) {
                const videoSource = customBg.reference.sources[0];
                let videoUrl = videoSource.url;

                if (!videoErrors.has(videoUrl)) {
                    console.log('✅ Using video:', videoUrl);
                    return videoUrl;
                }
            }

            // No video source available or video failed - return null for video-only setup
            return null;

        } catch (error) {
            console.error('🚨 Error getting video source:', error);
            return null;
        }
    }, [currentVideoIndex, collection?.metafields, videoErrors]);

    const handleVideoError = (videoUrl) => {
        console.error('❌ Video failed to load:', videoUrl);
        console.log('🔄 Adding to failed videos list and switching to fallback');
        setVideoErrors(prev => new Set([...prev, videoUrl]));
    };

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

            // Slide 1 - About Page specific content
            const slide1Title = getMetafield('hero_title');
            const slide1Subtitle = getMetafield('hero_subtitle');
            const slide1Button = getMetafield('hero_button_text');
            const slide1Url = getMetafield('hero_button_url_slide_1');

            slides.push({
                title: slide1Title?.value || (locale === 'fr'
                    ? 'Notre Histoire'
                    : 'Our Story'),
                subtitle: slide1Subtitle?.value || (locale === 'fr'
                    ? 'Découvrez l\'aventure Zuri'
                    : 'Discover the Zuri Journey'),
                buttonText: slide1Button?.value || (locale === 'fr'
                    ? 'EN SAVOIR PLUS'
                    : 'LEARN MORE'),
                url: slide1Url?.value || '#founder'
            });

            // Slide 2
            const slide2Title = getMetafield('hero_title_slide_2');
            const slide2Subtitle = getMetafield('hero_subtitle_slide_2');
            const slide2Button = getMetafield('hero_button_text_slide_2');
            const slide2Url = getMetafield('hero_button_url_slide_2');

            slides.push({
                title: slide2Title?.value || (locale === 'fr'
                    ? 'Innovation Beauté'
                    : 'Beauty Innovation'),
                subtitle: slide2Subtitle?.value || (locale === 'fr'
                    ? 'Redéfinir les standards de beauté'
                    : 'Redefining Beauty Standards'),
                buttonText: slide2Button?.value || (locale === 'fr'
                    ? 'DÉCOUVRIR'
                    : 'DISCOVER'),
                url: slide2Url?.value || collectionUrl
            });

            // Slide 3
            const slide3Title = getMetafield('hero_title_slide_3');
            const slide3Subtitle = getMetafield('hero_subtitle_slide_3');
            const slide3Button = getMetafield('hero_button_text_slide_3');
            const slide3Url = getMetafield('hero_button_url_slide_3');

            slides.push({
                title: slide3Title?.value || (locale === 'fr'
                    ? 'Autonomisation Féminine'
                    : 'Women Empowerment'),
                subtitle: slide3Subtitle?.value || (locale === 'fr'
                    ? 'Soutenir les femmes entrepreneures'
                    : 'Supporting Women Entrepreneurs'),
                buttonText: slide3Button?.value || (locale === 'fr'
                    ? 'REJOINDRE'
                    : 'JOIN US'),
                url: slide3Url?.value || collectionUrl
            });

            return slides;

        } catch (error) {
            console.error('Error generating slide content:', error);
            return [
                {
                    title: locale === 'fr' ? 'Notre Histoire' : 'Our Story',
                    subtitle: locale === 'fr' ? 'Découvrez Zuri' : 'Discover Zuri',
                    buttonText: locale === 'fr' ? 'EN SAVOIR PLUS' : 'LEARN MORE',
                    url: '#founder'
                }
            ];
        }
    }, [collection?.title, collection?.handle, collection?.metafields, locale, collectionUrl]);

    const getCurrentSlideContent = () => {
        if (slideContent.length === 0) {
            return {
                title: locale === 'fr' ? 'Notre Histoire' : 'Our Story',
                subtitle: locale === 'fr' ? 'Découvrez Zuri' : 'Discover Zuri',
                buttonText: locale === 'fr' ? 'EN SAVOIR PLUS' : 'LEARN MORE',
                url: '#founder'
            };
        }

        const slideIndex = currentVideoIndex % slideContent.length;
        return slideContent[slideIndex];
    };

    // Effects for mobile detection, intersection observer, etc.
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
            title: locale === 'fr' ? 'Notre Histoire' : 'Our Story',
            subtitle: locale === 'fr' ? 'Découvrez Zuri' : 'Discover Zuri',
            buttonText: locale === 'fr' ? 'EN SAVOIR PLUS' : 'LEARN MORE',
            url: '#founder'
        };

        return (
            <>
                <div ref={containerRef} className="hero-video-container">
                    {/* Only show videos - no background images */}
                    {getCurrentVideoSource && (
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
                                zIndex: 1,
                                opacity: 0,
                                transition: 'opacity 1s ease'
                            }}
                            onError={() => handleVideoError(getCurrentVideoSource)}
                            onCanPlay={(e) => {
                                console.log('✅ Video loaded successfully, fading in...');
                                e.target.style.opacity = '1';
                            }}
                            onLoadStart={() => console.log('🎥 Video loading started...')}
                            onLoadedData={() => console.log('✅ Video data loaded')}
                        >
                            <source src={getCurrentVideoSource} type="video/mp4" />
                        </video>
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
                    __html: heroStyles
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
                        className="hero-background-video"
                        src={getCurrentVideoSource}
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
                            console.error('❌ Video background failed to load:', getCurrentVideoSource);
                            handleVideoError(getCurrentVideoSource);
                        }}
                        onLoadStart={() => console.log('🎥 Video background loading started...')}
                        onCanPlay={() => console.log('✅ Video background ready to play')}
                        onLoadedData={() => console.log('✅ Video background data loaded')}
                        onLoadedMetadata={() => console.log('✅ Video background metadata loaded')}
                    >
                        <source src={getCurrentVideoSource} type="video/mp4" />
                        <source src={getCurrentVideoSource.replace('.mp4', '.webm')} type="video/webm" />
                    </video>
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
                __html: heroStyles
            }} />
        </>
    );
}

// Dynamic Stats Section Component
function StatsSection({ metafields }) {
    const [locale] = useLocale();

    // Get dynamic content with fallbacks
    const statsText = getMetafieldValue(
        metafields,
        locale === 'fr' ? 'stats_text_fr' : 'stats_text_en',
        locale === 'fr'
            ? "20 000 clients, 500 000 abonnés sur les réseaux sociaux, 60 employées femmes et un taux de croissance annuel de 100%."
            : "20,000 customers, 500,000 social media followers, 60 female employees, and an annual growth rate of 100%."
    );

    const logosImage = getMetafieldValue(metafields, 'logos_banner_image', Logo);

    return (
        <section className="py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                {/* Logos */}
                <div className="flex justify-center mb-12">
                    <img
                        src={logosImage}
                        alt="Featured in Forbes, BBC News, CNBC and other publications"
                        className="max-w-full h-auto"
                    />
                </div>

                {/* Stats Text */}
                <div className="text-center mb-12">
                    <p className="text-[21.48px] font-poppins text-[#000000] max-w-2xl mx-auto" style={{ lineHeight: '1.6' }}>
                        {statsText}
                    </p>
                </div>

                {/* Horizontal Line */}
                <div className="border-t border-gray-300 mb-16"></div>
            </div>
        </section>
    );
}

// Dynamic Founder Section Component
function FounderSection({ metafields }) {
    const [locale] = useLocale();

    // Get dynamic content with fallbacks
    const founderName = getMetafieldValue(metafields, 'founder_name', 'Gisela Van Houcke');
    const founderTitle = getMetafieldValue(
        metafields,
        locale === 'fr' ? 'founder_title_fr' : 'founder_title_en',
        locale === 'fr' ? 'Fondatrice & PDG' : 'Founder & CEO'
    );

    const paragraph1 = getMetafieldValue(
        metafields,
        locale === 'fr' ? 'founder_bio_paragraph_1_fr' : 'founder_bio_paragraph_1_en',
        locale === 'fr'
            ? "Zuri a été fondée en 2016 par Gisela Van Houcke. Elle est originaire de l'est de la République démocratique du Congo où elle a vécu jusqu'à son adolescence. Elle a dû fuir vers le Royaume-Uni en 2003 en raison des guerres et de l'instabilité politique dans la région."
            : "Zuri was founded in 2016 by Gisela Van Houcke. She is originally from the eastern Democratic Republic of Congo where she lived until her adolescence. She had to flee to the United Kingdom in 2003 due to wars and political instability in the region."
    );

    const paragraph2 = getMetafieldValue(
        metafields,
        locale === 'fr' ? 'founder_bio_paragraph_2_fr' : 'founder_bio_paragraph_2_en',
        locale === 'fr'
            ? "Gisela détient un diplôme de licence en droit anglais et français. Elle a quitté le domaine juridique dans le but d'autonomiser les femmes noires et de créer la première marque de beauté noire au monde."
            : "Gisela holds a Bachelor's degree in English and French Law. She left the legal field with the aim of empowering black women and creating the world's first black beauty brand."
    );

    const paragraph3 = getMetafieldValue(
        metafields,
        locale === 'fr' ? 'founder_bio_paragraph_3_fr' : 'founder_bio_paragraph_3_en',
        locale === 'fr'
            ? "Dans le classement \"Forbes Under 30\", qui est principalement dominé par de jeunes entrepreneurs anglophones d'Afrique, elle était la seule femme africaine francophone dans la catégorie \"business\". Une performance remarquable pour cette jeune entrepreneuse, mariée et mère de deux enfants."
            : "In the \"Forbes Under 30\" ranking, which is predominantly dominated by young entrepreneurs from Anglophone Africa, she was the only francophone African woman in the \"business\" category. A remarkable performance for this young entrepreneur, married and mother of two children."
    );

    const founderQuote = getMetafieldValue(
        metafields,
        locale === 'fr' ? 'founder_quote_fr' : 'founder_quote_en',
        locale === 'fr'
            ? "« Quand je suis revenue en Afrique, j'ai immédiatement remarqué un écart sur le marché des extensions et cosmétiques, particulièrement pour les personnes à la peau foncée. Les gens autour de moi me demandaient toujours de ramener des extensions et des produits cosmétiques lors de mes voyages. Cet écart était tout simplement inconcevable ; l'Afrique ayant un grand nombre de personnes intéressées par de tels produits. »"
            : "« When I came back to Africa, I immediately noticed a gap in the market for extensions and cosmetics, particularly for people with dark skin. People around me were always asking me to bring back extensions and cosmetic products when I traveled. This gap was simply inconceivable; Africa having a large number of people interested in such products. »"
    );

    const founderImg = getMetafieldValue(metafields, 'founder_image', founderImage);

    return (
        <div className="max-w-4xl mb-20 mx-auto" id="founder">
            {/* Founder Section - Two Column Grid */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
                {/* Image Column */}
                <div className="flex justify-center">
                    <div className="relative">
                        <img
                            src={founderImg}
                            alt={founderName}
                            className=""
                        />
                    </div>
                </div>

                {/* Text Column */}
                <div className="space-y-6">
                    {/* Name */}
                    <h2 className="text-3xl font-light text-gray-900">
                        {founderName}
                    </h2>

                    {/* Title */}
                    <p className="text-xl font-semibold text-gray-800">
                        {founderTitle}
                    </p>

                    {/* Description */}
                    <div className="space-y-4  text-gray-600" style={{ lineHeight: '1.7' }}>
                        <p>{paragraph1}</p>
                        <p>{paragraph2}</p>
                        <p>{paragraph3}</p>
                        <p>{founderQuote}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Hero styles (from original FeaturedCollection)
const heroStyles = `
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
        transform: translateZ(0);
        backface-visibility: hidden;
        perspective: 1000px;
        will-change: opacity;
    }

    @media (max-width: 768px) {
        .hero-video-container {
            height: 70vh;
            min-height: 400px;
        }
        
        .hero-video {
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
        text-decoration: none;
        display: inline-block;
    }

    .hero-button:hover {
        background-color: rgba(255, 255, 255, 0.1);
        transform: translateY(-1px);
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
    }

    .hero-button:active {
        transform: translateY(0);
    }

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

    @media (prefers-reduced-data: reduce) {
        .hero-video {
            display: none !important;
        }
        
        .video-play-overlay {
            display: none !important;
        }
    }

    @media (max-width: 768px) and (-webkit-min-device-pixel-ratio: 1) {
        .hero-video {
            transform: translate3d(0, 0, 0);
            -webkit-transform: translate3d(0, 0, 0);
        }
    }
`;

// Main About Us Page Component
export default function About({ cart, header, isLoggedIn, publicStoreDomain }) {
    const [locale] = useLocale();
    const location = useLocation();
    const data = useLoaderData();

    // Safely access metafields and featured collection with fallbacks
    const metafields = data?.shop?.metafields || [];
    const featuredCollection = data?.featuredCollection || null;

    // Only apply header hiding on the about page
    useEffect(() => {
        // Only run this effect on the about page
        if (location.pathname !== '/about') return;

        // Check if style element already exists to prevent duplication
        if (document.getElementById('about-page-header-override')) return;

        // Create and inject CSS specifically for the about page
        const styleElement = document.createElement('style');
        styleElement.id = 'about-page-header-override';
        styleElement.textContent = `
            /* Only apply these styles when we're on the about page */
            body[data-route="/about"] > main {
                margin: 0 !important;
                padding: 0 !important;
            }
            
            /* Hide existing headers only on about page */
            body[data-route="/about"] > header:not(.transparent-header),
            body[data-route="/about"] .layout-header,
            body[data-route="/about"] [data-header]:not(.transparent-header),
            body[data-route="/about"] header.fixed:not(.transparent-header),
            body[data-route="/about"] .header:not(.transparent-header),
            body[data-route="/about"] .site-header,
            body[data-route="/about"] .main-header,
            body[data-route="/about"] .shopify-header,
            body[data-route="/about"] .hydrogen-header,
            body[data-route="/about"] [data-testid="header"]:not(.transparent-header),
            body[data-route="/about"] .Header:not(.transparent-header),
            body[data-route="/about"] header[role="banner"]:not(.transparent-header) {
                display: none !important;
                visibility: hidden !important;
                opacity: 0 !important;
                z-index: -1 !important;
                position: absolute !important;
                top: -9999px !important;
            }
            
            /* Ensure our transparent header shows only on about page */
            body[data-route="/about"] .transparent-header {
                display: block !important;
                visibility: visible !important;
                opacity: 1 !important;
                z-index: 9999 !important;
                position: fixed !important;
                top: 0 !important;
                left: 0 !important;
                right: 0 !important;
            }
        `;

        document.head.appendChild(styleElement);

        // Add route data attribute to body for CSS targeting
        document.body.setAttribute('data-route', location.pathname);

        // Hide existing headers programmatically only on about page
        const hideExistingHeaders = () => {
            if (location.pathname !== '/about') return;

            const selectors = [
                'body > header:not(.transparent-header)',
                '.layout-header',
                '[data-header]:not(.transparent-header)',
                'header.fixed:not(.transparent-header)',
                '.header:not(.transparent-header)',
                '.site-header',
                '.main-header',
                '.shopify-header',
                '.hydrogen-header',
                '[data-testid="header"]:not(.transparent-header)',
                '.Header:not(.transparent-header)',
                'header[role="banner"]:not(.transparent-header)'
            ];

            selectors.forEach(selector => {
                const elements = document.querySelectorAll(selector);
                elements.forEach(el => {
                    el.style.display = 'none';
                    el.style.visibility = 'hidden';
                    el.style.opacity = '0';
                    el.style.zIndex = '-1';
                });
            });
        };

        hideExistingHeaders();
        const timer = setTimeout(hideExistingHeaders, 100);

        // Cleanup function - restore headers when leaving about page
        return () => {
            clearTimeout(timer);

            // Remove the injected styles
            const existingStyle = document.getElementById('about-page-header-override');
            if (existingStyle) {
                existingStyle.remove();
            }

            // Remove route data attribute
            document.body.removeAttribute('data-route');

            // Restore hidden headers
            const selectors = [
                'body > header:not(.transparent-header)',
                '.layout-header',
                '[data-header]:not(.transparent-header)',
                'header.fixed:not(.transparent-header)',
                '.header:not(.transparent-header)',
                '.site-header',
                '.main-header',
                '.shopify-header',
                '.hydrogen-header',
                '[data-testid="header"]:not(.transparent-header)',
                '.Header:not(.transparent-header)',
                'header[role="banner"]:not(.transparent-header)'
            ];

            selectors.forEach(selector => {
                const elements = document.querySelectorAll(selector);
                elements.forEach(el => {
                    el.style.display = '';
                    el.style.visibility = '';
                    el.style.opacity = '';
                    el.style.zIndex = '';
                });
            });
        };
    }, [location.pathname]);

    return (
        <div className="about-page-container">
            <TransparentHeader
                cart={cart}
                header={header}
                isLoggedIn={isLoggedIn}
                publicStoreDomain={publicStoreDomain}
            />

            {/* Featured Collection Hero Section - VIDEO ONLY */}
            {featuredCollection ? (
                <AboutHeroFeaturedCollection collection={featuredCollection} />
            ) : (
                /* Fallback - shows nothing if no video available */
                <div className="hero-video-container" style={{
                    background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <div className="hero-link">
                        <div className="hero-content">
                            <h1 className="hero-title" style={{ color: '#64748b' }}>
                                {locale === 'fr' ? 'Notre Histoire' : 'Our Story'}
                            </h1>
                            <p className="hero-subtitle" style={{ color: '#64748b' }}>
                                {locale === 'fr' ? 'Découvrez Zuri' : 'Discover Zuri'}
                            </p>
                            <Link
                                to="#founder"
                                className="hero-button"
                                style={{ borderColor: '#64748b', color: '#64748b' }}
                            >
                                {locale === 'fr' ? 'EN SAVOIR PLUS' : 'LEARN MORE'}
                            </Link>
                        </div>
                    </div>
                </div>
            )}

            {/* Original About Hero Image Section - Now below sliders */}
            <section
                className="relative w-full min-h-screen flex items-center justify-center"
                style={{
                    backgroundImage: `url(${aboutBg})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    margin: 0,
                    padding: 0,
                    boxSizing: 'border-box'
                }}
            >
                {/* Background overlay for better text readability */}
                <div className="absolute inset-0 bg-black bg-opacity-20"></div>

                {/* Content */}
                <div className="relative z-10 text-center w-full px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
                    <p className="text-[34px] sm:text-5xl md:text-5xl font-light font-poppins text-white mb-6 leading-snug" style={{ lineHeight: '1.2' }}>
                        {locale === 'fr'
                            ? 'Autonomiser les femmes noires grâce à notre plateforme de technologie beauté'
                            : 'Empowering Black women through our beauty tech platform'
                        }
                    </p>
                </div>
            </section>

            <BestSellersProducts
                bestSellersCollection={data.bestSellersCollection}
                fallbackProducts={data.recommendedProducts}
            />

            <FAQ product={data.featuredCollection} />

            <section
                className="relative w-full min-h-screen flex items-center justify-center"
                style={{
                    backgroundImage: `url(${aboutBg})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    margin: 0,
                    padding: 0,
                    boxSizing: 'border-box'
                }}
            >
                {/* Background overlay for better text readability */}
                <div className="absolute inset-0 bg-black bg-opacity-20"></div>

                {/* Content */}
                <div className="relative z-10 text-center w-full px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
                    <p className="text-[34px] sm:text-5xl md:text-5xl font-light font-poppins text-white mb-6 leading-snug" style={{ lineHeight: '1.2' }}>
                        {locale === 'fr'
                            ? 'Autonomiser les femmes noires grâce à notre plateforme de technologie beauté'
                            : 'Empowering Black women through our beauty tech platform'
                        }
                    </p>
                </div>
            </section>

            {/* Dynamic Stats Section */}
            {/*<StatsSection metafields={metafields} />*/}

            {/* Dynamic Founder Section */}
            {/*<FounderSection metafields={metafields} />*/}
        </div>
    );
}