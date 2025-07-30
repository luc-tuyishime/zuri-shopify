import {Suspense} from 'react';
import {Await, NavLink, Link} from '@remix-run/react';
import LogoWhite from '../assets/Vector.svg';
import {useLocale} from "~/hooks/useLocale.js";
import {useTranslation} from "~/lib/i18n.js";

// GraphQL query to fetch shop metafields for footer
const FOOTER_METAFIELDS_QUERY = `#graphql
  query FooterMetafields {
    shop {
      metafields(identifiers: [
        # Company Info
        {namespace: "custom", key: "company_description_en"},
        {namespace: "custom", key: "company_description_fr"},
        {namespace: "custom", key: "footer_be_bold_text_en"},
        {namespace: "custom", key: "be_bold_text_fr"},
        {namespace: "custom", key: "copyright_en"},
        {namespace: "custom", key: "copyright_fr"},
        
        # Section Titles
        {namespace: "custom", key: "explore_title_en"},
        {namespace: "custom", key: "explore_title_fr"},
        {namespace: "custom", key: "shops_title_en"},
        {namespace: "custom", key: "shops_title_fr"},
        {namespace: "custom", key: "contact_title_en"},
        {namespace: "custom", key: "contact_title_fr"},
        {namespace: "custom", key: "follow_title_en"},
        {namespace: "custom", key: "follow_title_fr"},
        {namespace: "custom", key: "legal_title_en"},
        {namespace: "custom", key: "title_fr"},
        
        # Explore Links (text and URLs)
        {namespace: "custom", key: "home_text_en"},
        {namespace: "custom", key: "home_text_fr"},
        {namespace: "custom", key: "home_url"},
        {namespace: "custom", key: "about_text_en"},
        {namespace: "custom", key: "about_text_fr"},
        {namespace: "custom", key: "about_url"},
        {namespace: "custom", key: "best_sellers_text_en"},
        {namespace: "custom", key: "best_sellers_text_fr"},
        {namespace: "custom", key: "best_sellers_url"},
        {namespace: "custom", key: "wigs_text_en"},
        {namespace: "custom", key: "wigs_text_fr"},
        {namespace: "custom", key: "wigs_url"},
        {namespace: "custom", key: "wig_care_text_en"},
        {namespace: "custom", key: "wig_care_text_fr"},
        {namespace: "custom", key: "wig_care_url"},
        {namespace: "custom", key: "hair_care_text_en"},
        {namespace: "custom", key: "hair_care_text_fr"},
        {namespace: "custom", key: "hair_care_url"},
        {namespace: "custom", key: "community_text_en"},
        {namespace: "custom", key: "community_text_fr"},
        {namespace: "custom", key: "community_url"},
        
        # Shop Locations
        {namespace: "custom", key: "shop_1_name"},
        {namespace: "custom", key: "shop_1_url"},
        {namespace: "custom", key: "shop_2_name"},
        {namespace: "custom", key: "shop_2_url"},
        {namespace: "custom", key: "shop_3_name"},
        {namespace: "custom", key: "shop_3_url"},
        
        # Contact Info
        {namespace: "custom", key: "contact_email"},
        {namespace: "custom", key: "contact_phone"},
        
        # Social Media
        {namespace: "custom", key: "instagram_text"},
        {namespace: "custom", key: "instagram_url"},
        {namespace: "custom", key: "twitter_text"},
        {namespace: "custom", key: "twitter_url"},
        {namespace: "custom", key: "linkedin_text"},
        {namespace: "custom", key: "linkedin_url"},
        
        # Legal Links
        {namespace: "custom", key: "terms_text_en"},
        {namespace: "custom", key: "terms_text_fr"},
        {namespace: "custom", key: "terms_url"},
        {namespace: "custom", key: "privacy_text_en"},
        {namespace: "custom", key: "privacy_text_fr"},
        {namespace: "custom", key: "privacy_url"}
      ]) {
        key
        value
      }
    }
  }
`;

// Helper function to get metafield value with fallback
function getFooterMetafieldValue(metafields, key, fallback = '') {
  const metafield = metafields?.find(m => m?.key === key);
  const value = metafield?.value;

  // Only use metafield value if it's not empty/null/undefined
  if (value && value.trim() !== '') {
    return value;
  }

  return fallback;
}

/**
 * @param {FooterProps}
 */
