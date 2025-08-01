import {useLoaderData, useSearchParams} from '@remix-run/react';
import {getPaginationVariables} from '@shopify/hydrogen';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';
import {ProductItem} from '~/components/ProductItem';
import {useLocale} from "~/hooks/useLocale.js";
import {useTranslation} from "~/lib/i18n.js";
import {useState, useEffect, useMemo} from "react";

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
    // If filtering by collection, use collection-specific query
    try {
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

      // Also fetch all products from this collection for filter options (without pagination)
      const allCollectionProducts = await storefront.query(COLLECTION_ALL_PRODUCTS_QUERY, {
        variables: {
          handle: collectionHandle,
          country: 'FR',
          language: 'FR',
          first: 250 // Get more products for filter generation
        },
      });
      allProductsForFilters = allCollectionProducts.collection?.products?.nodes || [];

    } catch (error) {
      console.error('Error fetching collection:', error);
      // Fallback to regular products query
      products = { nodes: [], pageInfo: {} };
    }
  } else {
    // Regular products query with other filters
    const queryParts = [];

    // Handle category filter (can be multiple)
    if (searchParams.get('category') && searchParams.get('category') !== '') {
      const categories = searchParams.get('category').split(',');
      const categoryQueries = categories.map(cat => `product_type:"${cat}"`);
      if (categoryQueries.length > 0) {
        queryParts.push(`(${categoryQueries.join(' OR ')})`);
      }
    }

    // Handle variant filters dynamically
    const variantFilters = ['longueur', 'texture', 'couleur', 'capSize'];
    variantFilters.forEach(filterKey => {
      if (searchParams.get(filterKey) && searchParams.get(filterKey) !== '') {
        const values = searchParams.get(filterKey).split(',');
        const valueQueries = values.map(val => {
          // For variant-based filters, we need to search in variant titles and option values
          return `(variants.title:"${val}" OR tag:"${val}")`;
        });
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

    // Regular products query
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

    // Also fetch all products for filter generation
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

    // Extract from variants
    if (product.variants && product.variants.nodes) {
      product.variants.nodes.forEach(variant => {
        // Check variant options
        if (variant.selectedOptions) {
          variant.selectedOptions.forEach(option => {
            const optionName = option.name.toLowerCase();
            const optionValue = option.value;

            // Map option names to our filter categories
            if (optionName.includes('longueur') || optionName.includes('length')) {
              optionSets.longueur.add(optionValue);
            } else if (optionName.includes('texture')) {
              optionSets.texture.add(optionValue);
            } else if (optionName.includes('couleur') || optionName.includes('color') || optionName.includes('colour')) {
              optionSets.couleur.add(optionValue);
            } else if (optionName.includes('cap') || optionName.includes('taille') || optionName.includes('size')) {
              optionSets.capSize.add(optionValue);
            }
          });
        }

        // Also check variant title for common patterns
        if (variant.title && variant.title !== 'Default Title') {
          const title = variant.title.toLowerCase();

          // Extract length patterns (e.g., "16\"", "20 inches")
          const lengthMatch = title.match(/(\d+)["'']|(\d+)\s*inch/i);
          if (lengthMatch) {
            const length = lengthMatch[1] || lengthMatch[2];
            optionSets.longueur.add(`${length}"`);
          }

          // Extract common texture patterns
          if (title.includes('straight') || title.includes('lisse')) optionSets.texture.add(locale === 'fr' ? 'Lisse' : 'Straight');
          if (title.includes('wavy') || title.includes('ondulé')) optionSets.texture.add(locale === 'fr' ? 'Ondulé' : 'Wavy');
          if (title.includes('curly') || title.includes('bouclé')) optionSets.texture.add(locale === 'fr' ? 'Bouclé' : 'Curly');
          if (title.includes('kinky') || title.includes('crépu')) optionSets.texture.add(locale === 'fr' ? 'Crépu' : 'Kinky');
        }
      });
    }

    // Extract from tags as fallback
    if (product.tags) {
      product.tags.forEach(tag => {
        const tagLower = tag.toLowerCase();

        // Length tags
        if (tagLower.match(/\d+["'']/)) {
          optionSets.longueur.add(tag);
        }

        // Texture tags
        if (['straight', 'lisse', 'wavy', 'ondulé', 'curly', 'bouclé', 'kinky', 'crépu'].some(texture =>
            tagLower.includes(texture))) {
          optionSets.texture.add(tag);
        }

        // Color tags
        if (['black', 'noir', 'brown', 'brun', 'blonde', 'châtain', 'auburn'].some(color =>
            tagLower.includes(color))) {
          optionSets.couleur.add(tag);
        }

        // Size tags
        if (['small', 'petit', 'medium', 'moyen', 'large', 'grand'].some(size =>
            tagLower.includes(size))) {
          optionSets.capSize.add(tag);
        }
      });
    }
  });

  // Convert sets to sorted arrays with proper formatting
  return {
    category: Array.from(optionSets.category).sort(),
    longueur: Array.from(optionSets.longueur).sort((a, b) => {
      // Sort by numeric value for lengths
      const aNum = parseInt(a.replace(/[^0-9]/g, ''));
      const bNum = parseInt(b.replace(/[^0-9]/g, ''));
      return aNum - bNum;
    }),
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
      // Fallback to static options if no products available
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
    // Keep the collection filter when clearing other filters
    const newSearchParams = new URLSearchParams();
    if (currentCollectionFilter) {
      newSearchParams.set('collection', currentCollectionFilter);
    }
    setSearchParams(newSearchParams);
  };

  // Determine the collection title
  const getCollectionTitle = () => {
    if (selectedCollection) {
      return selectedCollection.title;
    }
    if (currentCollectionFilter) {
      // Fallback title based on handle
      const formattedHandle = currentCollectionFilter
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
      return formattedHandle;
    }
    return locale === 'fr' ? 'NOS PRODUITS CAPILLAIRES' : 'OUR HAIRCARE PRODUCTS';
  };

  const collectionTitle = getCollectionTitle();

  // Component to render filter section
  const FilterSection = ({ title, filterKey, options }) => (
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
              {options.length === 0 && (
                  <p className="text-sm text-gray-500 italic">
                    {locale === 'fr' ? 'Aucune option disponible' : 'No options available'}
                  </p>
              )}
            </div>
        )}
      </div>
  );

  return (
      <div className="collection-page min-h-screen bg-white pt-24">
        <div className="container mx-auto px-4 py-8">
          {/* Collection Filter Display */}
          {currentCollectionFilter && (
              <div className="mb-6">
                <div className="flex items-center justify-between bg-gray-50 px-4 py-3 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-gray-600">
                      {locale === 'fr' ? 'Collection filtrée:' : 'Filtered by collection:'}
                    </span>
                    <span className="bg-[#542C17] text-white px-3 py-1 rounded-full text-sm font-medium">
                      {selectedCollection?.title || currentCollectionFilter}
                    </span>
                  </div>
                  <button
                      onClick={() => {
                        const newSearchParams = new URLSearchParams(searchParams);
                        newSearchParams.delete('collection');
                        setSearchParams(newSearchParams);
                      }}
                      className="text-gray-500 hover:text-gray-700 text-sm"
                  >
                    {locale === 'fr' ? 'Supprimer le filtre' : 'Remove filter'}
                  </button>
                </div>
              </div>
          )}

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

                {/* Dynamic Filter Sections */}
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

                {/* Price Filter - Keep static as requested */}
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
                <div className="text-sm text-gray-500">
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
                  connection={products}
                  resourcesClassName="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
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