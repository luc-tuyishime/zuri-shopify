import {Suspense} from 'react';
import {Await, NavLink, Link} from '@remix-run/react';
import LogoWhite from '../assets/Vector.svg';
import {useLocale} from "~/hooks/useLocale.js";
import {useTranslation} from "~/lib/i18n.js";

/**
 * @param {FooterProps}
 */
export function Footer({footer: footerPromise, header, publicStoreDomain}) {
  const [locale] = useLocale();
  const t = useTranslation(locale);

  return (
      <Suspense>
        <Await resolve={footerPromise}>
          {(footer) => (
              <footer className="bg-[#5C2E1C] text-white py-8 md:py-16 relative">
                <div className="hidden md:block absolute top-0 left-0 w-[100px] h-[105px] border-r border-b border-white" style={{
                  borderRight: '0.48px solid white',
                  borderBottom: '0.48px solid white'
                }}></div>

                <div className="container mx-auto px-4">
                  <div className="md:pl-[60px] md:pl-[80px]">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-x-8 md:gap-x-16 gap-y-8 md:gap-y-10">
                      {/* Logo and Company Info Column */}
                      <div className="col-span-1 md:pr-8">
                        <Link to="/" className="block mb-4 md:mb-6">
                          <img
                              src={LogoWhite}
                              alt="ZURI"
                          />
                        </Link>
                        <p className="text-xs md:text-[11px] font-inter font-medium mb-4 md:mb-6">
                          {t.footer.companyDescription}
                        </p>
                        <p className="font-bold text-xs md:text-[11px] mb-6 md:mb-8">{t.footer.beBold}</p>
                        <p className="text-xs md:text-[11px] mt-8 md:mt-16">{t.footer.copyright}</p>
                      </div>

                      {/* Explore Column */}
                      <div className="col-span-1">
                        <p className="font-medium font-inter text-sm md:text-[16px] mb-4 md:mb-6">{t.footer.explore}</p>
                        <nav className="flex flex-col space-y-2 md:space-y-3">
                          <NavLink to="/" className="font-medium font-inter text-xs md:text-[11px] text-[#806D6D]">{t.footer.home}</NavLink>
                          <NavLink to="/pages/about" className="font-medium font-inter text-xs md:text-[11px] text-[#806D6D]">{t.footer.about}</NavLink>
                          <NavLink to="/collections/best-sellers" className="font-medium font-inter text-xs md:text-[11px] text-[#806D6D]">{t.footer.bestSellers}</NavLink>
                          <NavLink to="/collections/wigs" className="font-medium font-inter text-xs md:text-[11px] text-[#806D6D]">{t.footer.wigs}</NavLink>
                          <NavLink to="/pages/wig-care" className="font-medium font-inter text-xs md:text-[11px] text-[#806D6D]">{t.footer.wigCare}</NavLink>
                          <NavLink to="/pages/hair-care" className="font-medium font-inter text-xs md:text-[11px] text-[#806D6D]">{t.footer.hairCare}</NavLink>
                          <NavLink to="/pages/community" className="font-medium font-inter text-xs md:text-[11px] text-[#806D6D]">{t.footer.community}</NavLink>
                        </nav>
                      </div>

                      {/* Shops Column */}
                      <div className="col-span-1">
                        <h3 className="font-medium font-inter text-sm md:text-[16px] mb-4 md:mb-6">{t.footer.shops}</h3>
                        <nav className="flex flex-col space-y-2 md:space-y-3">
                          <a href="#" className="font-medium font-inter text-xs md:text-[11px] text-[#806D6D]">Kigali</a>
                          <a href="#" className="font-medium font-inter text-xs md:text-[11px] text-[#806D6D]">Uganda</a>
                          <a href="#" className="font-medium font-inter text-xs md:text-[11px] text-[#806D6D]">DRC</a>
                        </nav>

                        <h3 className="font-medium font-inter text-sm md:text-[16px] mb-3 md:mb-4 mt-6 md:mt-8">{t.footer.contact}</h3>
                        <p className="font-medium font-inter text-xs md:text-[11px] text-[#806D6D] mb-2">info@myzuri.com</p>
                        <a href="tel:+2351567262" className="font-medium font-inter text-xs md:text-[11px] text-[#806D6D]">+2351567262</a>
                      </div>

                      {/* Follow Column */}
                      <div className="col-span-1">
                        <h3 className="font-medium font-inter text-sm md:text-[16px] mb-4 md:mb-6">{t.footer.follow}</h3>
                        <nav className="flex flex-col space-y-2 md:space-y-3">
                          <a href="https://www.instagram.com/zuribelgique" target="_blank" rel="noopener noreferrer" className="font-medium font-inter text-xs md:text-[11px] text-[#806D6D]">Instagram</a>
                          <a href="https://twitter.com/zuri" target="_blank" rel="noopener noreferrer" className="font-medium font-inter text-xs md:text-[11px] text-[#806D6D]">Twitter</a>
                          <a href="https://linkedin.com/company/zuri" target="_blank" rel="noopener noreferrer" className="font-medium font-inter text-xs md:text-[11px] text-[#806D6D]">LinkedIn</a>
                        </nav>
                      </div>

                      {/* Legal Column */}
                      <div className="col-span-1 flex flex-col">
                        <div>
                          <h3 className="font-medium font-inter text-sm md:text-[16px] mb-4 md:mb-6">{t.footer.legal}</h3>
                          <nav className="flex flex-col space-y-2 md:space-y-3">
                            <NavLink to="/policies/terms-of-service" className="font-medium font-inter text-xs md:text-[11px] text-[#806D6D]">{t.footer.terms}</NavLink>
                            <NavLink to="/policies/privacy-policy" className="font-medium font-inter text-xs md:text-[11px] text-[#806D6D]">{t.footer.privacy}</NavLink>
                          </nav>
                        </div>
                        {/* Bottom right corner - hidden on mobile, exact original styling on desktop */}
                        <div className="hidden md:block mt-auto">
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