export function Footer({footer: footerPromise, header, publicStoreDomain, footerData}) {
  const [locale] = useLocale();
  const t = useTranslation(locale);

  // Safely access metafields
  const metafields = footerData?.shop?.metafields || [];

  // Debug log (remove in production)
  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 Footer metafields:', metafields.length, 'items');
    console.log('🔍 Available metafield keys:', metafields.map(m => m?.key).filter(Boolean));
  }

  // Get dynamic content with fallbacks to translation system
  const dynamicContent = {
    // Company Info
    companyDescription: getFooterMetafieldValue(
        metafields,
        locale === 'fr' ? 'footer_company_description_fr' : 'footer_company_description_en',
        t.footer.companyDescription
    ),
    beBoldText: getFooterMetafieldValue(
        metafields,
        locale === 'fr' ? 'footer_be_bold_text_fr' : 'footer_be_bold_text_en',
        t.footer.beBold
    ),
    copyright: getFooterMetafieldValue(
        metafields,
        locale === 'fr' ? 'footer_copyright_fr' : 'footer_copyright_en',
        t.footer.copyright
    ),

    // Section Titles
    exploreTitle: getFooterMetafieldValue(
        metafields,
        locale === 'fr' ? 'footer_explore_title_fr' : 'footer_explore_title_en',
        t.footer.explore
    ),
    shopsTitle: getFooterMetafieldValue(
        metafields,
        locale === 'fr' ? 'footer_shops_title_fr' : 'footer_shops_title_en',
        t.footer.shops
    ),
    contactTitle: getFooterMetafieldValue(
        metafields,
        locale === 'fr' ? 'footer_contact_title_fr' : 'footer_contact_title_en',
        t.footer.contact
    ),
    followTitle: getFooterMetafieldValue(
        metafields,
        locale === 'fr' ? 'footer_follow_title_fr' : 'footer_follow_title_en',
        t.footer.follow
    ),
    legalTitle: getFooterMetafieldValue(
        metafields,
        locale === 'fr' ? 'footer_legal_title_fr' : 'footer_legal_title_en',
        t.footer.legal
    ),

    // Contact Info
    contactEmail: getFooterMetafieldValue(metafields, 'footer_contact_email', 'info@myzuri.com'),
    contactPhone: getFooterMetafieldValue(metafields, 'footer_contact_phone', '+2351567262'),
  };

  // Build explore links dynamically
  const exploreLinks = [
    {
      text: getFooterMetafieldValue(
          metafields,
          locale === 'fr' ? 'footer_explore_home_text_fr' : 'footer_explore_home_text_en',
          t.footer.home
      ),
      url: getFooterMetafieldValue(metafields, 'footer_explore_home_url', '/')
    },
    {
      text: getFooterMetafieldValue(
          metafields,
          locale === 'fr' ? 'footer_explore_about_text_fr' : 'footer_explore_about_text_en',
          t.footer.about
      ),
      url: getFooterMetafieldValue(metafields, 'footer_explore_about_url', '/pages/about')
    },
    {
      text: getFooterMetafieldValue(
          metafields,
          locale === 'fr' ? 'footer_explore_bestsellers_text_fr' : 'footer_explore_bestsellers_text_en',
          t.footer.bestSellers
      ),
      url: getFooterMetafieldValue(metafields, 'footer_explore_bestsellers_url', '/collections/best-sellers')
    },
    {
      text: getFooterMetafieldValue(
          metafields,
          locale === 'fr' ? 'footer_explore_wigs_text_fr' : 'footer_explore_wigs_text_en',
          t.footer.wigs
      ),
      url: getFooterMetafieldValue(metafields, 'footer_explore_wigs_url', '/collections/wigs')
    },
    {
      text: getFooterMetafieldValue(
          metafields,
          locale === 'fr' ? 'footer_explore_wigcare_text_fr' : 'footer_explore_wigcare_text_en',
          t.footer.wigCare
      ),
      url: getFooterMetafieldValue(metafields, 'footer_explore_wigcare_url', '/pages/wig-care')
    },
    {
      text: getFooterMetafieldValue(
          metafields,
          locale === 'fr' ? 'footer_explore_haircare_text_fr' : 'footer_explore_haircare_text_en',
          t.footer.hairCare
      ),
      url: getFooterMetafieldValue(metafields, 'footer_explore_haircare_url', '/pages/hair-care')
    },
    {
      text: getFooterMetafieldValue(
          metafields,
          locale === 'fr' ? 'footer_explore_community_text_fr' : 'footer_explore_community_text_en',
          t.footer.community
      ),
      url: getFooterMetafieldValue(metafields, 'footer_explore_community_url', '/pages/community')
    }
  ];

  // Build shop locations dynamically
  const shopLocations = [];
  for (let i = 1; i <= 3; i++) {
    const name = getFooterMetafieldValue(metafields, `footer_shop_${i}_name`);
    const url = getFooterMetafieldValue(metafields, `footer_shop_${i}_url`);

    if (name) { // Only add if name exists
      shopLocations.push({
        name,
        url: url || '#' // Default to # if no URL provided
      });
    }
  }

  // Fallback shop locations if none are configured
  if (shopLocations.length === 0) {
    shopLocations.push(
        { name: 'Kigali', url: '#' },
        { name: 'Uganda', url: '#' },
        { name: 'DRC', url: '#' }
    );
  }

  // Build social media links dynamically
  const socialLinks = [
    {
      text: getFooterMetafieldValue(metafields, 'footer_social_instagram_text', 'Instagram'),
      url: getFooterMetafieldValue(metafields, 'footer_social_instagram_url', 'https://www.instagram.com/zuribelgique')
    },
    {
      text: getFooterMetafieldValue(metafields, 'footer_social_twitter_text', 'Twitter'),
      url: getFooterMetafieldValue(metafields, 'footer_social_twitter_url', 'https://twitter.com/zuri')
    },
    {
      text: getFooterMetafieldValue(metafields, 'footer_social_linkedin_text', 'LinkedIn'),
      url: getFooterMetafieldValue(metafields, 'footer_social_linkedin_url', 'https://linkedin.com/company/zuri')
    }
  ].filter(link => link.text && link.url); // Only include links with both text and URL

  // Build legal links dynamically
  const legalLinks = [
    {
      text: getFooterMetafieldValue(
          metafields,
          locale === 'fr' ? 'footer_legal_terms_text_fr' : 'footer_legal_terms_text_en',
          t.footer.terms
      ),
      url: getFooterMetafieldValue(metafields, 'footer_legal_terms_url', '/policies/terms-of-service')
    },
    {
      text: getFooterMetafieldValue(
          metafields,
          locale === 'fr' ? 'footer_legal_privacy_text_fr' : 'footer_legal_privacy_text_en',
          t.footer.privacy
      ),
      url: getFooterMetafieldValue(metafields, 'footer_legal_privacy_url', '/policies/privacy-policy')
    }
  ];

  return (
      <Suspense>
        <Await resolve={footerPromise}>
          {(footer) => (
              <footer className="bg-[#5C2E1C] text-white py-8 md:py-16 relative">
                {/* Debug info in development */}
                {process.env.NODE_ENV === 'development' && metafields.length > 0 && (
                    <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded z-50">
                      Dynamic: {metafields.length} metafields
                    </div>
                )}

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
                          {dynamicContent.companyDescription}
                        </p>
                        <p className="font-bold text-xs md:text-[11px] mb-6 md:mb-8">
                          {dynamicContent.beBoldText}
                        </p>
                        <p className="text-xs md:text-[11px] mt-8 md:mt-16">
                          {dynamicContent.copyright}
                        </p>
                      </div>

                      {/* Explore Column */}
                      <div className="col-span-1">
                        <p className="font-medium font-inter text-sm md:text-[16px] mb-4 md:mb-6">
                          {dynamicContent.exploreTitle}
                        </p>
                        <nav className="flex flex-col space-y-2 md:space-y-3">
                          {exploreLinks.map((link, index) => (
                              <NavLink
                                  key={index}
                                  to={link.url}
                                  className="font-medium font-inter text-xs md:text-[11px] text-[#806D6D]"
                              >
                                {link.text}
                              </NavLink>
                          ))}
                        </nav>
                      </div>

                      {/* Shops Column */}
                      <div className="col-span-1">
                        <h3 className="font-medium font-inter text-sm md:text-[16px] mb-4 md:mb-6">
                          {dynamicContent.shopsTitle}
                        </h3>
                        <nav className="flex flex-col space-y-2 md:space-y-3">
                          {shopLocations.map((shop, index) => (
                              <a
                                  key={index}
                                  href={shop.url}
                                  className="font-medium font-inter text-xs md:text-[11px] text-[#806D6D]"
                              >
                                {shop.name}
                              </a>
                          ))}
                        </nav>

                        <h3 className="font-medium font-inter text-sm md:text-[16px] mb-3 md:mb-4 mt-6 md:mt-8">
                          {dynamicContent.contactTitle}
                        </h3>
                        <p className="font-medium font-inter text-xs md:text-[11px] text-[#806D6D] mb-2">
                          {dynamicContent.contactEmail}
                        </p>
                        <a
                            href={`tel:${dynamicContent.contactPhone}`}
                            className="font-medium font-inter text-xs md:text-[11px] text-[#806D6D]"
                        >
                          {dynamicContent.contactPhone}
                        </a>
                      </div>

                      {/* Follow Column */}
                      <div className="col-span-1">
                        <h3 className="font-medium font-inter text-sm md:text-[16px] mb-4 md:mb-6">
                          {dynamicContent.followTitle}
                        </h3>
                        <nav className="flex flex-col space-y-2 md:space-y-3">
                          {socialLinks.map((social, index) => (
                              <a
                                  key={index}
                                  href={social.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="font-medium font-inter text-xs md:text-[11px] text-[#806D6D]"
                              >
                                {social.text}
                              </a>
                          ))}
                        </nav>
                      </div>

                      {/* Legal Column */}
                      <div className="col-span-1 flex flex-col">
                        <div>
                          <h3 className="font-medium font-inter text-sm md:text-[16px] mb-4 md:mb-6">
                            {dynamicContent.legalTitle}
                          </h3>
                          <nav className="flex flex-col space-y-2 md:space-y-3">
                            {legalLinks.map((legal, index) => (
                                <NavLink
                                    key={index}
                                    to={legal.url}
                                    className="font-medium font-inter text-xs md:text-[11px] text-[#806D6D]"
                                >
                                  {legal.text}
                                </NavLink>
                            ))}
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

// Export the query for use in your loader
export { FOOTER_METAFIELDS_QUERY };

// Keep the existing fallback menu and styles for compatibility
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
 * @property {Object} footerData
 */

/** @typedef {import('storefrontapi.generated').FooterQuery} FooterQuery */
/** @typedef {import('storefrontapi.generated').HeaderQuery} HeaderQuery */