import {Suspense} from 'react';
import {Await, NavLink, useAsyncValue} from '@remix-run/react';
import {useAnalytics, useOptimisticCart} from '@shopify/hydrogen';
import {useAside} from '~/components/Aside';

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

  const navigationItems = [
    { id: 'shop-now', title: 'Shop Now', url: '/collections/all' },
    { id: 'best-sellers', title: 'Our Best Sellers', url: '#best-sellers' },
    { id: 'about', title: 'About Us', url: '/pages/about' }
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
        <div className="container mx-auto px-6 flex items-center justify-between h-20">
          {/* Logo */}
          <div>
            <NavLink prefetch="intent" to="/" className="text-2xl font-semibold tracking-wider">
              <img src={Logo} alt={header?.shop?.name || 'ZURI'} />
            </NavLink>
          </div>

          <div className="flex items-center space-x-8">
            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              {navigationItems.map(item => (
                  <NavLink
                      key={item.id}
                      to={item.url}
                      className="uppercase text-[15px] tracking-wider font-regular text-[#542C17] font-inter"
                  >
                    {item.title}
                  </NavLink>
              ))}
            </nav>

            {/* Icons */}
            <div className="flex items-center space-x-6">
              {/* Cart */}
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

              {/* Account */}
              <NavLink to="/account" className="focus:outline-none" aria-label="Account">
                <img src={AccountIcon} className="w-5 h-5" alt="Account" />
              </NavLink>

              {/* Search */}
              <button
                  className="focus:outline-none"
                  aria-label="Search"
                  onClick={() => open('search')}
              >
                <img src={SearchIcon} className="w-5 h-5" alt="Search" />
              </button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
              className="md:hidden focus:outline-none"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
          >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
            >
              <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
            <div className="md:hidden bg-zuri-beige py-4">
              <div className="container mx-auto px-6">
                <nav className="flex flex-col space-y-4">
                  {header?.menu?.items?.map((item) => (
                      <NavLink
                          key={item.id}
                          to={item.url}
                          className="uppercase text-sm tracking-wider py-2"
                          onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {item.title}
                      </NavLink>
                  )) || (
                      <>
                        <NavLink
                            to="/collections/all"
                            className="uppercase text-sm tracking-wider py-2"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                          Shop Now
                        </NavLink>
                        <NavLink
                            to="/collections/best-sellers"
                            className="uppercase text-sm tracking-wider py-2"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                          Our Best Sellers
                        </NavLink>
                        <NavLink
                            to="/pages/about"
                            className="uppercase text-sm tracking-wider py-2"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                          About Us
                        </NavLink>
                      </>
                  )}
                </nav>
              </div>
            </div>
        )}
      </header>
  );
}

/**
 * @param {{
 *   menu: HeaderProps['header']['menu'];
 *   primaryDomainUrl: HeaderProps['header']['shop']['primaryDomain']['url'];
 *   viewport: Viewport;
 *   publicStoreDomain: HeaderProps['publicStoreDomain'];
 * }}
 */
export function HeaderMenu({
  menu,
  primaryDomainUrl,
  viewport,
  publicStoreDomain,
}) {
  const className = `header-menu-${viewport}`;
  const {close} = useAside();

  return (
    <nav className={className} role="navigation">
      {viewport === 'mobile' && (
        <NavLink
          end
          onClick={close}
          prefetch="intent"
          style={activeLinkStyle}
          to="/"
        >
          Home
        </NavLink>
      )}
      {(menu || FALLBACK_HEADER_MENU).items.map((item) => {
        if (!item.url) return null;

        // if the url is internal, we strip the domain
        const url =
          item.url.includes('myshopify.com') ||
          item.url.includes(publicStoreDomain) ||
          item.url.includes(primaryDomainUrl)
            ? new URL(item.url).pathname
            : item.url;
        return (
          <NavLink
            className="header-menu-item"
            end
            key={item.id}
            onClick={close}
            prefetch="intent"
            style={activeLinkStyle}
            to={url}
          >
            {item.title}
          </NavLink>
        );
      })}
    </nav>
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
      url: '/pages/about',
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
