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

  if (searchParams.get('category') && searchParams.get('category') !== '') {
    queryParts.push(`product_type:"${searchParams.get('category')}"`);
  }

  if (searchParams.get('color') && searchParams.get('color') !== '') {
    queryParts.push(`tag:"${searchParams.get('color')}"`);
  }

  if (searchParams.get('scent') && searchParams.get('scent') !== '') {
    queryParts.push(`tag:"${searchParams.get('scent')}"`);
  }

  if (searchParams.get('length') && searchParams.get('length') !== '') {
    queryParts.push(`tag:"${searchParams.get('length')}"`);
  }

  if (searchParams.get('laceSize') && searchParams.get('laceSize') !== '') {
    queryParts.push(`tag:"${searchParams.get('laceSize')}"`);
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
    category: searchParams.get('category') || '',
    color: searchParams.get('color') || '',
    scent: searchParams.get('scent') || '',
    length: searchParams.get('length') || '',
    laceSize: searchParams.get('laceSize') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
  });

  const [expandedSections, setExpandedSections] = useState({
    category: true,
    color: false,
    scent: false,
    option: false,
    length: false,
    laceSize: false,
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
    color: [
      { value: '', label: locale === 'fr' ? 'Toutes les couleurs' : 'All colors' },
      { value: 'Châtain caramel', label: locale === 'fr' ? 'Châtain caramel' : 'Caramel Brown' },
      { value: 'Noir', label: locale === 'fr' ? 'Noir' : 'Black' },
      { value: 'Blonde', label: locale === 'fr' ? 'Blonde' : 'Blonde' },
      { value: 'Auburn', label: locale === 'fr' ? 'Auburn' : 'Auburn' },
    ],
    scent: [
      { value: '', label: locale === 'fr' ? 'Tous les parfums' : 'All scents' },
      { value: 'Vanilla', label: locale === 'fr' ? 'Vanille' : 'Vanilla' },
      { value: 'Coconut', label: locale === 'fr' ? 'Noix de coco' : 'Coconut' },
      { value: 'Lavender', label: locale === 'fr' ? 'Lavande' : 'Lavender' },
    ],
    length: [
      { value: '', label: locale === 'fr' ? 'Toutes les longueurs' : 'All lengths' },
      { value: '12"', label: '12"' },
      { value: '14"', label: '14"' },
      { value: '16"', label: '16"' },
      { value: '18"', label: '18"' },
      { value: '20"', label: '20"' },
    ],
    laceSize: [
      { value: '', label: locale === 'fr' ? 'Toutes les tailles' : 'All sizes' },
      { value: '4x4', label: '4x4' },
      { value: '5x5', label: '5x5' },
      { value: '13x4', label: '13x4' },
      { value: '13x6', label: '13x6' },
    ],
  };

  const updateFilter = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);

    // Update URL params
    const newSearchParams = new URLSearchParams(searchParams);
    if (value) {
      newSearchParams.set(key, value);
    } else {
      newSearchParams.delete(key);
    }
    // Reset pagination when filters change
    newSearchParams.delete('cursor');
    newSearchParams.delete('direction');
    setSearchParams(newSearchParams);
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const clearAllFilters = () => {
    setFilters({
      category: '',
      color: '',
      scent: '',
      length: '',
      laceSize: '',
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

                {/* Category Filter */}
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
                        {filterOptions.category.map((option) => (
                            <button
                                key={option.value}
                                onClick={() => updateFilter('category', option.value)}
                                className={`block text-left text-[14px] font-poppins font-regular text-sm w-full ${
                                    filters.category === option.value
                                        ? 'text-[#FF7575] font-medium'
                                        : 'text-[#00000066]  hover:text-gray-900'
                                }`}
                            >
                              {option.label}
                              {filters.category === option.value && (
                                  <span className="ml-2 text-red-500">✓</span>
                              )}
                            </button>
                        ))}
                      </div>
                  )}
                </div>

                {/* Color Filter */}
                <div className="mb-8">
                  <button
                      onClick={() => toggleSection('color')}
                      className="flex items-center justify-between w-full text-left  text-[14.63px] font-poppins font-regular text-[#000000]  font-medium mb-4"
                  >
                    <span>{locale === 'fr' ? 'Couleur' : 'Color'}</span>
                    <span className="text-lg">{expandedSections.color ? '−' : '+'}</span>
                  </button>
                  {expandedSections.color && (
                      <div className="space-y-3 ml-0">
                        {filterOptions.color.map((option) => (
                            <button
                                key={option.value}
                                onClick={() => updateFilter('color', option.value)}
                                className={`block text-left text-[14px] font-poppins font-regular text-sm w-full ${
                                    filters.color === option.value
                                        ? 'text-[#FF7575] font-medium'
                                        : 'text-[#00000066] hover:text-gray-900'
                                }`}
                            >
                              {option.label}
                            </button>
                        ))}
                      </div>
                  )}
                </div>

                {/* Scent Filter */}
                <div className="mb-8">
                  <button
                      onClick={() => toggleSection('scent')}
                      className="flex items-center justify-between w-full text-left text-[14.63px] font-poppins font-regular text-[#000000] font-medium mb-4"
                  >
                    <span>{locale === 'fr' ? 'Parfum' : 'Scent'}</span>
                    <span className="text-lg">{expandedSections.scent ? '−' : '+'}</span>
                  </button>
                  {expandedSections.scent && (
                      <div className="space-y-3 ml-0">
                        {filterOptions.scent.map((option) => (
                            <button
                                key={option.value}
                                onClick={() => updateFilter('scent', option.value)}
                                className={`block text-left text-[14px] font-poppins font-regular text-sm w-full ${
                                    filters.scent === option.value
                                        ? 'text-[#FF7575] font-medium'
                                        : 'text-[#00000066] hover:text-gray-900'
                                }`}
                            >
                              {option.label}
                            </button>
                        ))}
                      </div>
                  )}
                </div>

                {/* Option Filter (placeholder - you can customize this) */}
                <div className="mb-8">
                  <button
                      onClick={() => toggleSection('option')}
                      className="flex items-center justify-between w-full text-left text-[14.63px] font-poppins font-regular text-[#000000] font-medium mb-4"
                  >
                    <span>{locale === 'fr' ? 'Option' : 'Option'}</span>
                    <span className="text-lg">{expandedSections.option ? '−' : '+'}</span>
                  </button>
                  {expandedSections.option && (
                      <div className="space-y-3 ml-0">
                        <button className="block text-left text-sm w-full text-gray-600 hover:text-gray-900">
                          {locale === 'fr' ? 'Option 1' : 'Option 1'}
                        </button>
                        <button className="block text-left text-sm w-full text-gray-600 hover:text-gray-900">
                          {locale === 'fr' ? 'Option 2' : 'Option 2'}
                        </button>
                      </div>
                  )}
                </div>

                {/* Length Filter */}
                <div className="mb-8">
                  <button
                      onClick={() => toggleSection('length')}
                      className="flex items-center justify-between w-full text-left text-[14.63px] font-poppins font-regular text-[#000000] font-medium mb-4"
                  >
                    <span>{locale === 'fr' ? 'Longueur' : 'Length'}</span>
                    <span className="text-lg">{expandedSections.length ? '−' : '+'}</span>
                  </button>
                  {expandedSections.length && (
                      <div className="space-y-3 ml-0">
                        {filterOptions.length.map((option) => (
                            <button
                                key={option.value}
                                onClick={() => updateFilter('length', option.value)}
                                className={`block text-left text-[14px] font-poppins font-regular text-sm w-full ${
                                    filters.length === option.value
                                        ? 'text-[#FF7575] font-medium'
                                        : 'text-[#00000066] hover:text-gray-900'
                                }`}
                            >
                              {option.label}
                            </button>
                        ))}
                      </div>
                  )}
                </div>

                {/* Lace Size Filter */}
                <div className="mb-8">
                  <button
                      onClick={() => toggleSection('laceSize')}
                      className="flex items-center justify-between w-full text-left text-[14.63px] font-poppins font-regular text-[#000000] font-medium mb-4"
                  >
                    <span>{locale === 'fr' ? 'Taille de Dentelle' : 'Lace Size'}</span>
                    <span className="text-lg">{expandedSections.laceSize ? '−' : '+'}</span>
                  </button>
                  {expandedSections.laceSize && (
                      <div className="space-y-3 ml-0">
                        {filterOptions.laceSize.map((option) => (
                            <button
                                key={option.value}
                                onClick={() => updateFilter('laceSize', option.value)}
                                className={`block text-left  text-[14px] font-poppins font-regular text-sm w-full ${
                                    filters.laceSize === option.value
                                        ? 'text-[#FF7575] font-medium'
                                        : 'text-[#00000066] hover:text-gray-900'
                                }`}
                            >
                              {option.label}
                            </button>
                        ))}
                      </div>
                  )}
                </div>

                {/* Price Filter */}
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
                  resourcesClassName="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
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