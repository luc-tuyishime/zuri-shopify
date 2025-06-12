import {Suspense} from 'react';
import {Await, NavLink, useAsyncValue} from '@remix-run/react';
import {useAnalytics, useOptimisticCart} from '@shopify/hydrogen';
import { Link, useNavigate } from '@remix-run/react';
import {useAside} from '~/components/Aside';
import { LanguageSwitcher } from '~/components/LanguageSwitcher';
import { useTranslation, getLocale, setLocale } from '~/lib/i18n';
import { useLocale } from '~/hooks/useLocale';

import CartIcon from '../assets/bucket-brown.png';
import AccountIcon from '../assets/user-brown.png';
import SearchIcon from '../assets/search-brown.png';
import Logo from '../assets/Logo.svg';

/**
 * @param {HeaderProps}
 */
import {useState, useEffect} from 'react';

export function Header({header, isLoggedIn, cart, publicStoreDomain}) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const {open} = useAside();

  const [currentLocale, setCurrentLocale] = useLocale();
  const t = useTranslation(currentLocale);

  const navigationItems = [
    { id: 'shop-now', title: t.navigation.shopNow, url: '/collections/all' },
    { id: 'best-sellers', title: t.navigation.bestSellers, url: '/#best-sellers' },
    { id: 'about', title: t.navigation.aboutUs, url: '/about' }
  ];

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 0) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
      <header
          className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
              isScrolled ? 'bg-zuri-beige/95 backdrop-blur-sm shadow-sm' : 'bg-[#E9CFB6]'
          }`}
      >
        <div className="container mx-auto px-4 md:px-6 flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <div className="flex-shrink-0">
            <NavLink prefetch="intent" to="/" className="text-2xl font-semibold tracking-wider">
              <img src={Logo} alt={header?.shop?.name || 'ZURI'} className="h-8 md:h-auto w-auto" />
            </NavLink>
          </div>

          {/* Desktop Navigation and Actions */}
          <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
            {/* Desktop Navigation */}
            <nav className="flex space-x-6 lg:space-x-8">
              {navigationItems.map(item => (
                  <NavLink
                      key={item.id}
                      to={item.url}
                      className="uppercase text-sm lg:text-[15px] tracking-wider font-regular text-[#542C17] font-inter hover:text-[#542C17]/80 transition-colors duration-200"
                  >
                    {item.title}
                  </NavLink>
              ))}
            </nav>

            <LanguageSwitcher
                currentLocale={currentLocale}
                onLocaleChange={setCurrentLocale}
            />

            <div className="flex items-center space-x-4 lg:space-x-6">
              <button
                  className="focus:outline-none relative hover:opacity-80 transition-opacity duration-200"
                  aria-label="Cart"
                  onClick={(e) => {
                    e.preventDefault();
                    open('cart');
                  }}
              >
                <img src={CartIcon} className="w-5 h-5" alt="Cart" />
              </button>

              {/* Account */}
              <NavLink to="/account" className="focus:outline-none hover:opacity-80 transition-opacity duration-200" aria-label="Account">
                <img src={AccountIcon} className="w-5 h-5" alt="Account" />
              </NavLink>

              {/* Search */}
              <Link
                  to="/search"
                  className="focus:outline-none hover:opacity-80 transition-opacity duration-200"
                  aria-label="Search"
              >
                <img src={SearchIcon} className="w-5 h-5" alt="Search" />
              </Link>
            </div>
          </div>

          {/* Mobile Actions and Menu Button */}
          <div className="md:hidden flex items-center space-x-4">
            {/* Mobile Icons */}
            <div className="flex items-center space-x-3">
              <button
                  className="focus:outline-none relative"
                  aria-label="Cart"
                  onClick={(e) => {
                    e.preventDefault();
                    open('cart');
                  }}
              >
                <img src={CartIcon} className="w-5 h-5" alt="Cart" />
              </button>

              <NavLink to="/account" className="focus:outline-none" aria-label="Account">
                <img src={AccountIcon} className="w-5 h-5" alt="Account" />
              </NavLink>

              <Link
                  to="/search"
                  className="focus:outline-none"
                  aria-label="Search"
              >
                <img src={SearchIcon} className="w-5 h-5" alt="Search" />
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
                className="focus:outline-none p-1"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Toggle menu"
            >
              <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-[#542C17]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
              >
                {isMobileMenuOpen ? (
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                    />
                ) : (
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6h16M4 12h16M4 18h16"
                    />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
            <div className="md:hidden bg-[#E9CFB6] border-t border-[#542C17]/10">
              <div className="container mx-auto px-4">
                <nav className="flex flex-col py-4">
                  {navigationItems.map((item) => (
                      <NavLink
                          key={item.id}
                          to={item.url}
                          className="uppercase text-sm tracking-wider py-3 text-[#542C17] font-inter hover:text-[#542C17]/80 transition-colors duration-200 border-b border-[#542C17]/10 last:border-b-0"
                          onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {item.title}
                      </NavLink>
                  ))}

                  {/* Mobile Language Switcher */}
                  <div className="py-3 border-b border-[#542C17]/10 last:border-b-0">
                    <LanguageSwitcher
                        currentLocale={currentLocale}
                        onLocaleChange={setCurrentLocale}
                    />
                  </div>
                </nav>
              </div>
            </div>
        )}
      </header>
  );
}

/**
 * @param {Pick<HeaderProps, 'isLoggedIn' | 'cart'>}
 */
function HeaderCtas({isLoggedIn, cart}) {
  return (
      <nav className="header-ctas" role="navigation">
        <HeaderMenuMobileToggle />
        <NavLink prefetch="intent" to="/account" style={activeLinkStyle}>
          <Suspense fallback="Sign in">
            <Await resolve={isLoggedIn} errorElement="Sign in">
              {(isLoggedIn) => (isLoggedIn ? 'Account' : 'Sign in')}
            </Await>
          </Suspense>
        </NavLink>
        <SearchToggle />
        <CartToggle cart={cart} />
      </nav>
  );
}

function HeaderMenuMobileToggle() {
  const {open} = useAside();
  return (
      <button
          className="header-menu-mobile-toggle reset"
          onClick={() => open('mobile')}
      >
        <h3>☰</h3>
      </button>
  );
}

function SearchToggle() {
  const {open} = useAside();
  return (
      <button className="reset" onClick={() => open('search')}>
        Search
      </button>
  );
}

/**
 * @param {{count: number | null}}
 */
function CartBadge({count}) {
  const {open} = useAside();
  const {publish, shop, cart, prevCart} = useAnalytics();

  return (
      <a
          href="/cart"
          onClick={(e) => {
            e.preventDefault();
            open('cart');
            publish('cart_viewed', {
              cart,
              prevCart,
              shop,
              url: window.location.href || '',
            });
          }}
      >
        Cart {count === null ? <span>&nbsp;</span> : count}
      </a>
  );
}

/**
 * @param {Pick<HeaderProps, 'cart'>}
 */
function CartToggle({cart}) {
  return (
      <Suspense fallback={<CartBadge count={null} />}>
        <Await resolve={cart}>
          <CartBanner />
        </Await>
      </Suspense>
  );
}

function CartBanner() {
  const originalCart = useAsyncValue();
  const cart = useOptimisticCart(originalCart);
  return <CartBadge count={cart?.totalQuantity ?? 0} />;
}

const FALLBACK_HEADER_MENU = {
  id: 'gid://shopify/Menu/199655587896',
  items: [
    {
      id: 'gid://shopify/MenuItem/461609500728',
      resourceId: null,
      tags: [],
      title: 'Collections',
      type: 'HTTP',
      url: '/collections',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461609533496',
      resourceId: null,
      tags: [],
      title: 'Blog',
      type: 'HTTP',
      url: '/blogs/journal',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461609566264',
      resourceId: null,
      tags: [],
      title: 'Policies',
      type: 'HTTP',
      url: '/policies',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461609599032',
      resourceId: 'gid://shopify/Page/92591030328',
      tags: [],
      title: 'About',
      type: 'PAGE',
      url: '/about',
      items: [],
    },
  ],
};

/**
 * @param {{
 *   isActive: boolean;
 *   isPending: boolean;
 * }}
 */
function activeLinkStyle({isActive, isPending}) {
  return {
    fontWeight: isActive ? 'bold' : undefined,
    color: isPending ? 'grey' : 'black',
  };
}

/** @typedef {'desktop' | 'mobile'} Viewport */
/**
 * @typedef {Object} HeaderProps
 * @property {HeaderQuery} header
 * @property {Promise<CartApiQueryFragment|null>} cart
 * @property {Promise<boolean>} isLoggedIn
 * @property {string} publicStoreDomain
 */

/** @typedef {import('@shopify/hydrogen').CartViewPayload} CartViewPayload */
/** @typedef {import('storefrontapi.generated').HeaderQuery} HeaderQuery */
/** @typedef {import('storefrontapi.generated').CartApiQueryFragment} CartApiQueryFragment */