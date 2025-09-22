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
import {AboutFAQ} from "~/components/AboutFAQ.jsx";
import {LanguageSwitcher} from "~/components/LanguageSwitcher.jsx";

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
    # Get featured collection for About hero section with About-specific metafields
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
          # About Mobile Video
          {namespace: "custom", key: "about_hero_mobile_video"},
          
          # About Slide 1
          {namespace: "custom", key: "about_hero_background_image"},
          {namespace: "custom", key: "about_hero_title_en"},
          {namespace: "custom", key: "about_hero_title_fr"},
          {namespace: "custom", key: "about_hero_subtitle_en"},
          {namespace: "custom", key: "about_hero_subtitle_fr"},
          {namespace: "custom", key: "about_hero_button_text_en"},
          {namespace: "custom", key: "about_hero_button_text_fr"},
          {namespace: "custom", key: "about_hero_button_url_slide_1"},
          
          {namespace: "custom", key: "about_banner_background_image"},
          {namespace: "custom", key: "about_banner_title_en"},
          {namespace: "custom", key: "about_banner_title_fr"},
          
          # About Slide 2
          {namespace: "custom", key: "about_hero_background_image_slide_2"},
          {namespace: "custom", key: "about_hero_title_slide_2_en"},
          {namespace: "custom", key: "about_hero_title_slide_2_fr"},
          {namespace: "custom", key: "about_hero_subtitle_slide_2_en"},
          {namespace: "custom", key: "about_hero_subtitle_slide_2_fr"},
          {namespace: "custom", key: "about_hero_button_text_slide_2_en"},
          {namespace: "custom", key: "about_hero_button_text_slide_2_fr"},
          {namespace: "custom", key: "about_hero_button_url_slide_2"},
          
          # About Slide 3
          {namespace: "custom", key: "about_hero_background_image_slide_3"},
          {namespace: "custom", key: "about_hero_title_slide_3_en"},
          {namespace: "custom", key: "about_hero_title_slide_3_fr"},
          {namespace: "custom", key: "about_hero_subtitle_slide_3_en"},
          {namespace: "custom", key: "about_hero_subtitle_slide_3_fr"},
          {namespace: "custom", key: "about_hero_button_text_slide_3_en"},
          {namespace: "custom", key: "about_hero_button_text_slide_3_fr"},
          {namespace: "custom", key: "about_hero_button_url_slide_3"},
          {namespace: "custom", key: "about_faq_title_en"},
          {namespace: "custom", key: "about_faq_title_fr"},
          {namespace: "custom", key: "about_faq_1_question_en"},
          {namespace: "custom", key: "about_faq_1_question_fr"},
          {namespace: "custom", key: "about_faq_1_answer_en"},
          {namespace: "custom", key: "about_faq_1_answer_fr"},
          {namespace: "custom", key: "about_faq_2_question_en"},
          {namespace: "custom", key: "about_faq_2_question_fr"},
          {namespace: "custom", key: "about_faq_2_answer_en"},
          {namespace: "custom", key: "about_faq_2_answer_fr"},
          {namespace: "custom", key: "about_faq_3_question_en"},
          {namespace: "custom", key: "about_faq_3_question_fr"},
          {namespace: "custom", key: "about_faq_3_answer_en"},
          {namespace: "custom", key: "about_faq_3_answer_fr"},
          {namespace: "custom", key: "about_faq_4_question_en"},
          {namespace: "custom", key: "about_faq_4_question_fr"},
          {namespace: "custom", key: "about_faq_4_answer_en"},
          {namespace: "custom", key: "about_faq_4_answer_fr"},
          {namespace: "custom", key: "about_faq_5_question_en"},
          {namespace: "custom", key: "about_faq_5_question_fr"},
          {namespace: "custom", key: "about_faq_5_answer_en"},
          {namespace: "custom", key: "about_faq_5_answer_fr"},
          
          # Bottom Slider Mobile Video
          {namespace: "custom", key: "about_bottom_slider_mobile_video"},
          
          # Bottom Slider Slide 1
          {namespace: "custom", key: "about_bottom_slider_background_image"},
          {namespace: "custom", key: "about_bottom_slider_title_en"},
          {namespace: "custom", key: "about_bottom_slider_title_fr"},
          {namespace: "custom", key: "about_bottom_slider_subtitle_en"},
          {namespace: "custom", key: "about_bottom_slider_subtitle_fr"},
          {namespace: "custom", key: "about_bottom_slider_button_text_en"},
          {namespace: "custom", key: "about_bottom_slider_button_text_fr"},
          {namespace: "custom", key: "about_bottom_slider_button_url_slide_1"},
          
          # Bottom Slider Slide 2
          {namespace: "custom", key: "about_bottom_slider_background_image_slide_2"},
          {namespace: "custom", key: "about_bottom_slider_title_slide_2_en"},
          {namespace: "custom", key: "about_bottom_slider_title_slide_2_fr"},
          {namespace: "custom", key: "about_bottom_slider_subtitle_slide_2_en"},
          {namespace: "custom", key: "about_bottom_slider_subtitle_slide_2_fr"},
          {namespace: "custom", key: "about_bottom_slider_button_text_slide_2_en"},
          {namespace: "custom", key: "about_bottom_slider_button_text_slide_2_fr"},
          {namespace: "custom", key: "about_bottom_slider_button_url_slide_2"},
          
          # Bottom Slider Slide 3
          {namespace: "custom", key: "about_bottom_slider_background_image_slide_3"},
          {namespace: "custom", key: "about_bottom_slider_title_slide_3_en"},
          {namespace: "custom", key: "about_bottom_slider_title_slide_3_fr"},
          {namespace: "custom", key: "about_bottom_slider_subtitle_slide_3_en"},
          {namespace: "custom", key: "about_bottom_slider_subtitle_slide_3_fr"},
          {namespace: "custom", key: "about_bottom_slider_button_text_slide_3_en"},
          {namespace: "custom", key: "about_bottom_slider_button_text_slide_3_fr"},
          {namespace: "custom", key: "about_bottom_slider_button_url_slide_3"},
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

        const { collections } = aboutData;

        return json({
            featuredCollection: collections.nodes[0] || null,
            bestSellersCollection: bestSellersResult,
            recommendedProducts: recommendedProductsResult
        });
    } catch (error) {
        console.error('Error loading about page data:', error);
        return json({
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
    const [currentLocale, setCurrentLocale] = useLocale();
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
                background: isScrolled ? 'rgba(139, 69, 19, 0.8)' : 'transparent',
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
                            <LanguageSwitcher
                                currentLocale={currentLocale}
                                onLocaleChange={setCurrentLocale}
                            />
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
                            {/*<Link to="/cart" className="text-white hover:text-gray-200 transition-colors relative">*/}
                            {/*    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">*/}
                            {/*        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l-1 12H6L5 9z" />*/}
                            {/*    </svg>*/}
                            {/*    {cart?.totalQuantity > 0 && (*/}
                            {/*        <span className="absolute -top-2 -right-2 bg-white text-[#8B4513] text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">*/}
                            {/*            {cart.totalQuantity}*/}
                            {/*        </span>*/}
                            {/*    )}*/}
                            {/*</Link>*/}

                            {/* Account */}
                            {/*<Link*/}
                            {/*    to={isLoggedIn ? "/account" : ""}*/}
                            {/*    className="text-white hover:text-gray-200 transition-colors"*/}
                            {/*>*/}
                            {/*    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">*/}
                            {/*        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />*/}
                            {/*    </svg>*/}
                            {/*</Link>*/}

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

function AboutHeroFeaturedCollection({ collection }) {
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
                    customBg = getMetafield('about_hero_background_image');
                    break;
                case 1:
                    customBg = getMetafield('about_hero_background_image_slide_2');
                    break;
                case 2:
                    customBg = getMetafield('about_hero_background_image_slide_3');
                    break;
                default:
                    customBg = getMetafield('about_hero_background_image');
            }

            // Check if it's a direct URL string (Cloudinary)
            if (customBg?.value && typeof customBg.value === 'string' && customBg.value.startsWith('http')) {
                return customBg.value;
            }

            // Check if it's a video reference
            if (customBg?.reference?.sources && Array.isArray(customBg.reference.sources) && customBg.reference.sources.length > 0) {
                const videoSource = customBg.reference.sources[0];
                let videoUrl = videoSource.url;

                if (!videoErrors.has(videoUrl)) {
                    return videoUrl;
                }
            }

            return null;

        } catch (error) {
            console.error('Error getting video source:', error);
            return null;
        }
    }, [currentVideoIndex, collection?.metafields, videoErrors]);

    const handleVideoError = (videoUrl) => {
        setVideoErrors(prev => new Set([...prev, videoUrl]));
    };

    const collectionUrl = useMemo(() => {
        return collection?.handle ? `/collections/${collection.handle}` : '/collections/all';
    }, [collection?.handle]);

    const OPTIMIZED_MOBILE_VIDEO = useMemo(() => {
        const mobileVideoMetafield = getMetafield('about_hero_mobile_video');
        if (mobileVideoMetafield?.value && mobileVideoMetafield.value.startsWith('http')) {
            return mobileVideoMetafield.value;
        }
        return getCurrentVideoSource;
    }, [collection?.metafields, getCurrentVideoSource]);

    const desktopVideos = useMemo(() => {
        const videos = [];

        const video1Metafield = getMetafield('about_hero_background_image');
        if (video1Metafield?.value && typeof video1Metafield.value === 'string' && video1Metafield.value.startsWith('http')) {
            videos.push(video1Metafield.value);
        } else if (video1Metafield?.reference?.sources?.[0]?.url) {
            videos.push(video1Metafield.reference.sources[0].url);
        }

        const video2Metafield = getMetafield('about_hero_background_image_slide_2');
        if (video2Metafield?.value && typeof video2Metafield.value === 'string' && video2Metafield.value.startsWith('http')) {
            videos.push(video2Metafield.value);
        } else if (video2Metafield?.reference?.sources?.[0]?.url) {
            videos.push(video2Metafield.reference.sources[0].url);
        }

        const video3Metafield = getMetafield('about_hero_background_image_slide_3');
        if (video3Metafield?.value && typeof video3Metafield.value === 'string' && video3Metafield.value.startsWith('http')) {
            videos.push(video3Metafield.value);
        } else if (video3Metafield?.reference?.sources?.[0]?.url) {
            videos.push(video3Metafield.reference.sources[0].url);
        }

        return videos;
    }, [collection?.metafields]);

    const slideContent = useMemo(() => {
        try {
            const slides = [];

            // Only add slide content if we have a corresponding video
            const video1Metafield = getMetafield('about_hero_background_image');
            const video2Metafield = getMetafield('about_hero_background_image_slide_2');
            const video3Metafield = getMetafield('about_hero_background_image_slide_3');

            // About Slide 1 - Only add if video exists AND metafields have content
            if ((video1Metafield?.value && typeof video1Metafield.value === 'string' && video1Metafield.value.startsWith('http')) ||
                video1Metafield?.reference?.sources?.[0]?.url) {

                const slide1Title = getMetafield(locale === 'fr' ? 'about_hero_title_fr' : 'about_hero_title_en');
                const slide1Subtitle = getMetafield(locale === 'fr' ? 'about_hero_subtitle_fr' : 'about_hero_subtitle_en');
                const slide1Button = getMetafield(locale === 'fr' ? 'about_hero_button_text_fr' : 'about_hero_button_text_en');
                const slide1Url = getMetafield('about_hero_button_url_slide_1');

                // Only add slide if we have at least title content
                if (slide1Title?.value) {
                    slides.push({
                        title: slide1Title.value,
                        subtitle: slide1Subtitle?.value || '',
                        buttonText: slide1Button?.value || '',
                        url: slide1Url?.value || '#founder'
                    });
                }
            }

            // About Slide 2 - Only add if video exists AND metafields have content
            if ((video2Metafield?.value && typeof video2Metafield.value === 'string' && video2Metafield.value.startsWith('http')) ||
                video2Metafield?.reference?.sources?.[0]?.url) {

                const slide2Title = getMetafield(locale === 'fr' ? 'about_hero_title_slide_2_fr' : 'about_hero_title_slide_2_en');
                const slide2Subtitle = getMetafield(locale === 'fr' ? 'about_hero_subtitle_slide_2_fr' : 'about_hero_subtitle_slide_2_en');
                const slide2Button = getMetafield(locale === 'fr' ? 'about_hero_button_text_slide_2_fr' : 'about_hero_button_text_slide_2_en');
                const slide2Url = getMetafield('about_hero_button_url_slide_2');

                // Only add slide if we have at least title content
                if (slide2Title?.value) {
                    slides.push({
                        title: slide2Title.value,
                        subtitle: slide2Subtitle?.value || '',
                        buttonText: slide2Button?.value || '',
                        url: slide2Url?.value || collectionUrl
                    });
                }
            }

            // About Slide 3 - Only add if video exists AND metafields have content
            if ((video3Metafield?.value && typeof video3Metafield.value === 'string' && video3Metafield.value.startsWith('http')) ||
                video3Metafield?.reference?.sources?.[0]?.url) {

                const slide3Title = getMetafield(locale === 'fr' ? 'about_hero_title_slide_3_fr' : 'about_hero_title_slide_3_en');
                const slide3Subtitle = getMetafield(locale === 'fr' ? 'about_hero_subtitle_slide_3_fr' : 'about_hero_subtitle_slide_3_en');
                const slide3Button = getMetafield(locale === 'fr' ? 'about_hero_button_text_slide_3_fr' : 'about_hero_button_text_slide_3_en');
                const slide3Url = getMetafield('about_hero_button_url_slide_3');

                // Only add slide if we have at least title content
                if (slide3Title?.value) {
                    slides.push({
                        title: slide3Title.value,
                        subtitle: slide3Subtitle?.value || '',
                        buttonText: slide3Button?.value || '',
                        url: slide3Url?.value || collectionUrl
                    });
                }
            }

            return slides;

        } catch (error) {
            console.error('Error generating slide content:', error);
            return [];
        }
    }, [collection?.title, collection?.handle, collection?.metafields, locale, collectionUrl]);

    const getCurrentSlideContent = () => {
        if (!slideContent || slideContent.length === 0) {
            return null;
        }

        const safeIndex = Math.max(0, Math.min(currentVideoIndex, slideContent.length - 1));
        return slideContent[safeIndex] || null;
    };

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsIntersecting(true);

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

    useEffect(() => {
        if (!isMobile && isClient && shouldLoadVideo && desktopVideos.length > 1) {
            const interval = setInterval(() => {
                setCurrentVideoIndex((prevIndex) => {
                    const nextIndex = (prevIndex + 1) % desktopVideos.length;
                    setVideoLoaded(false);
                    return nextIndex;
                });
            }, 8000);

            return () => {
                clearInterval(interval);
            };
        }
    }, [isMobile, isClient, shouldLoadVideo, desktopVideos.length]);

    const showVideo = isIntersecting;

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
                        Fetching About hero content from Shopify
                    </div>
                </div>
            </div>
        );
    }

    if (!isClient) {
        return (
            <>
                <div ref={containerRef} className="hero-video-container">
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
                                transition: 'opacity 1s ease'
                            }}
                            onError={() => handleVideoError(getCurrentVideoSource)}
                            onCanPlay={(e) => {
                                e.target.style.opacity = '1';
                            }}
                        >
                            <source src={getCurrentVideoSource} type="video/mp4" />
                        </video>
                    )}

                    {(showVideo || getCurrentVideoSource) && (
                        <>
                            {isMobile && OPTIMIZED_MOBILE_VIDEO ? (
                                <video
                                    ref={videoRef}
                                    key="mobile-video"
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
                                        objectFit: 'cover'
                                    }}
                                    decoding="async"
                                    disablePictureInPicture
                                >
                                    <source src={OPTIMIZED_MOBILE_VIDEO} type="video/mp4" />
                                </video>
                            ) : (
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
                            {(() => {
                                const currentContent = getCurrentSlideContent();
                                if (!currentContent) return null;

                                return (
                                    <>
                                        {currentContent.title && (
                                            <h1 className="hero-title" key={`title-${currentVideoIndex}`}>
                                                {currentContent.title}
                                            </h1>
                                        )}
                                        {currentContent.subtitle && (
                                            <p className="hero-subtitle" key={`subtitle-${currentVideoIndex}`}>
                                                {currentContent.subtitle}
                                            </p>
                                        )}
                                        {currentContent.buttonText && (
                                            <Link
                                                to={currentContent.url}
                                                className="hero-button"
                                                key={`button-${currentVideoIndex}`}
                                            >
                                                {currentContent.buttonText}
                                            </Link>
                                        )}
                                    </>
                                );
                            })()}
                        </div>

                        {!isMobile && isClient && showVideo && slideContent && slideContent.length > 1 && (
                            <div className="slideshow-indicators">
                                {slideContent.map((_, index) => (
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
                    __html: heroStyles + `
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
                            objectFit: 'cover',
                            objectPosition: 'center',
                            zIndex: 1,
                            transition: 'opacity 0.5s ease'
                        }}
                        onError={(e) => {
                            console.error('Video background failed to load:', getCurrentVideoSource);
                            handleVideoError(getCurrentVideoSource);
                        }}
                    >
                        <source src={getCurrentVideoSource} type="video/mp4" />
                        <source src={getCurrentVideoSource.replace('.mp4', '.webm')} type="video/webm" />
                    </video>
                )}

                {(showVideo || getCurrentVideoSource) && (
                    <>
                        {isMobile && OPTIMIZED_MOBILE_VIDEO ? (
                            <video
                                ref={videoRef}
                                key="mobile-video"
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
                                    objectFit: 'cover'
                                }}
                                decoding="async"
                                disablePictureInPicture
                            >
                                <source src={OPTIMIZED_MOBILE_VIDEO} type="video/mp4" />
                            </video>
                        ) : (
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
                        {(() => {
                            const currentContent = getCurrentSlideContent();
                            if (!currentContent) return null;

                            return (
                                <>
                                    {currentContent.title && (
                                        <h1 className="hero-title" key={`title-${currentVideoIndex}`}>
                                            {currentContent.title}
                                        </h1>
                                    )}
                                    {currentContent.subtitle && (
                                        <p className="hero-subtitle" key={`subtitle-${currentVideoIndex}`}>
                                            {currentContent.subtitle}
                                        </p>
                                    )}
                                    {currentContent.buttonText && (
                                        <Link
                                            to={currentContent.url}
                                            className="hero-button"
                                            key={`button-${currentVideoIndex}`}
                                        >
                                            {currentContent.buttonText}
                                        </Link>
                                    )}
                                </>
                            );
                        })()}
                    </div>

                    {!isMobile && isClient && showVideo && slideContent && slideContent.length > 1 && (
                        <div className="slideshow-indicators">
                            {slideContent.map((_, index) => (
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
                __html: heroStyles + `
                
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


function AboutBottomSlider({ collection }) {
    const [isMobile, setIsMobile] = useState(() => {
        if (typeof window !== 'undefined') {
            return window.innerWidth < 768;
        }
        return false;
    });
    const [videoLoaded, setVideoLoaded] = useState(false);
    const [isClient, setIsClient] = useState(false);
    const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
    const [isIntersecting, setIsIntersecting] = useState(false);
    const [shouldLoadVideo, setShouldLoadVideo] = useState(false);
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
                    customBg = getMetafield('about_bottom_slider_background_image');
                    break;
                case 1:
                    customBg = getMetafield('about_bottom_slider_background_image_slide_2');
                    break;
                case 2:
                    customBg = getMetafield('about_bottom_slider_background_image_slide_3');
                    break;
                default:
                    customBg = getMetafield('about_bottom_slider_background_image');
            }

            if (customBg?.value && typeof customBg.value === 'string' && customBg.value.startsWith('http')) {
                return customBg.value;
            }

            if (customBg?.reference?.sources && Array.isArray(customBg.reference.sources) && customBg.reference.sources.length > 0) {
                const videoSource = customBg.reference.sources[0];
                let videoUrl = videoSource.url;

                if (!videoErrors.has(videoUrl)) {
                    return videoUrl;
                }
            }

            return null;

        } catch (error) {
            console.error('Error getting bottom slider video source:', error);
            return null;
        }
    }, [currentVideoIndex, collection?.metafields, videoErrors]);

    const handleVideoError = (videoUrl) => {
        setVideoErrors(prev => new Set([...prev, videoUrl]));
    };

    const collectionUrl = useMemo(() => {
        return collection?.handle ? `/collections/${collection.handle}` : '/collections/all';
    }, [collection?.handle]);

    const OPTIMIZED_MOBILE_VIDEO = useMemo(() => {
        const mobileVideoMetafield = getMetafield('about_bottom_slider_mobile_video');
        if (mobileVideoMetafield?.value && mobileVideoMetafield.value.startsWith('http')) {
            return mobileVideoMetafield.value;
        }
        return getCurrentVideoSource;
    }, [collection?.metafields, getCurrentVideoSource]);

    const desktopVideos = useMemo(() => {
        const videos = [];

        const video1Metafield = getMetafield('about_bottom_slider_background_image');
        if (video1Metafield?.value && typeof video1Metafield.value === 'string' && video1Metafield.value.startsWith('http')) {
            videos.push(video1Metafield.value);
        } else if (video1Metafield?.reference?.sources?.[0]?.url) {
            videos.push(video1Metafield.reference.sources[0].url);
        }

        const video2Metafield = getMetafield('about_bottom_slider_background_image_slide_2');
        if (video2Metafield?.value && typeof video2Metafield.value === 'string' && video2Metafield.value.startsWith('http')) {
            videos.push(video2Metafield.value);
        } else if (video2Metafield?.reference?.sources?.[0]?.url) {
            videos.push(video2Metafield.reference.sources[0].url);
        }

        const video3Metafield = getMetafield('about_bottom_slider_background_image_slide_3');
        if (video3Metafield?.value && typeof video3Metafield.value === 'string' && video3Metafield.value.startsWith('http')) {
            videos.push(video3Metafield.value);
        } else if (video3Metafield?.reference?.sources?.[0]?.url) {
            videos.push(video3Metafield.reference.sources[0].url);
        }

        return videos;
    }, [collection?.metafields]);

    const slideContent = useMemo(() => {
        try {
            const slides = [];

            // Check for bottom slider videos
            const video1Metafield = getMetafield('about_bottom_slider_background_image');
            const video2Metafield = getMetafield('about_bottom_slider_background_image_slide_2');
            const video3Metafield = getMetafield('about_bottom_slider_background_image_slide_3');

            // Bottom Slider Slide 1 - Only add if video exists AND metafields have content
            if ((video1Metafield?.value && typeof video1Metafield.value === 'string' && video1Metafield.value.startsWith('http')) ||
                video1Metafield?.reference?.sources?.[0]?.url) {

                const slide1Title = getMetafield(locale === 'fr' ? 'about_bottom_slider_title_fr' : 'about_bottom_slider_title_en');
                const slide1Subtitle = getMetafield(locale === 'fr' ? 'about_bottom_slider_subtitle_fr' : 'about_bottom_slider_subtitle_en');
                const slide1Button = getMetafield(locale === 'fr' ? 'about_bottom_slider_button_text_fr' : 'about_bottom_slider_button_text_en');
                const slide1Url = getMetafield('about_bottom_slider_button_url_slide_1');

                // Only add slide if we have at least title content
                if (slide1Title?.value) {
                    slides.push({
                        title: slide1Title.value,
                        subtitle: slide1Subtitle?.value || '',
                        buttonText: slide1Button?.value || '',
                        url: slide1Url?.value || collectionUrl
                    });
                }
            }

            // Bottom Slider Slide 2 - Only add if video exists AND metafields have content
            if ((video2Metafield?.value && typeof video2Metafield.value === 'string' && video2Metafield.value.startsWith('http')) ||
                video2Metafield?.reference?.sources?.[0]?.url) {

                const slide2Title = getMetafield(locale === 'fr' ? 'about_bottom_slider_title_slide_2_fr' : 'about_bottom_slider_title_slide_2_en');
                const slide2Subtitle = getMetafield(locale === 'fr' ? 'about_bottom_slider_subtitle_slide_2_fr' : 'about_bottom_slider_subtitle_slide_2_en');
                const slide2Button = getMetafield(locale === 'fr' ? 'about_bottom_slider_button_text_slide_2_fr' : 'about_bottom_slider_button_text_slide_2_en');
                const slide2Url = getMetafield('about_bottom_slider_button_url_slide_2');

                // Only add slide if we have at least title content
                if (slide2Title?.value) {
                    slides.push({
                        title: slide2Title.value,
                        subtitle: slide2Subtitle?.value || '',
                        buttonText: slide2Button?.value || '',
                        url: slide2Url?.value || collectionUrl
                    });
                }
            }

            // Bottom Slider Slide 3 - Only add if video exists AND metafields have content
            if ((video3Metafield?.value && typeof video3Metafield.value === 'string' && video3Metafield.value.startsWith('http')) ||
                video3Metafield?.reference?.sources?.[0]?.url) {

                const slide3Title = getMetafield(locale === 'fr' ? 'about_bottom_slider_title_slide_3_fr' : 'about_bottom_slider_title_slide_3_en');
                const slide3Subtitle = getMetafield(locale === 'fr' ? 'about_bottom_slider_subtitle_slide_3_fr' : 'about_bottom_slider_subtitle_slide_3_en');
                const slide3Button = getMetafield(locale === 'fr' ? 'about_bottom_slider_button_text_slide_3_fr' : 'about_bottom_slider_button_text_slide_3_en');
                const slide3Url = getMetafield('about_bottom_slider_button_url_slide_3');

                // Only add slide if we have at least title content
                if (slide3Title?.value) {
                    slides.push({
                        title: slide3Title.value,
                        subtitle: slide3Subtitle?.value || '',
                        buttonText: slide3Button?.value || '',
                        url: slide3Url?.value || collectionUrl
                    });
                }
            }

            return slides;

        } catch (error) {
            console.error('Error generating bottom slider content:', error);
            return [];
        }
    }, [collection?.title, collection?.handle, collection?.metafields, locale, collectionUrl]);

    const getCurrentSlideContent = () => {
        if (!slideContent || slideContent.length === 0) {
            return null;
        }

        const safeIndex = Math.max(0, Math.min(currentVideoIndex, slideContent.length - 1));
        return slideContent[safeIndex] || null;
    };

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsIntersecting(true);
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

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        if (!isMobile && isClient && shouldLoadVideo && desktopVideos.length > 1) {
            const interval = setInterval(() => {
                setCurrentVideoIndex((prevIndex) => {
                    const nextIndex = (prevIndex + 1) % desktopVideos.length;
                    setVideoLoaded(false);
                    return nextIndex;
                });
            }, 8000);

            return () => {
                clearInterval(interval);
            };
        }
    }, [isMobile, isClient, shouldLoadVideo, desktopVideos.length]);

    // Don't render if no slides or videos
    if (!slideContent || slideContent.length === 0 || !getCurrentVideoSource) {
        return null;
    }

    const showVideo = isIntersecting;

    return (
        <div ref={containerRef} className="hero-video-container" style={{ marginTop: '2rem' }}>
            {getCurrentVideoSource && (
                <video
                    key={`bottom-slider-bg-video-${currentVideoIndex}`}
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
                        objectFit: 'cover',
                        objectPosition: 'center',
                        zIndex: 1,
                        transition: 'opacity 0.5s ease'
                    }}
                    onError={(e) => {
                        console.error('Bottom slider video failed to load:', getCurrentVideoSource);
                        handleVideoError(getCurrentVideoSource);
                    }}
                >
                    <source src={getCurrentVideoSource} type="video/mp4" />
                    <source src={getCurrentVideoSource.replace('.mp4', '.webm')} type="video/webm" />
                </video>
            )}

            {(showVideo || getCurrentVideoSource) && (
                <>
                    {isMobile && OPTIMIZED_MOBILE_VIDEO ? (
                        <video
                            ref={videoRef}
                            key="bottom-slider-mobile-video"
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
                                objectFit: 'cover'
                            }}
                            decoding="async"
                            disablePictureInPicture
                        >
                            <source src={OPTIMIZED_MOBILE_VIDEO} type="video/mp4" />
                        </video>
                    ) : (
                        !isMobile && desktopVideos.length > 0 && getCurrentVideoSource && (
                            <video
                                key={`bottom-slider-desktop-video-${currentVideoIndex}`}
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
                    {(() => {
                        const currentContent = getCurrentSlideContent();
                        if (!currentContent) return null;

                        return (
                            <>
                                {currentContent.title && (
                                    <h1 className="hero-title" key={`bottom-slider-title-${currentVideoIndex}`}>
                                        {currentContent.title}
                                    </h1>
                                )}
                                {currentContent.subtitle && (
                                    <p className="hero-subtitle" key={`bottom-slider-subtitle-${currentVideoIndex}`}>
                                        {currentContent.subtitle}
                                    </p>
                                )}
                                {currentContent.buttonText && (
                                    <Link
                                        to={currentContent.url}
                                        className="hero-button"
                                        key={`bottom-slider-button-${currentVideoIndex}`}
                                    >
                                        {currentContent.buttonText}
                                    </Link>
                                )}
                            </>
                        );
                    })()}
                </div>

                {!isMobile && isClient && showVideo && slideContent && slideContent.length > 1 && (
                    <div className="slideshow-indicators">
                        {slideContent.map((_, index) => (
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
    /* Add overflow-x hidden to body and html on mobile */
    @media (max-width: 768px) {
        body {
            overflow-x: hidden;
        }
        
        html {
            overflow-x: hidden;
        }
    }

    .hero-video-container {
        position: relative;
        width: 100vw;
        height: 100vh;
        min-height: 500px;
        margin: 0;
        padding: 0;
        overflow: hidden;
        transform: translateZ(0);
        backface-visibility: hidden;
        
        /* Mobile-specific fixes */
        @media (max-width: 768px) {
            width: 100%;
            max-width: 100%;
            left: 0;
            right: 0;
            margin-left: 0;
            margin-right: 0;
            height: 70vh;
            min-height: 400px;
        }
        
        /* Desktop full-width behavior */
        @media (min-width: 769px) {
            left: 50%;
            right: 50%;
            margin-left: -50vw;
            margin-right: -50vw;
        }
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
        .hero-video {
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
        
        @media (min-width: 769px) {
            padding-left: 80px;
        }
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
        
        @media (max-width: 768px) {
            display: none;
        }
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
        .hero-button {
            transition: none;
        }
        
        .hero-button:hover {
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

    const getCollectionMetafield = (key, namespace = 'custom') => {
        try {
            if (!featuredCollection?.metafields || !Array.isArray(featuredCollection.metafields)) {
                return null;
            }

            return featuredCollection.metafields.find(
                metafield => metafield &&
                    metafield.key === key &&
                    metafield.namespace === namespace
            );
        } catch (error) {
            console.warn('Error getting metafield:', error);
            return null;
        }
    };

    const getBannerContent = () => {
        const backgroundImage = getCollectionMetafield('about_banner_background_image');
        const bannerTitle = getCollectionMetafield(locale === 'fr' ? 'about_banner_title_fr' : 'about_banner_title_en');

        console.log('Collection being used:', featuredCollection?.title, featuredCollection?.handle, featuredCollection?.id);
        console.log('All metafields:', featuredCollection?.metafields);

        console.log('backgroundImage metafield:', backgroundImage);
        console.log('backgroundImage value:', backgroundImage?.value);



        const finalImage = backgroundImage?.value || aboutBg;
        console.log('Final image URL:', finalImage);

        return {
            backgroundImage: backgroundImage?.value || aboutBg,
            title: bannerTitle?.value || (locale === 'fr'
                    ? 'Autonomiser les femmes noires grâce à notre plateforme de technologie beauté'
                    : 'Empowering Black women through our beauty tech platform'
            )
        };
    };


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

    const bannerContent = getBannerContent();

    return (
        <div className="about-page-container" style={{
            overflowX: 'hidden',
            width: '100%',
            maxWidth: '100%'
        }}>
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
                /* Fallback content */
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

            {/* Rest of your content with proper container constraints */}
            <div style={{ overflowX: 'hidden', width: '100%' }}>
                {/* Original About Hero Image Section */}
                <section
                    className="relative w-full min-h-screen flex items-center justify-center"
                    style={{
                        backgroundImage: `url(${bannerContent.backgroundImage})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                        margin: 0,
                        padding: 0,
                        boxSizing: 'border-box',
                        maxWidth: '100%',
                        overflowX: 'hidden'
                    }}
                >
                    <div className="absolute inset-0 bg-black bg-opacity-20"></div>

                    <div className="relative z-10 text-center w-full px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
                        <div className="text-white">
                            {(() => {
                                const text = bannerContent.title;
                                const parts = text.split(/(?:\s+(?:Fondatrice|Founder)\s*&\s*(?:CEO|PDG))/i);

                                if (parts.length > 1) {
                                    const name = parts[0].trim();
                                    const title = text.replace(name, '').trim();

                                    return (
                                        <>
                                            <h1 className="text-[28px] sm:text-[36px] md:text-[42px] lg:text-[48px] font-light font-poppins mb-2 leading-tight tracking-wide">
                                                {name}
                                            </h1>
                                            <p className="text-[18px] sm:text-[20px] md:text-[22px] lg:text-[24px] font-light font-poppins opacity-90">
                                                {title}
                                            </p>
                                        </>
                                    );
                                } else {
                                    const words = text.split(' ');
                                    const midPoint = Math.ceil(words.length / 2);
                                    const firstLine = words.slice(0, midPoint).join(' ');
                                    const secondLine = words.slice(midPoint).join(' ');

                                    return (
                                        <>
                                            <h1 className="text-[28px] sm:text-[36px] md:text-[42px] lg:text-[48px] font-light font-poppins mb-2 leading-tight tracking-wide">
                                                {firstLine}
                                            </h1>
                                            <p className="text-[18px] sm:text-[20px] md:text-[22px] lg:text-[24px] font-light font-poppins opacity-90">
                                                {secondLine}
                                            </p>
                                        </>
                                    );
                                }
                            })()}
                        </div>
                    </div>
                </section>

                <BestSellersProducts
                    bestSellersCollection={data.bestSellersCollection}
                    fallbackProducts={data.recommendedProducts}
                />

                <AboutBottomSlider collection={data.featuredCollection} />

                {/*<AboutFAQ collection={data.featuredCollection} />*/}
            </div>
        </div>
    );
}