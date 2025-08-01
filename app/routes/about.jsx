import { useLocale } from '~/hooks/useLocale';
import { Link, useLocation, useLoaderData } from "@remix-run/react";
import { useEffect, useState } from 'react';
import { json } from '@shopify/remix-oxygen';
import Logo from '../assets/Vector3.svg';
import aboutBg from '~/assets/aboutbg.svg';
import founderImage from '~/assets/ceo.svg';

// GraphQL query to fetch shop metafields
const SHOP_METAFIELDS_QUERY = `#graphql
  query ShopMetafields {
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
  }
`;

// Loader function to fetch data
export async function loader({ context }) {
    try {
        const { storefront } = context;
        const { shop } = await storefront.query(SHOP_METAFIELDS_QUERY);

        return json({ shop });
    } catch (error) {
        console.error('Error loading shop metafields:', error);
        return json({ shop: { metafields: [] } });
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

// Dynamic Hero Section Component
function AboutHeroSection({ metafields }) {
    const [locale] = useLocale();

    // Get dynamic content with fallbacks
    const heroTitle = getMetafieldValue(
        metafields,
        locale === 'fr' ? 'hero_title_fr' : 'hero_title_en',
        locale === 'fr'
            ? 'Autonomiser les femmes noires grâce à notre plateforme de technologie beauté'
            : 'Empowering Black women through our beauty tech platform'
    );

    const heroBackground = getMetafieldValue(metafields, 'hero_background_image', aboutBg);

    return (
        <section
            className="relative w-full min-h-screen flex items-center justify-center"
            style={{
                backgroundImage: `url(${heroBackground})`,
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
                <p className="text-[34px] sm:text-5xl md:text-5xl font-light font-poppins text-white mb-6 leading-snug"  style={{ lineHeight: '1.2' }}>
                    {heroTitle}
                </p>
            </div>
        </section>
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
        <div className="max-w-4xl mb-20 mx-auto">
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

// Main About Us Page Component
export default function About({ cart, header, isLoggedIn, publicStoreDomain }) {
    const [locale] = useLocale();
    const location = useLocation();
    const data = useLoaderData();

    // Safely access metafields with fallback
    const metafields = data?.shop?.metafields || [];

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

            {/* Dynamic Hero Section */}
            <AboutHeroSection metafields={metafields} />

            {/* Dynamic Stats Section */}
            <StatsSection metafields={metafields} />

            {/* Dynamic Founder Section */}
            <FounderSection metafields={metafields} />
        </div>
    );
}