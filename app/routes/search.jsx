import {useLoaderData, Link, useNavigation} from '@remix-run/react';
import {getPaginationVariables, Analytics} from '@shopify/hydrogen';
import {SearchForm} from '~/components/SearchForm';
import { useLocale } from '~/hooks/useLocale';
import { memo, useMemo, useCallback } from 'react';

export const meta = () => {
  return [{title: `Zuri | Search`}];
};

// Translation mapping for French ↔ English
const SEARCH_TRANSLATIONS = {
  'texture': ['texture', 'feel', 'touch'],
  'lisse': ['smooth', 'straight', 'sleek'],
  'bouclé': ['curly', 'curls', 'wavy'],
  'ondulé': ['wavy', 'waves', 'loose curls'],
  'crépu': ['kinky', 'coily', 'afro'],

  // Length translations (longueur)
  'longueur': ['length', 'size', 'long'],
  'court': ['short', 'bob', 'pixie'],
  'moyen_longueur': ['medium', 'mid', 'shoulder'],
  'long': ['long', 'lengthy'],

  // Density translations (densité)
  'densité': ['density', 'thickness', 'volume'],
  'léger': ['light', 'thin', 'fine'],
  'moyen_densité': ['medium', 'normal', 'standard'],
  'épais': ['thick', 'dense', 'heavy', 'full'],

  // Color translations (couleur)
  'couleur': ['color', 'colour', 'shade'],
  'noir': ['black', 'dark'],
  'brun': ['brown', 'brunette'],
  'blond': ['blonde', 'yellow', 'light'],
  'châtain': ['chestnut', 'brown', 'hazel'],
  'auburn': ['auburn', 'reddish'],
  'rouge': ['red', 'ginger'],

  // Lace type translations (type de lace)
  'lace': ['lace', 'front', 'closure'],
  'frontale': ['frontal', 'front', 'hairline'],
  'closure': ['closure', 'top', 'crown'],
  '360': ['360', 'full', 'around'],
  'full lace': ['full lace', 'complete', 'all around'],

  // Baby hair translations (type de baby hair)
  'baby hair': ['baby hair', 'hairline', 'edges'],
  'naturel': ['natural', 'realistic', 'real'],
  'pré-plumé': ['pre-plucked', 'plucked', 'ready'],
  'sans': ['without', 'no', 'none'],

  // General wig terms
  'perruque': ['wig', 'hair', 'hairpiece'],
  'cheveux': ['hair', 'strands'],
  'humain': ['human', 'real', 'natural'],
  'synthétique': ['synthetic', 'artificial', 'fake'],
  'remy': ['remy', 'quality', 'premium'],
  'virgin': ['virgin', 'unprocessed', 'raw']
};

// Function to expand search terms with translations
function expandSearchTerms(searchTerm) {
  const terms = [searchTerm.toLowerCase()];
  const words = searchTerm.toLowerCase().split(' ');

  // Add individual words
  terms.push(...words);

  // Add translations for each word
  words.forEach(word => {
    Object.entries(SEARCH_TRANSLATIONS).forEach(([key, translations]) => {
      if (key.includes(word) || translations.some(t => t.includes(word))) {
        terms.push(key, ...translations);
      }
    });
  });

  // Remove duplicates and empty strings
  return [...new Set(terms.filter(term => term.length > 1))];
}

// Enhanced GraphQL query with more searchable fields
const ENHANCED_SEARCH_PRODUCT_FRAGMENT = `#graphql
  fragment EnhancedSearchProduct on Product {
    __typename
    handle
    id
    publishedAt
    title
    description
    productType
    vendor
    tags
    trackingParameters
    options {
      name
      optionValues {
        name
      }
    }
    metafields(identifiers: [
      {namespace: "custom", key: "texture"}
      {namespace: "custom", key: "longueur"}
      {namespace: "custom", key: "densite"}
      {namespace: "custom", key: "couleur"}
      {namespace: "custom", key: "type_lace"}
      {namespace: "custom", key: "baby_hair"}
      {namespace: "custom", key: "material"}
      {namespace: "custom", key: "style"}
    ]) {
      namespace
      key
      value
    }
    selectedOrFirstAvailableVariant(
      selectedOptions: []
      ignoreUnknownOptions: true
      caseInsensitiveMatch: true
    ) {
      id
      title
      image {
        url
        altText
        width
        height
      }
      price {
        amount
        currencyCode
      }
      compareAtPrice {
        amount
        currencyCode
      }
      selectedOptions {
        name
        value
      }
      product {
        handle
        title
      }
    }
    variants(first: 10) {
      nodes {
        id
        title
        selectedOptions {
          name
          value
        }
      }
    }
  }
`;

// Enhanced search query that searches multiple fields
const ENHANCED_SEARCH_QUERY = `#graphql
  query EnhancedSearch(
    $country: CountryCode
    $endCursor: String
    $first: Int
    $language: LanguageCode
    $last: Int
    $term: String!
    $startCursor: String
  ) @inContext(country: $country, language: $language) {
    products: search(
      after: $endCursor,
      before: $startCursor,
      first: $first,
      last: $last,
      query: $term,
      sortKey: RELEVANCE,
      types: [PRODUCT],
      unavailableProducts: HIDE,
    ) {
      nodes {
        ...on Product {
          ...EnhancedSearchProduct
        }
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
    articles: search(
      query: $term,
      types: [ARTICLE],
      first: $first,
    ) {
      nodes {
        ...on Article {
          __typename
          handle
          id
          title
          trackingParameters
          blog {
            handle
          }
        }
      }
    }
    pages: search(
      query: $term,
      types: [PAGE],
      first: $first,
    ) {
      nodes {
        ...on Page {
          __typename
          handle
          id
          title
          trackingParameters
        }
      }
    }
  }
  ${ENHANCED_SEARCH_PRODUCT_FRAGMENT}
`;

// Build comprehensive search query
function buildSearchQuery(originalTerm) {
  const expandedTerms = expandSearchTerms(originalTerm);

  // Create a broader query that searches in multiple fields
  const searchParts = [];

  // Use wildcards for broader matching
  const terms = [originalTerm, ...expandedTerms];

  terms.forEach(term => {
    // Add different search patterns for better coverage
    searchParts.push(`title:*${term}*`);
    searchParts.push(`description:*${term}*`);
    searchParts.push(`tag:${term}`);
    searchParts.push(`product_type:*${term}*`);
    searchParts.push(`vendor:*${term}*`);

    // Also search without wildcards for exact matches
    searchParts.push(`title:${term}`);
    searchParts.push(`tag:${term}`);
  });

  // Join with OR operator for broader results
  const query = searchParts.join(' OR ');
  console.log('Built search query:', query);
  return query;
}

export async function loader({request, context}) {
  const url = new URL(request.url);
  const originalTerm = String(url.searchParams.get('q') || '').trim();

  if (!originalTerm) {
    return {
      type: 'regular',
      term: '',
      error: null,
      result: { total: 0, items: { articles: { nodes: [] }, pages: { nodes: [] }, products: { nodes: [] } } }
    };
  }

  try {
    const {storefront} = context;
    const variables = getPaginationVariables(request, {pageBy: 32}); // Increased for better performance

    // Try multiple search strategies
    const expandedTerms = expandSearchTerms(originalTerm);
    console.log('Expanded search terms:', expandedTerms);

    // First try: Enhanced search with translations
    const enhancedQuery = buildSearchQuery(originalTerm);
    console.log('Enhanced search query:', enhancedQuery);

    let searchResult = await storefront.query(ENHANCED_SEARCH_QUERY, {
      variables: {...variables, term: enhancedQuery},
    });

    // If enhanced search returns few results, try simpler searches
    const enhancedTotal = Object.values(searchResult).reduce(
        (acc, section) => acc + (section?.nodes?.length || 0), 0
    );

    console.log('Enhanced search found:', enhancedTotal, 'results');

    // If we got less than 3 results, try broader searches
    if (enhancedTotal < 3) {
      console.log('Trying broader search...');

      // Try simple term search
      const simpleResult = await storefront.query(ENHANCED_SEARCH_QUERY, {
        variables: {...variables, term: originalTerm},
      });

      // Try each expanded term individually
      for (const term of expandedTerms.slice(0, 5)) {
        if (term !== originalTerm.toLowerCase()) {
          const termResult = await storefront.query(ENHANCED_SEARCH_QUERY, {
            variables: {...variables, term: term},
          });

          // Merge results (avoid duplicates)
          if (termResult.products?.nodes) {
            const existingIds = new Set(searchResult.products.nodes.map(p => p.id));
            const newProducts = termResult.products.nodes.filter(p => !existingIds.has(p.id));
            searchResult.products.nodes.push(...newProducts);
          }
        }
      }
    }

    const {errors, ...items} = searchResult;

    if (!items) {
      throw new Error('No search data returned from Shopify API');
    }

    const total = Object.values(items).reduce(
        (acc, {nodes}) => acc + (nodes?.length || 0),
        0,
    );

    const error = errors ? errors.map(({message}) => message).join(', ') : undefined;

    console.log('Final search results:', {
      total,
      products: items.products?.nodes?.length || 0,
      articles: items.articles?.nodes?.length || 0,
      pages: items.pages?.nodes?.length || 0
    });

    return {
      type: 'regular',
      term: originalTerm,
      searchQuery: enhancedQuery,
      expandedTerms,
      error,
      result: {total, items}
    };
  } catch (err) {
    console.error('Search error:', err);
    return {
      type: 'regular',
      term: originalTerm,
      error: err.message,
      result: { total: 0, items: { articles: { nodes: [] }, pages: { nodes: [] }, products: { nodes: [] } } }
    };
  }
}

// Memoized Product Card Component for better performance
const ProductCard = memo(({ product, expandedTerms, locale }) => {
  const variant = product.selectedOrFirstAvailableVariant;
  const image = variant?.image;
  const price = variant?.price;

  // Memoized metafield getter
  const getMetafield = useCallback((key) => {
    return product.metafields?.find(m => m && m.key === key)?.value || '';
  }, [product.metafields]);

  // Memoized product attributes
  const attributes = useMemo(() => ({
    texture: getMetafield('texture'),
    longueur: getMetafield('longueur'),
    densite: getMetafield('densite'),
    couleur: getMetafield('couleur'),
    typeLace: getMetafield('type_lace'),
    babyHair: getMetafield('baby_hair'),
  }), [getMetafield]);

  // Memoized highlight function
  const highlightSearchTerms = useCallback((text) => {
    if (!text || !expandedTerms?.length) return text;

    let highlightedText = text;
    expandedTerms.forEach(term => {
      const regex = new RegExp(`(${term})`, 'gi');
      highlightedText = highlightedText.replace(regex, '<mark class="bg-yellow-200">$1</mark>');
    });

    return highlightedText;
  }, [expandedTerms]);

  return (
      <div className="bg-white border rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300 group">
        {image && (
            <div className="aspect-square bg-gray-100 overflow-hidden">
              <img
                  src={image.url}
                  alt={image.altText || product.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
              />
            </div>
        )}
        <div className="p-3 sm:p-4">
          <h3
              className="font-medium text-sm sm:text-base lg:text-lg mb-2 line-clamp-2 leading-tight"
              dangerouslySetInnerHTML={{
                __html: highlightSearchTerms(product.title)
              }}
          />
          <p className="text-gray-600 text-xs sm:text-sm mb-2">{product.vendor}</p>

          {/* Product attributes - Responsive */}
          <div className="text-xs text-gray-600 mb-3 space-y-1">
            {attributes.texture && (
                <p><strong>{locale === 'fr' ? 'Texture :' : 'Texture:'}</strong> {attributes.texture}</p>
            )}
            {attributes.longueur && (
                <p><strong>{locale === 'fr' ? 'Longueur :' : 'Length:'}</strong> {attributes.longueur}</p>
            )}
            {attributes.densite && (
                <p><strong>{locale === 'fr' ? 'Densité :' : 'Density:'}</strong> {attributes.densite}</p>
            )}
            {attributes.couleur && (
                <p><strong>{locale === 'fr' ? 'Couleur :' : 'Color:'}</strong> {attributes.couleur}</p>
            )}
            {attributes.typeLace && (
                <p><strong>{locale === 'fr' ? 'Type de lace :' : 'Lace type:'}</strong> {attributes.typeLace}</p>
            )}
            {attributes.babyHair && (
                <p><strong>{locale === 'fr' ? 'Baby hair :' : 'Baby hair:'}</strong> {attributes.babyHair}</p>
            )}
          </div>

          {/* Tags - Responsive */}
          {product.tags && product.tags.length > 0 && (
              <div className="mb-3">
                <div className="flex flex-wrap gap-1">
                  {product.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="px-2 py-1 bg-gray-100 text-xs rounded">
                  {tag}
                </span>
                  ))}
                </div>
              </div>
          )}

          {price && (
              <p className="text-base sm:text-lg font-semibold text-[#8B4513] mb-3">
                {price.currencyCode === 'EUR' ? '€' : '$'}
                {parseFloat(price.amount).toFixed(2)}
              </p>
          )}
          <Link
              to={`/products/${product.handle}`}
              className="block w-full text-center px-3 py-2 sm:px-4 sm:py-2 bg-[#8B4513] text-white rounded hover:bg-[#7a3d0f] transition-colors duration-200 text-sm sm:text-base"
          >
            {locale === 'fr' ? 'Voir le produit' : 'View Product'}
          </Link>
        </div>
      </div>
  );
});

// Memoized Search Suggestions Component
const SearchSuggestions = memo(({ locale, inputRef }) => {
  const suggestions = useMemo(() =>
          locale === 'fr'
              ? ['lisse', 'bouclé', 'long', 'court', 'noir', 'blond', 'lace frontale', 'closure', 'densité épaisse']
              : ['smooth', 'curly', 'long', 'short', 'black', 'blonde', 'frontal lace', 'closure', 'thick density'],
      [locale]
  );

  const handleSuggestionClick = useCallback((suggestion) => {
    if (inputRef.current) {
      inputRef.current.value = suggestion;
      inputRef.current.form?.requestSubmit();
    }
  }, [inputRef]);

  return (
      <div className="text-sm text-gray-600">
        <p className="mb-2">{locale === 'fr' ? 'Essayez de rechercher :' : 'Try searching for:'}</p>
        <div className="flex flex-wrap gap-2">
          {suggestions.map(suggestion => (
              <button
                  key={suggestion}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-xs transition-colors duration-200"
              >
                {suggestion}
              </button>
          ))}
        </div>
      </div>
  );
});

// Product Grid Skeleton for better loading experience
const ProductGridSkeleton = memo(() => (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-6">
      {Array.from({ length: 12 }).map((_, index) => (
          <div key={index} className="bg-white border rounded-lg overflow-hidden animate-pulse">
            <div className="aspect-square bg-gray-200"></div>
            <div className="p-3 sm:p-4">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded mb-2 w-2/3"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
            </div>
          </div>
      ))}
    </div>
));

