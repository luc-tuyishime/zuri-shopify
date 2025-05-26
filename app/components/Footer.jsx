import {Suspense} from 'react';
import {Await, NavLink, Link} from '@remix-run/react';
import LogoWhite from '../assets/Vector.svg';

/**
 * @param {FooterProps}
 */
export function Footer({footer: footerPromise, header, publicStoreDomain}) {
  return (
      <Suspense>
        <Await resolve={footerPromise}>
          {(footer) => (
              <footer className="bg-[#5C2E1C] text-white py-16 relative">
                <div className="absolute top-0 left-0 w-[120px] h-[110px] border-r border-b border-white" style={{
                  borderRight: '0.48px solid white',
                  borderBottom: '0.48px solid white'
                }}></div>

                <div className="container mx-auto px-4">
                  <div className="pl-[60px] md:pl-[80px]">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-x-16 gap-y-10">
                    {/* Logo and Company Info Column */}
                    <div className="col-span-1 pr-8"> {/* Added extra padding to create space */}
                      <Link to="/" className="block mb-6">
                        <img
                            src={LogoWhite}
                            alt="ZURI"
                        />
                      </Link>
                      <p className="text-[11px] font-inter font-medium mb-6">
                        We are led and founded by a Black woman, who envisions women being recognized for their thoughtful designs through custom-made wigs created with a tech platform.
                      </p>
                      <p className="font-bold text-[11px] mb-8">Be Bold.</p>
                      <p className="text-[11px] mt-16">©2024 all right reserved. Zuri Rwanda Ltd</p>
                    </div>

                    {/* Explore Column */}
                    <div className="col-span-1">
                      <p className="font-medium font-inter text-[16px] mb-6">EXPLORE</p>
                      <nav className="flex flex-col space-y-3">
                        <NavLink to="/" className="font-medium font-inter text-[11px] text-[#806D6D]">Home</NavLink>
                        <NavLink to="/pages/about" className="font-medium font-inter text-[11px] text-[#806D6D]">About</NavLink>
                        <NavLink to="/collections/best-sellers" className="font-medium font-inter text-[11px] text-[#806D6D]">Best sellers</NavLink>
                        <NavLink to="/collections/wigs" className="font-medium font-inter text-[11px] text-[#806D6D]">Wigs</NavLink>
                        <NavLink to="/pages/wig-care" className="font-medium font-inter text-[11px] text-[#806D6D]">Wig care</NavLink>
                        <NavLink to="/pages/hair-care" className="font-medium font-inter text-[11px] text-[#806D6D]">Hair care</NavLink>
                        <NavLink to="/pages/community" className="font-medium font-inter text-[11px] text-[#806D6D]">Community</NavLink>
                      </nav>
                    </div>

                    {/* Shops Column */}
                    <div className="col-span-1">
                      <h3 className="font-medium font-inter text-[16px] mb-6">Shops</h3>
                      <nav className="flex flex-col space-y-3">
                        <a href="#" className="font-medium font-inter text-[11px] text-[#806D6D]">Kigali</a>
                        <a href="#" className="font-medium font-inter text-[11px] text-[#806D6D]">Uganda</a>
                        <a href="#" className="font-medium font-inter text-[11px] text-[#806D6D]">DRC</a>
                      </nav>

                      <h3 className="font-medium font-inter text-[16px] mb-4 mt-8">Contact</h3>
                      <p className="font-medium font-inter text-[11px] text-[#806D6D] mb-2">info@myzuri.com</p>
                      <a href="tel:+2351567262" className="font-medium font-inter text-[11px] text-[#806D6D]">+2351567262</a>
                    </div>

                    {/* Follow Column */}
                    <div className="col-span-1">
                      <h3 className="font-medium font-inter text-[16px] mb-6">FOLLOW</h3>
                      <nav className="flex flex-col space-y-3">
                        <a href="https://instagram.com/zuri" target="_blank" rel="noopener noreferrer" className="font-medium font-inter text-[11px] text-[#806D6D]">Instagram</a>
                        <a href="https://twitter.com/zuri" target="_blank" rel="noopener noreferrer" className="font-medium font-inter text-[11px] text-[#806D6D]">Twitter</a>
                        <a href="https://linkedin.com/company/zuri" target="_blank" rel="noopener noreferrer" className="font-medium font-inter text-[11px] text-[#806D6D]">LinkedIn</a>
                      </nav>
                    </div>

                    {/* Legal Column */}
                    <div className="col-span-1 flex flex-col">
                      <div>
                        <h3 className="font-medium font-inter text-[16px] mb-6">LEGAL</h3>
                        <nav className="flex flex-col space-y-3">
                          <NavLink to="/policies/terms-of-service" className="font-medium font-inter text-[11px] text-[#806D6D]">Terms</NavLink>
                          <NavLink to="/policies/privacy-policy" className="font-medium font-inter text-[11px] text-[#806D6D]">Privacy</NavLink>
                        </nav>
                      </div>
                      {/* Positioned to touch bottom */}
                      <div className="mt-auto">
                        <div className="border-t border-l border-r border-white rounded-tl-full rounded-tr-full h-40 w-40 ml-auto absolute bottom-0 right-4 md:right-16"></div>
                      </div>
                    </div>
                  </div>
                </div>
                </div>
              </footer>
          )}
        </Await>
      </Suspense>
  );
}

// Keep the fallback menu for compatibility
const FALLBACK_FOOTER_MENU = {
  id: 'gid://shopify/Menu/199655620664',
  items: [
    {
      id: 'gid://shopify/MenuItem/461633060920',
      resourceId: 'gid://shopify/ShopPolicy/23358046264',
      tags: [],
      title: 'Privacy Policy',
      type: 'SHOP_POLICY',
      url: '/policies/privacy-policy',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461633093688',
      resourceId: 'gid://shopify/ShopPolicy/23358013496',
      tags: [],
      title: 'Refund Policy',
      type: 'SHOP_POLICY',
      url: '/policies/refund-policy',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461633126456',
      resourceId: 'gid://shopify/ShopPolicy/23358111800',
      tags: [],
      title: 'Shipping Policy',
      type: 'SHOP_POLICY',
      url: '/policies/shipping-policy',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461633159224',
      resourceId: 'gid://shopify/ShopPolicy/23358079032',
      tags: [],
      title: 'Terms of Service',
      type: 'SHOP_POLICY',
      url: '/policies/terms-of-service',
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
    color: isPending ? 'grey' : 'white',
  };
}

/**
 * @typedef {Object} FooterProps
 * @property {Promise<FooterQuery|null>} footer
 * @property {HeaderQuery} header
 * @property {string} publicStoreDomain
 */

/** @typedef {import('storefrontapi.generated').FooterQuery} FooterQuery */
/** @typedef {import('storefrontapi.generated').HeaderQuery} HeaderQuery */