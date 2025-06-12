import {redirect} from '@shopify/remix-oxygen';
import {useLoaderData} from '@remix-run/react';
import {getPaginationVariables, Analytics} from '@shopify/hydrogen';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {ProductItem} from '~/components/ProductItem';

/**
 * @type {MetaFunction<typeof loader>}
 */
export const meta = ({data}) => {
  return [{title: `Zuri | ${data?.collection.title ?? ''} Collection`}];
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
 */
async function loadCriticalData({ context, params, request }) {
    const { handle } = params;
    const { storefront } = context;
    const url = new URL(request.url);
    const searchParams = url.searchParams;
    const paginationVariables = getPaginationVariables(request, {
        pageBy: 8,
    });

    if (!handle) {
        throw redirect('/collections');
    }

    // Build filters from search params
    const filters = [];

    if (searchParams.get('category') && searchParams.get('category') !== '') {
        filters.push(`product_type:${searchParams.get('category')}`);
    }

    if (searchParams.get('color') && searchParams.get('color') !== '') {
        filters.push(`tag:${searchParams.get('color')}`);
    }

    if (searchParams.get('scent') && searchParams.get('scent') !== '') {
        filters.push(`tag:${searchParams.get('scent')}`);
    }

    if (searchParams.get('length') && searchParams.get('length') !== '') {
        filters.push(`tag:${searchParams.get('length')}`);
    }

    if (searchParams.get('laceSize') && searchParams.get('laceSize') !== '') {
        filters.push(`tag:${searchParams.get('laceSize')}`);
    }

    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');

    if (minPrice || maxPrice) {
        const priceFilter = `variants.price:${minPrice || '0'}-${maxPrice || '9999'}`;
        filters.push(priceFilter);
    }

    const sortKey = searchParams.get('sortKey') || 'COLLECTION_DEFAULT';
    const reverse = searchParams.get('reverse') === 'true';

    const [{collection}] = await Promise.all([
        storefront.query(COLLECTION_QUERY, {
            variables: {
                handle,
                filters,
                sortKey,
                reverse,
                ...paginationVariables
            },
        }),
    ]);

    if (!collection) {
        throw new Response(`Collection ${handle} not found`, {
            status: 404,
        });
    }

    // The API handle might be localized, so redirect to the localized handle
    redirectIfHandleIsLocalized(request, {handle, data: collection});

    return {
        collection,
        products: collection.products, // ✅ Add this line - expose products directly
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
    const { collection } = useLoaderData();
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

    return (
        <div className="collection-page min-h-screen bg-white pt-24">
            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Filters Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-white border rounded-lg p-6 sticky top-24">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-medium text-gray-900">
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
                            <div className="mb-6 border-b border-gray-200 pb-4">
                                <button
                                    onClick={() => toggleSection('category')}
                                    className="flex items-center justify-between w-full text-left text-gray-900 font-medium mb-3"
                                >
                                    <span>{locale === 'fr' ? 'Catégorie' : 'Category'}</span>
                                    <span className="text-lg">{expandedSections.category ? '−' : '+'}</span>
                                </button>
                                {expandedSections.category && (
                                    <div className="space-y-2">
                                        {filterOptions.category.map((option) => (
                                            <label key={option.value} className="flex items-center">
                                                <input
                                                    type="radio"
                                                    name="category"
                                                    value={option.value}
                                                    checked={filters.category === option.value}
                                                    onChange={(e) => updateFilter('category', e.target.value)}
                                                    className="mr-3 text-red-500"
                                                />
                                                <span className="text-sm text-gray-700">{option.label}</span>
                                                {filters.category === option.value && (
                                                    <span className="ml-2 text-red-500">✓</span>
                                                )}
                                            </label>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Color Filter */}
                            <div className="mb-6 border-b border-gray-200 pb-4">
                                <button
                                    onClick={() => toggleSection('color')}
                                    className="flex items-center justify-between w-full text-left text-gray-900 font-medium mb-3"
                                >
                                    <span>{locale === 'fr' ? 'Couleur' : 'Color'}</span>
                                    <span className="text-lg">{expandedSections.color ? '−' : '+'}</span>
                                </button>
                                {expandedSections.color && (
                                    <div className="space-y-2">
                                        {filterOptions.color.map((option) => (
                                            <label key={option.value} className="flex items-center">
                                                <input
                                                    type="radio"
                                                    name="color"
                                                    value={option.value}
                                                    checked={filters.color === option.value}
                                                    onChange={(e) => updateFilter('color', e.target.value)}
                                                    className="mr-3"
                                                />
                                                <span className="text-sm text-gray-700">{option.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Scent Filter */}
                            <div className="mb-6 border-b border-gray-200 pb-4">
                                <button
                                    onClick={() => toggleSection('scent')}
                                    className="flex items-center justify-between w-full text-left text-gray-900 font-medium mb-3"
                                >
                                    <span>{locale === 'fr' ? 'Parfum' : 'Scent'}</span>
                                    <span className="text-lg">{expandedSections.scent ? '−' : '+'}</span>
                                </button>
                                {expandedSections.scent && (
                                    <div className="space-y-2">
                                        {filterOptions.scent.map((option) => (
                                            <label key={option.value} className="flex items-center">
                                                <input
                                                    type="radio"
                                                    name="scent"
                                                    value={option.value}
                                                    checked={filters.scent === option.value}
                                                    onChange={(e) => updateFilter('scent', e.target.value)}
                                                    className="mr-3"
                                                />
                                                <span className="text-sm text-gray-700">{option.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Length Filter */}
                            <div className="mb-6 border-b border-gray-200 pb-4">
                                <button
                                    onClick={() => toggleSection('length')}
                                    className="flex items-center justify-between w-full text-left text-gray-900 font-medium mb-3"
                                >
                                    <span>{locale === 'fr' ? 'Longueur' : 'Length'}</span>
                                    <span className="text-lg">{expandedSections.length ? '−' : '+'}</span>
                                </button>
                                {expandedSections.length && (
                                    <div className="space-y-2">
                                        {filterOptions.length.map((option) => (
                                            <label key={option.value} className="flex items-center">
                                                <input
                                                    type="radio"
                                                    name="length"
                                                    value={option.value}
                                                    checked={filters.length === option.value}
                                                    onChange={(e) => updateFilter('length', e.target.value)}
                                                    className="mr-3"
                                                />
                                                <span className="text-sm text-gray-700">{option.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Lace Size Filter */}
                            <div className="mb-6 border-b border-gray-200 pb-4">
                                <button
                                    onClick={() => toggleSection('laceSize')}
                                    className="flex items-center justify-between w-full text-left text-gray-900 font-medium mb-3"
                                >
                                    <span>{locale === 'fr' ? 'Taille de Dentelle' : 'Lace Size'}</span>
                                    <span className="text-lg">{expandedSections.laceSize ? '−' : '+'}</span>
                                </button>
                                {expandedSections.laceSize && (
                                    <div className="space-y-2">
                                        {filterOptions.laceSize.map((option) => (
                                            <label key={option.value} className="flex items-center">
                                                <input
                                                    type="radio"
                                                    name="laceSize"
                                                    value={option.value}
                                                    checked={filters.laceSize === option.value}
                                                    onChange={(e) => updateFilter('laceSize', e.target.value)}
                                                    className="mr-3"
                                                />
                                                <span className="text-sm text-gray-700">{option.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Price Filter */}
                            <div className="mb-6">
                                <button
                                    onClick={() => toggleSection('price')}
                                    className="flex items-center justify-between w-full text-left text-gray-900 font-medium mb-3"
                                >
                                    <span>{locale === 'fr' ? 'Prix' : 'Price'}</span>
                                    <span className="text-lg">{expandedSections.price ? '−' : '+'}</span>
                                </button>
                                {expandedSections.price && (
                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-sm text-gray-700 mb-1">
                                                {locale === 'fr' ? 'Prix minimum' : 'Min Price'}
                                            </label>
                                            <input
                                                type="number"
                                                name={"price"}
                                                value={filters.minPrice}
                                                onChange={(e) => updateFilter('minPrice', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                                placeholder="0"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm text-gray-700 mb-1">
                                                {locale === 'fr' ? 'Prix maximum' : 'Max Price'}
                                            </label>
                                            <input
                                                type="number"
                                                name={"maxprice"}
                                                value={filters.maxPrice}
                                                onChange={(e) => updateFilter('maxPrice', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
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
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 font-poppins mb-2">
                                    {collection.title}
                                </h1>
                                {collection.description && (
                                    <p className="text-gray-600 collection-description">
                                        {collection.description}
                                    </p>
                                )}
                            </div>
                            <button className="p-2 text-gray-600 hover:text-gray-900">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </button>
                        </div>



                        {!collection?.products?.nodes?.length && (
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

            <Analytics.CollectionView
                data={{
                    collection: {
                        id: collection.id,
                        handle: collection.handle,
                    },
                }}
            />
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
    tags
    productType
  }
`;

const COLLECTION_QUERY = `#graphql
  query Collection(
    $handle: String!
    $country: CountryCode
    $language: LanguageCode
    $filters: [ProductFilter!]
    $sortKey: ProductCollectionSortKeys
    $reverse: Boolean
    $first: Int
    $last: Int
    $startCursor: String
    $endCursor: String
  ) @inContext(country: $country, language: $language) {
    collection(handle: $handle) {
      id
      title
      description
      handle
      products(
        first: $first
        last: $last
        before: $startCursor
        after: $endCursor
        filters: $filters
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

/** @typedef {import('@shopify/remix-oxygen').LoaderFunctionArgs} LoaderFunctionArgs */
/** @template T @typedef {import('@remix-run/react').MetaFunction<T>} MetaFunction */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