// Main Search Page Component
export default function SearchPage() {
  const {type, term, result, error, searchQuery, expandedTerms} = useLoaderData();
  const [locale] = useLocale();
  const navigation = useNavigation();

  // Check if we're currently searching
  const isSearching = navigation.state === 'loading' && navigation.location?.search.includes('q=');

  // Memoized data extraction
  const searchData = useMemo(() => ({
    products: result?.items?.products?.nodes || [],
    articles: result?.items?.articles?.nodes || [],
    pages: result?.items?.pages?.nodes || [],
    total: result?.total || 0
  }), [result]);

  console.log('Search terms used:', expandedTerms);
  console.log('Products found:', searchData.products);

  // Memoized translations
  const translations = useMemo(() => ({
    searchTitle: locale === 'fr' ? 'Recherche' : 'Search',
    searchPlaceholder: locale === 'fr'
        ? 'Rechercher par texture, longueur, densité, couleur, type de lace...'
        : 'Search by texture, length, density, color, lace type...',
    searchButton: locale === 'fr' ? 'Rechercher' : 'Search',
    foundResults: locale === 'fr' ? 'Trouvé' : 'Found',
    resultsFor: locale === 'fr' ? 'résultats pour' : 'results for',
    products: locale === 'fr' ? 'Produits' : 'Products',
    articles: locale === 'fr' ? 'Articles' : 'Articles',
    pages: locale === 'fr' ? 'Pages' : 'Pages',
    noResultsFound: locale === 'fr' ? 'Aucun résultat trouvé' : 'No results found',
    noResultsText: locale === 'fr'
        ? 'Essayez de rechercher des termes de texture, longueur, densité, couleur ou type de lace.'
        : 'Try searching for texture, length, density, color, or lace type terms.',
    examples: locale === 'fr' ? 'Exemples :' : 'Examples:',
    startSearch: locale === 'fr' ? 'Commencez votre recherche' : 'Start your search',
    startSearchText: locale === 'fr'
        ? 'Recherchez par texture, longueur, densité, couleur, type de lace, et plus encore.'
        : 'Search by texture, length, density, color, lace type, and more.',
    readArticle: locale === 'fr' ? 'Lire l\'article →' : 'Read Article →',
    viewPage: locale === 'fr' ? 'Voir la page →' : 'View Page →',
    error: locale === 'fr' ? 'Erreur :' : 'Error:'
  }), [locale]);

  return (
      <div className="min-h-screen pt-16 sm:pt-20 md:pt-24 px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header - Responsive */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light font-poppins text-[#002F45] mb-4 sm:mb-6 text-center sm:text-left mt-4 sm:mt-0">
              {translations.searchTitle}
            </h1>

            {/* Search Form - Responsive */}
            <SearchForm>
              {({inputRef}) => (
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                      <input
                          defaultValue={term || ''}
                          name="q"
                          placeholder={translations.searchPlaceholder}
                          ref={inputRef}
                          type="search"
                          className="flex-1 px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B4513] text-sm sm:text-base"
                      />
                      <button
                          type="submit"
                          disabled={isSearching}
                          className="px-4 py-2 sm:px-6 sm:py-3 bg-[#8B4513] text-white rounded-lg hover:bg-[#7a3d0f] transition-colors duration-200 font-medium text-sm sm:text-base whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {isSearching && (
                            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        )}
                        {isSearching ? (locale === 'fr' ? 'Recherche...' : 'Searching...') : translations.searchButton}
                      </button>
                    </div>

                    {/* Search Suggestions - Responsive */}
                    <SearchSuggestions locale={locale} inputRef={inputRef} />
                  </div>
              )}
            </SearchForm>
          </div>

          {/* Loading State - Show when searching */}
          {isSearching && (
              <div className="flex items-center justify-center py-8 sm:py-12">
                <div className="flex flex-col items-center gap-4">
                  <div className="relative">
                    <div className="w-8 h-8 sm:w-12 sm:h-12 border-4 border-[#8B4513] border-t-transparent rounded-full animate-spin"></div>
                  </div>
                  <p className="text-gray-600 text-sm sm:text-base font-medium">
                    {locale === 'fr' ? 'Recherche en cours...' : 'Searching...'}
                  </p>
                </div>
              </div>
          )}

          {/* Results Summary - Responsive */}
          {term && !isSearching && (
              <div className="mb-4 sm:mb-6">
                <p className="text-base sm:text-lg text-gray-600 text-center sm:text-left">
                  {translations.foundResults} <strong>{searchData.total}</strong> {translations.resultsFor} <strong>"{term}"</strong>
                </p>
              </div>
          )}

          {/* Error Display - Responsive */}
          {error && (
              <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm sm:text-base">{translations.error} {error}</p>
              </div>
          )}

          {/* Enhanced Products Display - Responsive Grid */}
          {!isSearching && searchData.products.length > 0 && (
              <section className="mb-8 sm:mb-12">
                <h2 className="text-xl sm:text-2xl font-medium text-[#002F45] mb-4 sm:mb-6 pb-2 border-b text-center sm:text-left">
                  {translations.products} ({searchData.products.length})
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-6">
                  {searchData.products.map((product, index) => (
                      <ProductCard
                          key={product.id}
                          product={product}
                          expandedTerms={expandedTerms}
                          locale={locale}
                      />
                  ))}
                </div>
              </section>
          )}

          {/* Articles Section - Responsive */}
          {!isSearching && searchData.articles.length > 0 && (
              <section className="mb-8 sm:mb-12">
                <h2 className="text-xl sm:text-2xl font-medium text-[#002F45] mb-4 sm:mb-6 pb-2 border-b text-center sm:text-left">
                  {translations.articles} ({searchData.articles.length})
                </h2>
                <div className="space-y-3 sm:space-y-4">
                  {searchData.articles.map((article) => (
                      <div key={article.id} className="border rounded-lg p-3 sm:p-4">
                        <h3 className="font-medium text-base sm:text-lg mb-2">{article.title}</h3>
                        <Link
                            to={`/blogs/${article.blog?.handle}/${article.handle}`}
                            className="text-[#8B4513] hover:underline text-sm sm:text-base"
                        >
                          {translations.readArticle}
                        </Link>
                      </div>
                  ))}
                </div>
              </section>
          )}

          {/* Pages Section - Responsive */}
          {!isSearching && searchData.pages.length > 0 && (
              <section className="mb-8 sm:mb-12">
                <h2 className="text-xl sm:text-2xl font-medium text-[#002F45] mb-4 sm:mb-6 pb-2 border-b text-center sm:text-left">
                  {translations.pages} ({searchData.pages.length})
                </h2>
                <div className="space-y-3 sm:space-y-4">
                  {searchData.pages.map((page) => (
                      <div key={page.id} className="border rounded-lg p-3 sm:p-4">
                        <h3 className="font-medium text-base sm:text-lg mb-2">{page.title}</h3>
                        <Link
                            to={`/pages/${page.handle}`}
                            className="text-[#8B4513] hover:underline text-sm sm:text-base"
                        >
                          {translations.viewPage}
                        </Link>
                      </div>
                  ))}
                </div>
              </section>
          )}

          {/* No Results - Responsive */}
          {term && !isSearching && searchData.total === 0 && (
              <div className="text-center py-8 sm:py-12">
                <div className="mb-4">
                  <svg className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h2 className="text-lg sm:text-xl font-medium text-gray-600 mb-2">{translations.noResultsFound}</h2>
                <p className="text-gray-500 mb-4 text-sm sm:text-base px-4">
                  {translations.noResultsText}
                </p>
                <div className="text-xs sm:text-sm text-gray-600 px-4">
                  <p>{translations.examples} {locale === 'fr' ? '"lisse", "bouclé", "long", "court", "noir", "blond", "lace frontale"' : '"smooth", "curly", "long", "short", "black", "blonde", "frontal lace"'}</p>
                </div>
              </div>
          )}

          {/* Empty State - Responsive */}
          {!term && (
              <div className="text-center py-8 sm:py-12">
                <div className="mb-4">
                  <svg className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h2 className="text-lg sm:text-xl font-medium text-gray-600 mb-2">
                  {translations.startSearch}
                </h2>
                <p className="text-gray-500 text-sm sm:text-base px-4">
                  {translations.startSearchText}
                </p>
              </div>
          )}

          {/* Analytics */}
          {term && (
              <Analytics.SearchView
                  data={{
                    searchTerm: term,
                    searchResults: result
                  }}
              />
          )}
        </div>
      </div>
  );
}