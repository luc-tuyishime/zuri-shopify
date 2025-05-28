import {json, useLoaderData} from '@remix-run/react';

import { useState } from 'react';
import { Money } from '@shopify/hydrogen';
import { useLocale } from '~/hooks/useLocale';
import { useTranslation } from '~/lib/i18n';

import {
  getSelectedProductOptions,
  Analytics,
  useOptimisticVariant,
  getProductOptions,
  getAdjacentAndFirstAvailableVariants,
  useSelectedOptionInUrlParam,
} from '@shopify/hydrogen';
import {ProductPrice} from '~/components/ProductPrice';
import {ProductImage} from '~/components/ProductImage';
import {ProductForm} from '~/components/ProductForm';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';

/**
 * @type {MetaFunction<typeof loader>}
 */
export const meta = ({data}) => {
  return [
    {title: `Zuri | ${data?.product.title ?? ''}`},
    {
      rel: 'canonical',
      href: `/products/${data?.product.handle}`,
    },
  ];
};

/**
 * @param {LoaderFunctionArgs} args
 */
export async function loader({ params, request, context }) {
  const { handle } = params;
  const { storefront } = context;

  if (!handle) {
    throw new Error('Expected product handle to be defined');
  }

  const { product } = await storefront.query(PRODUCT_QUERY, {
    variables: {
      handle,
      selectedOptions: [],
      country: 'FR',      // Set to France for EUR
      language: 'FR',     // Set to French
    },
  });

  if (!product?.id) {
    throw new Response(null, { status: 404 });
  }

  return json({
    product,
  });
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 * @param {LoaderFunctionArgs}
 */
async function loadCriticalData({context, params, request}) {
  const {handle} = params;
  const {storefront} = context;

  if (!handle) {
    throw new Error('Expected product handle to be defined');
  }

  const [{product}] = await Promise.all([
    storefront.query(PRODUCT_QUERY, {
      variables: {handle, selectedOptions: getSelectedProductOptions(request)},
    }),
    // Add other queries here, so that they are loaded in parallel
  ]);

  if (!product?.id) {
    throw new Response(null, {status: 404});
  }

  // The API handle might be localized, so redirect to the localized handle
  redirectIfHandleIsLocalized(request, {handle, data: product});

  return {
    product,
  };
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 * @param {LoaderFunctionArgs}
 */
function loadDeferredData({context, params}) {
  // Put any API calls that is not critical to be available on first page render
  // For example: product reviews, product recommendations, social feeds.

  return {};
}

export default function Product() {
  const { product } = useLoaderData();
  const [locale] = useLocale();
  const t = useTranslation(locale);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Use the selected or first available variant
  const selectedVariant = product.selectedOrFirstAvailableVariant;

  // Get product options for the ProductForm
  const productOptions = product.options || [];

  const { title, descriptionHtml, images } = product;

  // Get all product images (fallback to variant image if no product images)
  const productImages = images?.nodes || (selectedVariant?.image ? [selectedVariant.image] : []);


  return (
      <div className="min-h-screen bg-[#F8F6F3] pt-24">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2">

            {/* Left Side - Product Info */}
            <div className="order-2 lg:order-1">
              <div className="max-w-lg">
                {/* Product Title */}
                <h1 className="lg:text-5xl font-light font-poppins text-[56px] text-[#002F45] mb-6">
                  {title}
                </h1>

                {/* Plant-based badge */}
                <div className="mb-4">
                <span className="font-semibold font-poppins text-[16px] text-[#7D390F] tracking-wide">
                  {locale === 'fr' ? '100% INGRÉDIENTS D\'ORIGINE VÉGÉTALE' : '100% PLANT-BASED INGREDIENTS'}
                </span>
                </div>

                {/* Rating */}
                <div className="flex items-center mb-6">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                        <svg key={i} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                          <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                        </svg>
                    ))}
                  </div>
                  <span className="ml-2 text-sm text-gray-600">200 Reviews</span>
                </div>

                {/* Subtitle */}
                <h2 className="font-regular font-poppins text-[16px] text-[#002F45]  mb-4">
                  {locale === 'fr' ? 'Cheveux Lisses, Beauté Sans Effort' : 'Smooth Hair, Effortless Beauty'}
                </h2>

                {/* Description */}
                <div className="font-regular font-poppins text-[16px] text-[#002F45] mb-6 [&_*]:leading-relaxed">
                  {descriptionHtml ? (
                      <div dangerouslySetInnerHTML={{ __html: descriptionHtml }} />
                  ) : (
                      <p>
                        {locale === 'fr'
                            ? 'Silk Smooth est un shampooing premium conçu pour nettoyer, nourrir et rehausser l\'éclat naturel de vos cheveux. Sa formule douce mais efficace aide à maintenir l\'équilibre hydratant, laissant les cheveux doux, maniables et revitalisés.'
                            : 'Silk Smooth is a premium shampoo crafted to cleanse, nourish, and enhance the natural shine of your hair. Its gentle yet effective formula helps maintain moisture balance, leaving hair soft, manageable, and revitalized.'
                        }
                      </p>
                  )}
                </div>



                {/* Product Options */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">
                    {locale === 'fr' ? 'Sélectionner une variante' : 'Select a variant'}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {product.options?.map((option) =>
                        option.optionValues.map((value) => (
                            <button
                                key={value.name}
                                className="px-4 py-2 border border-gray-300 rounded text-sm hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300"
                            >
                              {value.name}
                            </button>
                        ))
                    )}
                  </div>
                </div>

                {/* Purchase Options */}
                <div className="mb-6">
                  <div className="border border-gray-200 rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <input
                            type="radio"
                            name="purchase-option"
                            className="mr-3"
                            defaultChecked
                        />
                        <span className="font-medium">
                        {locale === 'fr' ? 'Achat unique' : 'One-Time Purchase'}
                      </span>
                      </div>
                      <div className="text-lg font-semibold">
                        <Money data={selectedVariant?.price} />
                      </div>
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <input
                            type="radio"
                            name="purchase-option"
                            className="mr-3"
                        />
                        <span className="font-medium">
                        {locale === 'fr' ? 'S\'abonner et économiser (35%)' : 'Subscribe & Save (35%)'}
                      </span>
                      </div>
                      <div className="text-lg font-semibold text-green-600">
                        {selectedVariant?.price && (
                            <Money
                                data={{
                                  amount: (parseFloat(selectedVariant.price.amount) * 0.65).toFixed(2),
                                  currencyCode: selectedVariant.price.currencyCode
                                }}
                            />
                        )}
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 ml-6">
                      {locale === 'fr' ? 'Livraison chaque mois' : 'Delivery every 1 month'}
                    </div>
                  </div>
                </div>

                {/* ProductForm with Add to Cart Functionality */}
                <div className="max-w-lg">
                  <ProductForm
                      productOptions={productOptions}
                      selectedVariant={selectedVariant}
                  />
                </div>
              </div>
            </div>

            {/* Right Side - Image Carousel */}
            <div className="order-1 lg:order-2">
              <div className="sticky top-24">
                {/* Main Image */}
                <div className="mb-4">
                  <div className="aspect-square bg-[#E8C4A0] rounded-2xl overflow-hidden">
                    {productImages[selectedImageIndex] && (
                        <img
                            src={productImages[selectedImageIndex].url}
                            alt={productImages[selectedImageIndex].altText || product.title}
                            className="w-full h-full object-cover"
                        />
                    )}
                  </div>
                </div>

                {/* Thumbnail Images */}
                {productImages.length > 1 && (
                    <div className="flex gap-2 justify-center">
                      {productImages.map((image, index) => (
                          <button
                              key={image.id}
                              onClick={() => setSelectedImageIndex(index)}
                              className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                                  selectedImageIndex === index
                                      ? 'border-[#8B4513]'
                                      : 'border-gray-200 hover:border-gray-300'
                              }`}
                          >
                            <img
                                src={image.url}
                                alt={image.altText}
                                className="w-full h-full object-cover"
                            />
                          </button>
                      ))}


                    </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <Analytics.ProductView
            data={{
              products: [
                {
                  id: product.id,
                  title: product.title,
                  price: selectedVariant?.price.amount || '0',
                  vendor: product.vendor,
                  variantId: selectedVariant?.id || '',
                  variantTitle: selectedVariant?.title || '',
                  quantity: 1,
                },
              ],
            }}
        />
      </div>
  );
}

const PRODUCT_VARIANT_FRAGMENT = `#graphql
  fragment ProductVariant on ProductVariant {
    availableForSale
    compareAtPrice {
      amount
      currencyCode
    }
    id
    image {
      __typename
      id
      url
      altText
      width
      height
    }
    price {
      amount
      currencyCode
    }
    product {
      title
      handle
    }
    selectedOptions {
      name
      value
    }
    sku
    title
    unitPrice {
      amount
      currencyCode
    }
  }
`;

const PRODUCT_FRAGMENT = `#graphql
  fragment Product on Product {
    id
    title
    vendor
    handle
    descriptionHtml
    description
    encodedVariantExistence
    encodedVariantAvailability
    images(first: 10) {
      nodes {
        id
        url
        altText
        width
        height
      }
    }
    options {
      name
      optionValues {
        name
        firstSelectableVariant {
          ...ProductVariant
        }
        swatch {
          color
          image {
            previewImage {
              url
            }
          }
        }
      }
    }
    selectedOrFirstAvailableVariant(selectedOptions: $selectedOptions, ignoreUnknownOptions: true, caseInsensitiveMatch: true) {
      ...ProductVariant
    }
    adjacentVariants (selectedOptions: $selectedOptions) {
      ...ProductVariant
    }
    seo {
      description
      title
    }
  }
  ${PRODUCT_VARIANT_FRAGMENT}
`;

const PRODUCT_QUERY = `#graphql
  query Product(
    $country: CountryCode
    $handle: String!
    $language: LanguageCode
    $selectedOptions: [SelectedOptionInput!]!
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      ...Product
    }
  }
  ${PRODUCT_FRAGMENT}
`;

/** @typedef {import('@shopify/remix-oxygen').LoaderFunctionArgs} LoaderFunctionArgs */
/** @template T @typedef {import('@remix-run/react').MetaFunction<T>} MetaFunction */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
