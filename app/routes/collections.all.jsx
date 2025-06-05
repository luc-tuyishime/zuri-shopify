import {useLoaderData, useSearchParams} from '@remix-run/react';
import {getPaginationVariables} from '@shopify/hydrogen';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';
import {ProductItem} from '~/components/ProductItem';
import {useLocale} from "~/hooks/useLocale.js";
import {useTranslation} from "~/lib/i18n.js";
import {useState} from "react";

/**
 * @type {MetaFunction<typeof loader>}
 */
export const meta = () => {
  return [{title: `Zuri | Products`}];
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
async function loadCriticalData({ context, request }) {
  const { storefront } = context;
  const url = new URL(request.url);
  const searchParams = url.searchParams;
  const paginationVariables = getPaginationVariables(request, {
    pageBy: 8,
  });

  // Build query string for filtering
  const queryParts = [];

  // Handle category filter (can be multiple)
  if (searchParams.get('category') && searchParams.get('category') !== '') {
    const categories = searchParams.get('category').split(',');
    const categoryQueries = categories.map(cat => `product_type:"${cat}"`);
    if (categoryQueries.length > 0) {
      queryParts.push(`(${categoryQueries.join(' OR ')})`);
    }
  }

  // Handle longueur filter (can be multiple)
  if (searchParams.get('longueur') && searchParams.get('longueur') !== '') {
    const longueurs = searchParams.get('longueur').split(',');
    const longueurQueries = longueurs.map(lng => `tag:"${lng}"`);
    if (longueurQueries.length > 0) {
      queryParts.push(`(${longueurQueries.join(' OR ')})`);
    }
  }

  // Handle texture filter (can be multiple)
  if (searchParams.get('texture') && searchParams.get('texture') !== '') {
    const textures = searchParams.get('texture').split(',');
    const textureQueries = textures.map(txt => `tag:"${txt}"`);
    if (textureQueries.length > 0) {
      queryParts.push(`(${textureQueries.join(' OR ')})`);
    }
  }

  // Handle couleur filter (can be multiple)
  if (searchParams.get('couleur') && searchParams.get('couleur') !== '') {
    const couleurs = searchParams.get('couleur').split(',');
    const couleurQueries = couleurs.map(col => `tag:"${col}"`);
    if (couleurQueries.length > 0) {
      queryParts.push(`(${couleurQueries.join(' OR ')})`);
    }
  }

  // Handle capSize filter (can be multiple)
  if (searchParams.get('capSize') && searchParams.get('capSize') !== '') {
    const capSizes = searchParams.get('capSize').split(',');
    const capSizeQueries = capSizes.map(size => `tag:"${size}"`);
    if (capSizeQueries.length > 0) {
      queryParts.push(`(${capSizeQueries.join(' OR ')})`);
    }
  }

  const minPrice = searchParams.get('minPrice');
  const maxPrice = searchParams.get('maxPrice');

  if (minPrice && maxPrice) {
    queryParts.push(`variants.price:>=${minPrice} AND variants.price:<=${maxPrice}`);
  } else if (minPrice) {
    queryParts.push(`variants.price:>=${minPrice}`);
  } else if (maxPrice) {
    queryParts.push(`variants.price:<=${maxPrice}`);
  }

  const query = queryParts.length > 0 ? queryParts.join(' AND ') : '';
  const sortKey = searchParams.get('sortKey') || 'UPDATED_AT';
  const reverse = searchParams.get('reverse') === 'true';

  // Updated query with EUR context
  const { products } = await storefront.query(CATALOG_QUERY, {
    variables: {
      query,
      sortKey,
      reverse,
      country: 'FR',
      language: 'FR',
      ...paginationVariables
    },
  });

  return {
    products,
  };
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 * @param {LoaderFunctionArgs}
 */
function loadDeferredData({context}) {
  return {};
}

export default function Collection() {
  const { products, collection } = useLoaderData();
  const [searchParams, setSearchParams] = useSearchParams();
  const [locale] = useLocale();
  const t = useTranslation(locale);

  // Filter states
  const [filters, setFilters] = useState({
    category: searchParams.get('category') ? searchParams.get('category').split(',') : [],
    longueur: searchParams.get('longueur') ? searchParams.get('longueur').split(',') : [],
    texture: searchParams.get('texture') ? searchParams.get('texture').split(',') : [],
    couleur: searchParams.get('couleur') ? searchParams.get('couleur').split(',') : [],
    capSize: searchParams.get('capSize') ? searchParams.get('capSize').split(',') : [],
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
  });

  const [expandedSections, setExpandedSections] = useState({
    category: true,
    longueur: false,
    texture: false,
    couleur: false,
    capSize: false,
    price: false,
  });

  // Filter options
  const filterOptions = {
    category: [
      { value: '', label: locale === 'fr' ? 'Tous' : 'All' },
      { value: 'Units & Wigs', label: locale === 'fr' ? 'Unités & Perruques' : 'Units & Wigs' },
      { value: 'Hair Products', label: locale === 'fr' ? 'Produits Capillaires' : 'Hair Products' },
      { value: 'Best Sellers', label: locale === 'fr' ? 'Meilleures Ventes' : 'Best Sellers' },
    ],
    longueur: [
      { value: '', label: locale === 'fr' ? 'Sélectionner une longueur' : 'Select length' },
      { value: '12"', label: '12"' },
      { value: '14"', label: '14"' },
      { value: '16"', label: '16"' },
      { value: '18"', label: '18"' },
      { value: '20"', label: '20"' },
      { value: '22"', label: '22"' },
      { value: '24"', label: '24"' },
    ],
    texture: [
      { value: '', label: locale === 'fr' ? 'Sélectionner votre texture' : 'Select your texture' },
      // Add your actual texture values from Shopify here
      { value: 'Lisse', label: locale === 'fr' ? 'Lisse' : 'Straight' },
      { value: 'Ondulé', label: locale === 'fr' ? 'Ondulé' : 'Wavy' },
      { value: 'Bouclé', label: locale === 'fr' ? 'Bouclé' : 'Curly' },
      { value: 'Crépu', label: locale === 'fr' ? 'Crépu' : 'Kinky' },
    ],
    couleur: [
      { value: '', label: locale === 'fr' ? 'Sélectionner votre couleur' : 'Select your color' },
      // Update these with your actual French color tags from Shopify
      { value: 'Noir Naturel', label: locale === 'fr' ? 'Noir Naturel' : 'Natural Black' },
      { value: 'Brun Foncé', label: locale === 'fr' ? 'Brun Foncé' : 'Dark Brown' },
      { value: 'Châtain', label: locale === 'fr' ? 'Châtain' : 'Chestnut' },
      { value: 'Blonde', label: locale === 'fr' ? 'Blonde' : 'Blonde' },
      { value: 'Auburn', label: locale === 'fr' ? 'Auburn' : 'Auburn' },
    ],
    capSize: [
      { value: '', label: locale === 'fr' ? 'Sélectionner votre tour de tête' : 'Select your head size' },
      { value: 'Petit', label: locale === 'fr' ? 'Petit (21-21.5")' : 'Small (21-21.5")' },
      { value: 'Moyen', label: locale === 'fr' ? 'Moyen (22-22.5")' : 'Medium (22-22.5")' },
      { value: 'Grand', label: locale === 'fr' ? 'Grand (23-23.5")' : 'Large (23-23.5")' },
    ],
  };

  const updateFilter = (key, value) => {
    if (key === 'minPrice' || key === 'maxPrice') {
      // Handle price inputs normally
      const newFilters = { ...filters, [key]: value };
      setFilters(newFilters);

      const newSearchParams = new URLSearchParams(searchParams);
      if (value) {
        newSearchParams.set(key, value);
      } else {
        newSearchParams.delete(key);
      }
      newSearchParams.delete('cursor');
      newSearchParams.delete('direction');
      setSearchParams(newSearchParams);
    } else {
      // Handle checkbox filters (arrays)
      const currentValues = filters[key] || [];
      let newValues;

      if (currentValues.includes(value)) {
        // Remove if already selected
        newValues = currentValues.filter(v => v !== value);
      } else {
        // Add if not selected
        newValues = [...currentValues, value];
      }

      const newFilters = { ...filters, [key]: newValues };
      setFilters(newFilters);

      // Update URL params
      const newSearchParams = new URLSearchParams(searchParams);
      if (newValues.length > 0) {
        newSearchParams.set(key, newValues.join(','));
      } else {
        newSearchParams.delete(key);
      }
      // Reset pagination when filters change
      newSearchParams.delete('cursor');
      newSearchParams.delete('direction');
      setSearchParams(newSearchParams);
    }
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const clearAllFilters = () => {
    setFilters({
      category: [],
      longueur: [],
      texture: [],
      couleur: [],
      capSize: [],
      minPrice: '',
      maxPrice: '',
    });
    const newSearchParams = new URLSearchParams();
    setSearchParams(newSearchParams);
  };

  const collectionTitle = collection?.title || (locale === 'fr' ? 'NOS PRODUITS CAPILLAIRES' : 'OUR HAIRCARE PRODUCTS');

  return (
      <div className="collection-page min-h-screen bg-white pt-24">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Filters Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white p-6">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-[23px] font-poppins font-bold text-[#000000]">
                    {locale === 'fr' ? 'FILTRER PAR' : 'FILTER BY'}
                  </h2>
                  <button
                      onClick={clearAllFilters}
                      className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    {locale === 'fr' ? 'Effacer tout' : 'Clear all'}
                  </button>
                </div>

                <div className="mb-8">
                  <button
                      onClick={() => toggleSection('category')}
                      className="flex items-center justify-between w-full text-left text-[14.63px] font-poppins font-regular text-[#000000] mb-4"
                  >
                    <span>{locale === 'fr' ? 'Catégorie' : 'Category'}</span>
                    <span className="text-lg">{expandedSections.category ? '−' : '+'}</span>
                  </button>
                  {expandedSections.category && (
                      <div className="space-y-3 ml-0">
                        {filterOptions.category.filter(option => option.value !== '').map((option) => (
                            <label
                                key={option.value}
                                className="flex items-center cursor-pointer hover:bg-gray-50 p-1 rounded"
                            >
                              <input
                                  type="checkbox"
                                  checked={filters.category.includes(option.value)}
                                  onChange={() => updateFilter('category', option.value)}
                                  className="mr-3 h-4 w-4 text-[#FF7575] focus:ring-[#FF7575] border-gray-300 rounded"
                              />
                              <span className={`text-[14px] font-poppins font-regular ${
                                  filters.category.includes(option.value)
                                      ? 'text-[#FF7575] font-medium'
                                      : 'text-[#00000066]'
                              }`}>
                {option.label}
              </span>
                            </label>
                        ))}
                      </div>
                  )}
                </div>

                {/* Longueur Filter with Checkboxes */}
                <div className="mb-8">
                  <button
                      onClick={() => toggleSection('longueur')}
                      className="flex items-center justify-between w-full text-left text-[14.63px] font-poppins font-regular text-[#000000] mb-4"
                  >
                    <span>{locale === 'fr' ? 'Longueur' : 'Length'}</span>
                    <span className="text-lg">{expandedSections.longueur ? '−' : '+'}</span>
                  </button>
                  {expandedSections.longueur && (
                      <div className="space-y-3 ml-0">
                        {filterOptions.longueur.filter(option => option.value !== '').map((option) => (
                            <label
                                key={option.value}
                                className="flex items-center cursor-pointer hover:bg-gray-50 p-1 rounded"
                            >
                              <input
                                  type="checkbox"
                                  checked={filters.longueur.includes(option.value)}
                                  onChange={() => updateFilter('longueur', option.value)}
                                  className="mr-3 h-4 w-4 text-[#FF7575] focus:ring-[#FF7575] border-gray-300 rounded"
                              />
                              <span className={`text-[14px] font-poppins font-regular ${
                                  filters.longueur.includes(option.value)
                                      ? 'text-[#FF7575] font-medium'
                                      : 'text-[#00000066]'
                              }`}>
                {option.label}
              </span>
                            </label>
                        ))}
                      </div>
                  )}
                </div>

                {/* Texture Filter with Checkboxes */}
                <div className="mb-8">
                  <button
                      onClick={() => toggleSection('texture')}
                      className="flex items-center justify-between w-full text-left text-[14.63px] font-poppins font-regular text-[#000000] mb-4"
                  >
                    <span>{locale === 'fr' ? 'Texture' : 'Texture'}</span>
                    <span className="text-lg">{expandedSections.texture ? '−' : '+'}</span>
                  </button>
                  {expandedSections.texture && (
                      <div className="space-y-3 ml-0">
                        {filterOptions.texture.filter(option => option.value !== '').map((option) => (
                            <label
                                key={option.value}
                                className="flex items-center cursor-pointer hover:bg-gray-50 p-1 rounded"
                            >
                              <input
                                  type="checkbox"
                                  checked={filters.texture.includes(option.value)}
                                  onChange={() => updateFilter('texture', option.value)}
                                  className="mr-3 h-4 w-4 text-[#FF7575] focus:ring-[#FF7575] border-gray-300 rounded"
                              />
                              <span className={`text-[14px] font-poppins font-regular ${
                                  filters.texture.includes(option.value)
                                      ? 'text-[#FF7575] font-medium'
                                      : 'text-[#00000066]'
                              }`}>
                {option.label}
              </span>
                            </label>
                        ))}
                      </div>
                  )}
                </div>

                {/* Couleur Filter with Checkboxes */}
                <div className="mb-8">
                  <button
                      onClick={() => toggleSection('couleur')}
                      className="flex items-center justify-between w-full text-left text-[14.63px] font-poppins font-regular text-[#000000] mb-4"
                  >
                    <span>{locale === 'fr' ? 'Couleur' : 'Color'}</span>
                    <span className="text-lg">{expandedSections.couleur ? '−' : '+'}</span>
                  </button>
                  {expandedSections.couleur && (
                      <div className="space-y-3 ml-0">
                        {filterOptions.couleur.filter(option => option.value !== '').map((option) => (
                            <label
                                key={option.value}
                                className="flex items-center cursor-pointer hover:bg-gray-50 p-1 rounded"
                            >
                              <input
                                  type="checkbox"
                                  checked={filters.couleur.includes(option.value)}
                                  onChange={() => updateFilter('couleur', option.value)}
                                  className="mr-3 h-4 w-4 text-[#FF7575] focus:ring-[#FF7575] border-gray-300 rounded"
                              />
                              <span className={`text-[14px] font-poppins font-regular ${
                                  filters.couleur.includes(option.value)
                                      ? 'text-[#FF7575] font-medium'
                                      : 'text-[#00000066]'
                              }`}>
                {option.label}
              </span>
                            </label>
                        ))}
                      </div>
                  )}
                </div>

                {/* Cap Size Filter with Checkboxes */}
                <div className="mb-8">
                  <button
                      onClick={() => toggleSection('capSize')}
                      className="flex items-center justify-between w-full text-left text-[14.63px] font-poppins font-regular text-[#000000] mb-4"
                  >
                    <span>{locale === 'fr' ? 'Tour de tête' : 'Cap Size'}</span>
                    <span className="text-lg">{expandedSections.capSize ? '−' : '+'}</span>
                  </button>
                  {expandedSections.capSize && (
                      <div className="space-y-3 ml-0">
                        {filterOptions.capSize.filter(option => option.value !== '').map((option) => (
                            <label
                                key={option.value}
                                className="flex items-center cursor-pointer hover:bg-gray-50 p-1 rounded"
                            >
                              <input
                                  type="checkbox"
                                  checked={filters.capSize.includes(option.value)}
                                  onChange={() => updateFilter('capSize', option.value)}
                                  className="mr-3 h-4 w-4 text-[#FF7575] focus:ring-[#FF7575] border-gray-300 rounded"
                              />
                              <span className={`text-[14px] font-poppins font-regular ${
                                  filters.capSize.includes(option.value)
                                      ? 'text-[#FF7575] font-medium'
                                      : 'text-[#00000066]'
                              }`}>
                {option.label}
              </span>
                            </label>
                        ))}
                      </div>
                  )}
                </div>

                {/* Price Filter - Keep as is */}
                <div className="mb-8">
                  <button
                      onClick={() => toggleSection('price')}
                      className="flex items-center justify-between w-full text-left text-[14.63px] font-poppins font-regular text-[#000000] font-medium mb-4"
                  >
                    <span>{locale === 'fr' ? 'Prix' : 'Price'}</span>
                    <span className="text-lg">{expandedSections.price ? '−' : '+'}</span>
                  </button>
                  {expandedSections.price && (
                      <div className="space-y-4 ml-0">
                        <div>
                          <label className="block text-sm text-gray-700 mb-2">
                            {locale === 'fr' ? 'Prix minimum' : 'Min Price'}
                          </label>
                          <input
                              type="number"
                              value={filters.minPrice}
                              onChange={(e) => updateFilter('minPrice', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-red-500 focus:border-red-500"
                              placeholder="0"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-700 mb-2">
                            {locale === 'fr' ? 'Prix maximum' : 'Max Price'}
                          </label>
                          <input
                              type="number"
                              value={filters.maxPrice}
                              onChange={(e) => updateFilter('maxPrice', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-red-500 focus:border-red-500"
                              placeholder="999"
                          />
                        </div>
                      </div>
                  )}
                </div>
              </div>
            </div>

            {/* Products Grid */}
            <div className="lg:col-span-3">
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-[32px] font-medium text-gray-900 font-poppins">
                  {collectionTitle}
                </h1>
                {/*<button className="p-2 text-gray-600 hover:text-gray-900">*/}
                {/*  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">*/}
                {/*    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />*/}
                {/*  </svg>*/}
                {/*</button>*/}
              </div>

              <PaginatedResourceSection
                  connection={products}
                  resourcesClassName="grid grid-cols-1 md:grid-cols-2 products-grid lg:grid-cols-3 gap-6"
              >
                {({node: product, index}) => {

                  return (
                      <div key={product.id} className="bg-white overflow-hidden hover:shadow-lg transition-shadow">
                        <ProductItem
                            product={product}
                            loading={index < 8 ? 'eager' : undefined}
                            variant="collection"
                        />
                      </div>
                      )
                }}
              </PaginatedResourceSection>
              {!products?.nodes?.length && (
                  <div className="text-center py-12">
                    <p className="text-gray-500">
                      {locale === 'fr'
                          ? 'Aucun produit trouvé avec ces filtres.'
                          : 'No products found with these filters.'}
                    </p>
                  </div>
              )}
            </div>
          </div>
        </div>
      </div>
  );
}

const COLLECTION_ITEM_FRAGMENT = `#graphql
  fragment MoneyCollectionItem on MoneyV2 {
    amount
    currencyCode
  }
  fragment CollectionItem on Product {
    id
    handle
    title
    featuredImage {
      id
      altText
      url
      width
      height
    }
    priceRange {
      minVariantPrice {
        ...MoneyCollectionItem
      }
      maxVariantPrice {
        ...MoneyCollectionItem
      }
    }
    variants(first: 1) {
      nodes {
        price {
          amount
          currencyCode
        }
      }
    }
    tags
    productType
  }
`;

// FIXED: Use the working query approach with 'query' parameter instead of 'filters'
const CATALOG_QUERY = `#graphql
  query Catalog(
    $country: CountryCode
    $language: LanguageCode
    $query: String
    $sortKey: ProductSortKeys
    $reverse: Boolean
    $first: Int
    $last: Int
    $startCursor: String
    $endCursor: String
  ) @inContext(country: $country, language: $language) {
    products(
      first: $first
      last: $last
      before: $startCursor
      after: $endCursor
      query: $query
      sortKey: $sortKey
      reverse: $reverse
    ) {
      nodes {
        ...CollectionItem
      }
      pageInfo {
        hasPreviousPage
        hasNextPage
        startCursor
        endCursor
      }
    }
  }
  ${COLLECTION_ITEM_FRAGMENT}
`;

/** @typedef {import('@shopify/remix-oxygen').LoaderFunctionArgs} LoaderFunctionArgs */
/** @template T @typedef {import('@remix-run/react').MetaFunction<T>} MetaFunction */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */