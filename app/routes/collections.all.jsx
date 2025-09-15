import {useLoaderData, useSearchParams} from '@remix-run/react';
import {getPaginationVariables} from '@shopify/hydrogen';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';
import {ProductItem} from '~/components/ProductItem';
import {useLocale} from "~/hooks/useLocale.js";
import {useTranslation} from "~/lib/i18n.js";
import {useState, useEffect, useMemo} from "react";
import {useAside} from '~/components/Aside';

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

  // Check if we're filtering by a specific collection
  const collectionHandle = searchParams.get('collection');
  let products;
  let selectedCollection = null;
  let allProductsForFilters = null;

  if (collectionHandle) {
    // Build filter query parts even when filtering by collection
    const queryParts = [];

    if (searchParams.get('category') && searchParams.get('category') !== '') {
      const categories = searchParams.get('category').split(',');
      const categoryQueries = categories.map(cat => `product_type:"${cat}"`);
      if (categoryQueries.length > 0) {
        queryParts.push(`(${categoryQueries.join(' OR ')})`);
      }
    }

    const variantFilters = ['longueur', 'texture', 'couleur', 'capSize'];
    variantFilters.forEach(filterKey => {
      if (searchParams.get(filterKey) && searchParams.get(filterKey) !== '') {
        const values = searchParams.get(filterKey).split(',');

        const valueQueries = values.map(val => {
          if (filterKey === 'longueur') {
            return `variants.title:*${val}*`; // Use proper search syntax
          } else if (filterKey === 'texture') {
            return `(variants.title:"${val}" OR tag:"${val}")`;
          } else if (filterKey === 'capSize') {
            const cleanVal = val.replace(/[()""]/g, '');
            return `(variants.title:*${cleanVal}* OR tag:"${cleanVal}")`;
          } else {
            return `(variants.title:"${val}" OR tag:"${val}")`;
          }
        }).filter(query => query !== null);
        if (valueQueries.length > 0) {
          queryParts.push(`(${valueQueries.join(' OR ')})`);
        }
      }
    });

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

    try {
      if (query === '') {
        // No additional filters, use regular collection query
        const collectionData = await storefront.query(COLLECTION_WITH_PRODUCTS_QUERY, {
          variables: {
            handle: collectionHandle,
            country: 'FR',
            language: 'FR',
            sortKey: 'TITLE',
            reverse: false,
            ...paginationVariables
          },
        });

        selectedCollection = collectionData.collection;
        products = collectionData.collection?.products || { nodes: [], pageInfo: {} };
      } else {
        // Apply filters to collection using search query
        const filteredQuery = `collection:${collectionHandle} AND ${query}`;
        const productsData = await storefront.query(CATALOG_QUERY, {
          variables: {
            query: filteredQuery,
            sortKey: 'TITLE',
            reverse: false,
            country: 'FR',
            language: 'FR',
            ...paginationVariables
          },
        });
        products = productsData.products;

        // Still get collection info for title/metadata
        const collectionInfo = await storefront.query(COLLECTION_WITH_PRODUCTS_QUERY, {
          variables: {
            handle: collectionHandle,
            country: 'FR',
            language: 'FR',
            first: 1
          },
        });
        selectedCollection = collectionInfo.collection;
      }

      // Also fetch all products from this collection for filter options (without pagination)
      const allCollectionProducts = await storefront.query(COLLECTION_ALL_PRODUCTS_QUERY, {
        variables: {
          handle: collectionHandle,
          country: 'FR',
          language: 'FR',
          first: 250
        },
      });
      allProductsForFilters = allCollectionProducts.collection?.products?.nodes || [];

    } catch (error) {
      console.error('Collection filtering error:', error);
      products = { nodes: [], pageInfo: {} };
    }
  } else {
    // ADD THIS MISSING ELSE BLOCK:
    const queryParts = [];

    if (searchParams.get('category') && searchParams.get('category') !== '') {
      const categories = searchParams.get('category').split(',');
      const categoryQueries = categories.map(cat => `product_type:"${cat}"`);
      if (categoryQueries.length > 0) {
        queryParts.push(`(${categoryQueries.join(' OR ')})`);
      }
    }

    const variantFilters = ['longueur', 'texture', 'couleur', 'capSize'];
    variantFilters.forEach(filterKey => {
      if (searchParams.get(filterKey) && searchParams.get(filterKey) !== '') {
        const values = searchParams.get(filterKey).split(',');

        const valueQueries = values.map(val => {
          if (filterKey === 'longueur') {
            return `variants.title:*${val}*`;
          } else if (filterKey === 'texture') {
            return `(variants.title:"${val}" OR tag:"${val}")`;
          } else if (filterKey === 'capSize') {
            const cleanVal = val.replace(/[()""]/g, '');
            return `(variants.title:*${cleanVal}* OR tag:"${cleanVal}")`;
          } else {
            return `(variants.title:"${val}" OR tag:"${val}")`;
          }
        }).filter(query => query !== null);
        if (valueQueries.length > 0) {
          queryParts.push(`(${valueQueries.join(' OR ')})`);
        }
      }
    });

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
    const sortKey = searchParams.get('sortKey') || 'TITLE';
    const reverse = searchParams.get('reverse') === 'true';

    if (query === '') {
      const productsData = await storefront.query(ALL_PRODUCTS_QUERY, {
        variables: {
          sortKey,
          reverse,
          country: 'FR',
          language: 'FR',
          ...paginationVariables
        },
      });
      products = productsData.products;
    } else {
      const productsData = await storefront.query(CATALOG_QUERY, {
        variables: {
          query,
          sortKey,
          reverse,
          country: 'FR',
          language: 'FR',
          ...paginationVariables
        },
      });
      products = productsData.products;
    }

    const allProductsData = await storefront.query(ALL_PRODUCTS_FOR_FILTERS_QUERY, {
      variables: {
        country: 'FR',
        language: 'FR',
        first: 250
      },
    });
    allProductsForFilters = allProductsData.products.nodes;
  }


  return {
    products,
    selectedCollection,
    allProductsForFilters
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

// Helper function to extract unique variant options
function extractVariantOptions(products, locale) {
  const optionSets = {
    longueur: new Set(),
    texture: new Set(),
    couleur: new Set(),
    capSize: new Set(),
    category: new Set()
  };

  products.forEach(product => {
    // Extract product types as categories
    if (product.productType) {
      optionSets.category.add(product.productType);
    }

    // Extract ONLY from actual variant options (not titles)
    if (product.variants && product.variants.nodes) {
      product.variants.nodes.forEach(variant => {
        if (variant.selectedOptions) {
          variant.selectedOptions.forEach(option => {
            const optionName = option.name.toLowerCase();
            const optionValue = option.value;

            // Map option names to filter categories
            if (optionName.includes('longueur') || optionName.includes('length')) {
              optionSets.longueur.add(optionValue);
            } else if (optionName.includes('texture')) {
              optionSets.texture.add(optionValue);
            } else if (optionName.includes('couleur') || optionName.includes('color') || optionName.includes('colour')) {
              optionSets.couleur.add(optionValue);
            } else if (optionName.includes('cap size') || optionName.includes('cap') || optionName.includes('size')) {
              optionSets.capSize.add(optionValue);
            }
          });
        }
      });
    }

    // Extract from tags (but only add if they match expected patterns)
    if (product.tags) {
      product.tags.forEach(tag => {
        const tagLower = tag.toLowerCase();

        // Only add length tags that have proper format
        if (tagLower.match(/^\d+["'']\s*$/)) {
          optionSets.longueur.add(tag);
        }

        // Only add predefined texture values that exist in your products
        if (['straight', 'wavy', 'curly', 'kinky'].includes(tagLower)) {
          optionSets.texture.add(tag);
        }
      });
    }
  });

  // Convert sets to sorted arrays
  return {
    category: Array.from(optionSets.category).sort(),
    longueur: Array.from(optionSets.longueur).sort(),
    texture: Array.from(optionSets.texture).sort(),
    couleur: Array.from(optionSets.couleur).sort(),
    capSize: Array.from(optionSets.capSize).sort()
  };
}

export default function Collection() {
  const { products, selectedCollection, allProductsForFilters } = useLoaderData();
  const [searchParams, setSearchParams] = useSearchParams();
  const [locale] = useLocale();
  const t = useTranslation(locale);
  const {open} = useAside();

  // Add mobile filter state
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Get the current collection filter from URL
  const currentCollectionFilter = searchParams.get('collection') || '';

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

  // Generate dynamic filter options from products
  const filterOptions = useMemo(() => {
    if (!allProductsForFilters || allProductsForFilters.length === 0) {
      return {
        category: [],
        longueur: [],
        texture: [],
        couleur: [],
        capSize: []
      };
    }

    const extractedOptions = extractVariantOptions(allProductsForFilters, locale);

    return {
      category: extractedOptions.category.map(cat => ({
        value: cat,
        label: cat
      })),
      longueur: extractedOptions.longueur.map(length => ({
        value: length,
        label: length
      })),
      texture: extractedOptions.texture.map(texture => ({
        value: texture,
        label: texture
      })),
      couleur: extractedOptions.couleur.map(color => ({
        value: color,
        label: color
      })),
      capSize: extractedOptions.capSize.map(size => ({
        value: size,
        label: size
      }))
    };
  }, [allProductsForFilters, locale]);

  const finalProducts = useMemo(() => {
    let filtered = products?.nodes || [];

    if (filters.texture && filters.texture.length > 0) {
      filtered = filtered.filter(product => {
        return product.variants?.nodes?.some(variant => {
          const hasTextureOption = variant.selectedOptions?.some(option => {
            if (option.name === 'Texture') {
              return filters.texture.includes(option.value);
            }
            return false;
          });
          return hasTextureOption;
        });
      });
    }

    return filtered;
  }, [products, filters.texture]);

  const finalProductsConnection = {
    nodes: finalProducts,
    pageInfo: products?.pageInfo || {}
  };

  const updateFilter = (key, value) => {
    if (key === 'minPrice' || key === 'maxPrice') {
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
      const currentValues = filters[key] || [];

      let cleanValue = value;
      if (key === 'longueur') {
        const cleanVal = value.split(' ')[0];
        const numericVal = cleanVal.replace(/[^0-9]/g, '');
        cleanValue = numericVal;
      }

      let newValues;

      if (currentValues.includes(cleanValue)) {
        newValues = currentValues.filter(v => v !== cleanValue);
      } else {
        newValues = [...currentValues, cleanValue];
      }

      newValues = [...new Set(newValues)];

      const newFilters = { ...filters, [key]: newValues };
      setFilters(newFilters);

      const newSearchParams = new URLSearchParams(searchParams);
      if (newValues.length > 0) {
        newSearchParams.set(key, newValues.join(','));
      } else {
        newSearchParams.delete(key);
      }
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
    if (currentCollectionFilter) {
      newSearchParams.set('collection', currentCollectionFilter);
    }
    setSearchParams(newSearchParams);
  };

  const getCollectionTitle = () => {
    if (selectedCollection) {
      return selectedCollection.title;
    }
    if (currentCollectionFilter) {
      const formattedHandle = currentCollectionFilter
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
      return formattedHandle;
    }
    return locale === 'fr' ? 'NOS PRODUITS CAPILLAIRES' : 'OUR HAIRCARE PRODUCTS';
  };

  const collectionTitle = getCollectionTitle();

  const FilterSection = ({ title, filterKey, options }) => {
    if (!options || options.length === 0) {
      return null;
    }

    return (
        <div className="mb-8">
          <button
              onClick={() => toggleSection(filterKey)}
              className="flex items-center justify-between w-full text-left text-[14.63px] font-poppins font-regular text-[#000000] mb-4"
          >
            <span>{title}</span>
            <span className="text-lg">{expandedSections[filterKey] ? '−' : '+'}</span>
          </button>
          {expandedSections[filterKey] && (
              <div className="space-y-3 ml-0">
                {options.map((option) => (
                    <label
                        key={option.value}
                        className="flex items-center cursor-pointer hover:bg-gray-50 p-1 rounded"
                    >
                      <input
                          type="checkbox"
                          checked={filters[filterKey].includes(option.value)}
                          onChange={() => updateFilter(filterKey, option.value)}
                          className="mr-3 h-4 w-4 text-[#FF7575] focus:ring-[#FF7575] border-gray-300 rounded"
                      />
                      <span className={`text-[14px] font-poppins font-regular ${
                          filters[filterKey].includes(option.value)
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
    );
  };

  // Filter component that can be reused for both mobile and desktop
  const FilterContent = () => (
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

        <FilterSection
            title={locale === 'fr' ? 'Catégorie' : 'Category'}
            filterKey="category"
            options={filterOptions.category}
        />

        <FilterSection
            title={locale === 'fr' ? 'Longueur' : 'Length'}
            filterKey="longueur"
            options={filterOptions.longueur}
        />

        <FilterSection
            title={locale === 'fr' ? 'Texture' : 'Texture'}
            filterKey="texture"
            options={filterOptions.texture}
        />

        <FilterSection
            title={locale === 'fr' ? 'Couleur' : 'Color'}
            filterKey="couleur"
            options={filterOptions.couleur}
        />

        <FilterSection
            title={locale === 'fr' ? 'Tour de tête' : 'Cap Size'}
            filterKey="capSize"
            options={filterOptions.capSize}
        />

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
  );

  return (
      <div className="collection-page min-h-screen bg-white pt-24">
        <div className="container mx-auto px-4 py-8">

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Desktop Filters Sidebar */}
            <div className="hidden lg:block lg:col-span-1">
              <FilterContent />
            </div>

            {/* Products Grid */}
            <div className="lg:col-span-3">
              {/* Mobile Header with Filter Icon */}
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-[24px] lg:text-[32px] font-medium text-gray-900 font-poppins">
                  {collectionTitle}
                </h1>

                {/* Mobile Filter Button */}
                <button
                    onClick={() => setShowMobileFilters(true)}
                    className="lg:hidden flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z" />
                  </svg>
                  <span className="text-sm font-medium">
                    {locale === 'fr' ? 'Filtres' : 'Filters'}
                  </span>
                </button>

                {/* Desktop filter count */}
                <div className="hidden lg:block text-sm text-gray-500">
                  {allProductsForFilters && (
                      <span>
                        {locale === 'fr'
                            ? `${filterOptions.category.length + filterOptions.longueur.length + filterOptions.texture.length + filterOptions.couleur.length + filterOptions.capSize.length} options de filtre disponibles`
                            : `${filterOptions.category.length + filterOptions.longueur.length + filterOptions.texture.length + filterOptions.couleur.length + filterOptions.capSize.length} filter options available`
                        }
                      </span>
                  )}
                </div>
              </div>

              <PaginatedResourceSection
                  connection={finalProductsConnection}
                  resourcesClassName="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
              >
                {({node: product, index}) => {
                  return (
                      <div key={product.id} className="bg-white overflow-hidden hover:shadow-lg transition-shadow">
                        <ProductItem
                            product={product}
                            loading={index < 8 ? 'eager' : undefined}
                            variant="collection"
                            open={open}
                        />
                      </div>
                  )
                }}
              </PaginatedResourceSection>
              {finalProducts.length === 0 && (
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

        {/* Mobile Filter Modal */}
        {showMobileFilters && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden">
              <div className="fixed inset-y-0 left-0 w-full max-w-sm bg-white shadow-xl overflow-y-auto">
                {/* Mobile filter header */}
                <div className="flex items-center justify-between p-6 border-b">
                  <h2 className="text-lg font-semibold">
                    {locale === 'fr' ? 'Filtres' : 'Filters'}
                  </h2>
                  <button
                      onClick={() => setShowMobileFilters(false)}
                      className="p-2 hover:bg-gray-100 rounded-full"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Mobile filter content */}
                <div className="p-0">
                  <FilterContent />
                </div>

                {/* Mobile filter footer */}
                <div className="p-6 border-t bg-white">
                  <button
                      onClick={() => setShowMobileFilters(false)}
                      className="w-full bg-[#542C17] text-white py-3 px-4 rounded-lg font-medium hover:bg-[#442017] transition-colors"
                  >
                    {locale === 'fr' ? 'Appliquer les filtres' : 'Apply Filters'}
                  </button>
                </div>
              </div>
            </div>
        )}
      </div>
  );
}

// Updated queries to include variant information
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
    variants(first: 10) {
      nodes {
        id
        title
        availableForSale  # Keep this
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
    # FIXED: Added metafields at the end with proper closing brace
    metafields(identifiers: [
      {namespace: "custom", key: "product_rating"},
      {namespace: "custom", key: "review_count"}
    ]) {
      key
      value
    }
    tags
    productType
  }
`;

// Collection query to get collection details with products
const COLLECTION_WITH_PRODUCTS_QUERY = `#graphql
  query CollectionWithProducts(
    $handle: String!
    $country: CountryCode
    $language: LanguageCode
    $first: Int
    $last: Int
    $startCursor: String
    $sortKey: ProductCollectionSortKeys  
    $reverse: Boolean   
    $endCursor: String
  ) @inContext(country: $country, language: $language) {
    collection(handle: $handle) {
      id
      title
      handle
      description
      products(
        first: $first
        last: $last
        before: $startCursor
        after: $endCursor
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
  }
  ${COLLECTION_ITEM_FRAGMENT}
`;

// Query to get all products from a collection for filter generation
const COLLECTION_ALL_PRODUCTS_QUERY = `#graphql
  query CollectionAllProducts(
    $handle: String!
    $country: CountryCode
    $language: LanguageCode
    $first: Int
    $sortKey: ProductCollectionSortKeys 
    $reverse: Boolean   
  ) @inContext(country: $country, language: $language) {
    collection(handle: $handle) {
      id
      title
      products(first: $first 
               sortKey: $sortKey     
                reverse: $reverse) {
        nodes {
          ...CollectionItem
        }
      }
    }
  }
  ${COLLECTION_ITEM_FRAGMENT}
`;

// Query to get all products for filter generation
const ALL_PRODUCTS_FOR_FILTERS_QUERY = `#graphql
  query AllProductsForFilters(
    $country: CountryCode
    $language: LanguageCode
    $first: Int
  ) @inContext(country: $country, language: $language) {
    products(first: $first) {
      nodes {
        ...CollectionItem
      }
    }
  }
  ${COLLECTION_ITEM_FRAGMENT}
`;

const ALL_PRODUCTS_QUERY = `#graphql
  query AllProducts(
    $country: CountryCode
    $language: LanguageCode
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