import { useLocale } from '~/hooks/useLocale';
import { Link, useLocation } from "@remix-run/react";
import { useEffect, useState } from 'react';
import Logo from '../assets/Vector3.svg';
import aboutBg from '~/assets/aboutbg.svg';


export const meta = () => {
    return [{title: `Zuri | About Us`}];
};

export const handle = {
    noLayout: true // Custom flag
};

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
                            {/* Language Switcher - Fixed to preserve current route */}
                            {/*<div className="hidden sm:flex items-center space-x-2">*/}
                            {/*    <Link*/}
                            {/*        to={createLanguageUrl('fr')}*/}
                            {/*        className={`text-sm font-medium transition-colors ${*/}
                            {/*            locale === 'fr' ? 'text-white' : 'text-gray-300 hover:text-white'*/}
                            {/*        }`}*/}
                            {/*    >*/}
                            {/*        FR*/}
                            {/*    </Link>*/}
                            {/*    <span className="text-gray-300">|</span>*/}
                            {/*    <Link*/}
                            {/*        to={createLanguageUrl('en')}*/}
                            {/*        className={`text-sm font-medium transition-colors ${*/}
                            {/*            locale === 'en' ? 'text-white' : 'text-gray-300 hover:text-white'*/}
                            {/*        }`}*/}
                            {/*    >*/}
                            {/*        EN*/}
                            {/*    </Link>*/}
                            {/*</div>*/}

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

// Hero Section Component
function AboutHeroSection() {
    const [locale] = useLocale();

    return (
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
                <p className="text-[34px] sm:text-5xl md:text-5xl font-light font-poppins text-white mb-6 leading-snug"  style={{ lineHeight: '1.2' }}>
                    {locale === 'fr'
                        ? 'Autonomiser les femmes noires grâce à notre plateforme de technologie beauté'
                        : 'Empowering Black women through our beauty tech platform'
                    }
                </p>
            </div>
        </section>
    );
}

// Main About Us Page Component
export default function About({ cart, header, isLoggedIn, publicStoreDomain }) {
    const location = useLocation();

    // Only apply header hiding on the about page
    useEffect(() => {
        // Only run this effect on the about page
        if (location.pathname !== '/about') return;

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

            {/* Hero Section */}
            <AboutHeroSection />
        </div>
    );
}