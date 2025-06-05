import {json, useLoaderData, useNavigate} from '@remix-run/react';

import {useEffect, useState} from 'react';
import { Money } from '@shopify/hydrogen';
import { useLocale } from '~/hooks/useLocale';
import { useTranslation } from '~/lib/i18n';
import {useOptimisticCart} from '@shopify/hydrogen';


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
import {ProductBenefitsSection} from "~/components/ProductBenefitsSection.jsx";
import {YouMayAlsoLike} from "~/components/YouMayAlsoLike.jsx";
import {CustomerReviewsSection} from "~/components/CustomerReviewsSection.jsx";
import {SilkSmoothDifference} from "~/components/SilkSmoothDifference.jsx";
import {CustomerTestimonial} from "~/components/CustomerTestimonial.jsx";
import {FAQ} from "~/components/Faq.jsx";

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
  const { storefront, cart } = context;

  const currentCart = await cart.get();
  if (currentCart?.buyerIdentity?.countryCode !== 'FR') {
    await cart.updateBuyerIdentity({
      countryCode: 'FR',
    });
  }

  if (!handle) {
    throw new Error('Expected product handle to be defined');
  }

  const [productResult, relatedProductsResult] = await Promise.all([
    storefront.query(PRODUCT_QUERY, {
      variables: {
        handle,
        selectedOptions: [],
        country: 'FR',
        language: 'FR',
      },
    }),
    // Fetch related products (you can customize this query)
    storefront.query(RELATED_PRODUCTS_QUERY, {
      variables: {
        first: 8, // Fetch 8 to have options after filtering current product
        country: 'FR',
        language: 'FR',
      },
    }),
  ]);

  const { product } = productResult;
  const { products: relatedProducts } = relatedProductsResult;

  if (!product?.id) {
    throw new Response(null, { status: 404 });
  }

  return json({
    product,
    relatedProducts,
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
  const [showZoomModal, setShowZoomModal] = useState(false);
  const { product, relatedProducts } = useLoaderData();
  const cart = useOptimisticCart();
  const [locale] = useLocale();
  const t = useTranslation(locale);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [expandedSections, setExpandedSections] = useState({
    shipping: false,
    returns: false,
    share: false,
  });
  const navigate = useNavigate();
  const [selectedVariant, setSelectedVariant] = useState(product.selectedOrFirstAvailableVariant);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const getShippingInfo = () => {
    // Try to get from product metafields first
    const shippingMetafield = product?.metafields?.find(
        field => field?.key === 'shipping_info'
    );

    if (shippingMetafield?.value) {
      return shippingMetafield.value;
    }

    // Default content
    return locale === 'fr'
        ? "Livraison gratuite en France métropolitaine pour toute commande supérieure à 50€. Expédition sous 2-3 jours ouvrés. Livraison standard : 3-5 jours ouvrés. Livraison express : 1-2 jours ouvrés (supplément applicable)."
        : "Free shipping in metropolitan France for orders over €50. Ships within 2-3 business days. Standard delivery: 3-5 business days. Express delivery: 1-2 business days (additional charges apply).";
  };

  const getReturnsInfo = () => {
    // Try to get from product metafields first
    const returnsMetafield = product?.metafields?.find(
        field => field?.key === 'returns_info'
    );

    if (returnsMetafield?.value) {
      return returnsMetafield.value;
    }

    // Default content
    return locale === 'fr'
        ? "Retours gratuits sous 30 jours. Les articles doivent être dans leur état d'origine, non utilisés et dans leur emballage d'origine. Les articles personnalisés ou d'hygiène ne peuvent pas être retournés. Contactez notre service client pour initier un retour."
        : "Free returns within 30 days. Items must be in original condition, unused and in original packaging. Personalized or hygiene items cannot be returned. Contact our customer service to initiate a return.";
  };

  const shareProduct = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.title,
          text: product.description,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert(locale === 'fr' ? 'Lien copié!' : 'Link copied!');
    }
  };

  const replaceCartItem = async (newVariant) => {
    if (!cart?.lines?.nodes?.length) return;

    // Remove old cart line
    const oldLineId = cart.lines.nodes[0].id;
  };

  const handleVariantChange = (optionName, optionValue) => {

    const newVariant = product.variants?.nodes?.find(variant => {
      return variant.selectedOptions.some(option =>
          option.name === optionName && option.value === optionValue
      );
    });

    if (newVariant) {
      setSelectedVariant(newVariant);

      if (cart?.lines?.nodes?.length > 0) {
        replaceCartItem(newVariant);
      }

      // Update URL
      const searchParams = new URLSearchParams();
      searchParams.set(optionName.toLowerCase(), optionValue);
      navigate(`?${searchParams.toString()}`, { replace: true, preventScrollReset: true  });
    } else {
      console.log('No variant found for:', optionName, optionValue);
    }
  };

  // Use the selected or first available variant

  // Get product options for the ProductForm
  const productOptions = product.options || [];

  const { title, descriptionHtml, images } = product;

  // Get all product images (fallback to variant image if no product images)
  const productImages = images?.nodes || (selectedVariant?.image ? [selectedVariant.image] : []);

  useEffect(() => {
    // Target the main navigation header specifically (the one with fixed positioning)
    const mainHeader = document.querySelector('header.fixed');
    if (mainHeader) {
      if (showZoomModal) {
        mainHeader.style.display = 'none';
      } else {
        mainHeader.style.display = 'block';
      }
    }

    // Cleanup function to ensure header is visible when component unmounts
    return () => {
      if (mainHeader) {
        mainHeader.style.display = 'block';
      }
    };
  }, [showZoomModal]);

  useEffect(() => {
    // When variant changes, you might want to clear the cart or update the existing line
    // This is optional - depends on your UX preference
  }, [selectedVariant]);


  return (
      <div className="min-h-screen  pt-24">
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
                {product.options?.map((option) => {
                  // Only show options that have more than one value
                  if (option.optionValues.length <= 1) return null;

                  return (
                      <div key={option.name} className="mb-6">
                        <h3 className="text-sm font-medium text-gray-900 mb-3">
                          {locale === 'fr'
                              ? `Sélectionner une longueur`
                              : `Select a length`
                          }
                        </h3>

                        <div className="flex flex-wrap gap-2">
                          {option.optionValues.map((value) => {
                            // Find the variant for this specific option value
                            const variantForOption = product.variants?.nodes?.find(variant =>
                                variant.selectedOptions.some(opt =>
                                    opt.name === option.name && opt.value === value.name
                                )
                            );

                            // Check if this option is currently selected
                            const isSelected = selectedVariant?.selectedOptions?.some(opt =>
                                opt.name === option.name && opt.value === value.name
                            );

                            const isAvailable = variantForOption?.availableForSale;

                            return (
                                <button
                                    key={value.name}
                                    onClick={() => handleVariantChange(option.name, value.name)}
                                    disabled={!isAvailable}
                                    className={`
                px-4 py-3 border rounded-lg text-sm font-medium transition-all duration-200 min-w-[80px]
                ${isSelected
                                        ? 'border-[#8B4513] bg-[#8B4513] text-white'
                                        : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                                    }
                ${!isAvailable
                                        ? 'opacity-50 cursor-not-allowed line-through'
                                        : 'cursor-pointer'
                                    }
                focus:outline-none focus:ring-2 focus:ring-[#8B4513] focus:ring-offset-2
              `}
                                >
                                  <div className="text-center">
                                    <div className="font-medium">{value.name}</div>
                                    {variantForOption && (
                                        <div className="text-xs mt-1 opacity-90">
                                          <Money data={variantForOption.price} />
                                        </div>
                                    )}
                                  </div>
                                </button>
                            );
                          })}
                        </div>

                        {/* Show selected option info */}
                        {selectedVariant?.selectedOptions?.find(opt => opt.name === option.name) && (
                            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">
              {locale === 'fr' ? 'Sélectionné:' : 'Selected:'}
              <span className="font-medium text-gray-900 ml-1">
                {selectedVariant.selectedOptions.find(opt => opt.name === option.name)?.value}
              </span>
            </span>
                                <div className="text-sm font-medium text-[#8B4513]">
                                  <Money data={selectedVariant.price} />
                                </div>
                              </div>
                            </div>
                        )}
                      </div>
                  );
                })}

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
                <div>
                  <ProductForm
                      productOptions={[]}
                      selectedVariant={selectedVariant}
                  />
                </div>

                <div className="mt-12 border-t border-gray-200">
                  {/* Shipping Information */}
                  <div className="border-b border-gray-200">
                    <button
                        onClick={() => toggleSection('shipping')}
                        className="w-full py-6 flex items-center justify-between text-left hover:bg-gray-50 transition-colors duration-200"
                    >
                      <div className="flex items-center space-x-4">
                        {/* Shipping Icon */}
                        <svg
                            className="w-6 h-6 text-gray-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                          <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                          <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17M17 13v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6.28"
                          />
                        </svg>
                        <span className="text-lg font-regular font-poppins text-[16px] text-[#002F45]">
              {locale === 'fr' ? 'Informations de livraison' : 'Shipping Information'}
            </span>
                      </div>
                      <svg
                          className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                              expandedSections.shipping ? 'rotate-180' : ''
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {expandedSections.shipping && (
                        <div className="pb-6 px-10 text-[#002F45] leading-relaxed font-poppins">
                          <p>{getShippingInfo()}</p>
                        </div>
                    )}
                  </div>

                  {/* Returns */}
                  <div className="border-b border-gray-200">
                    <button
                        onClick={() => toggleSection('returns')}
                        className="w-full py-6 flex items-center justify-between text-left hover:bg-gray-50 transition-colors duration-200"
                    >
                      <div className="flex items-center space-x-4">
                        {/* Returns Icon */}
                        <svg
                            className="w-6 h-6 text-gray-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                          <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                          />
                        </svg>
                        <span className="text-lg font-regular font-poppins text-[#002F45]">
                        {locale === 'fr' ? 'Retours' : 'Returns'}
                        </span>
                      </div>
                      <svg
                          className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                              expandedSections.returns ? 'rotate-180' : ''
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {expandedSections.returns && (
                        <div className="pb-6 px-10 text-[#002F45] leading-relaxed font-poppins">
                          <p>{getReturnsInfo()}</p>
                        </div>
                    )}
                  </div>

                  {/* Share */}
                  <div className="border-b border-gray-200">
                    <button
                        onClick={shareProduct}
                        className="w-full py-6 flex items-center justify-between text-left hover:bg-gray-50 transition-colors duration-200"
                    >
                      <div className="flex items-center space-x-4">
                        {/* Share Icon */}
                        <svg
                            className="w-6 h-6 text-gray-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                          <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
                          />
                        </svg>
                        <span className="text-lg font-regular font-poppins text-[#002F45]">
              {locale === 'fr' ? 'Partager' : 'Share'}
            </span>
                      </div>
                      <svg
                          className="w-5 h-5 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </button>
                  </div>
                </div>

              </div>
            </div>

            {/* Right Side - Image Carousel */}
            <div className="order-1 lg:order-2">
              <div className="sticky top-24">
                {/* Main Image */}
                <div className="mb-4">
                  <div
                      className="aspect-square bg-[#E8C4A0] rounded-2xl overflow-hidden relative cursor-pointer group"
                      onClick={() => setShowZoomModal(true)}
                  >
                    {productImages[selectedImageIndex] && (
                        <>
                          <img
                              src={productImages[selectedImageIndex].url}
                              alt={productImages[selectedImageIndex].altText || product.title}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />

                          {/* Zoom Icon Overlay */}
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                            <div className="bg-white bg-opacity-0 group-hover:bg-opacity-90 px-3 py-1 rounded-full text-sm font-medium text-gray-700 transition-all duration-300 opacity-0 group-hover:opacity-100">
                              🔍 Click to Zoom
                            </div>
                          </div>
                        </>
                    )}
                  </div>

                  {/* Zoom Modal */}
                  {showZoomModal && (
                      <div
                          className="fixed inset-0 bg-black bg-opacity-90 z-[60] flex items-center justify-center p-4"
                          onClick={() => setShowZoomModal(false)}
                      >
                        <div className="relative max-w-4xl max-h-full">
                          {/* Close Button */}
                          <button
                              onClick={() => setShowZoomModal(false)}
                              className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-lg z-10 hover:bg-gray-100 transition-colors"
                          >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>

                          {/* Large Image */}
                          <img
                              src={productImages[selectedImageIndex]?.url}
                              alt={productImages[selectedImageIndex]?.altText || product.title}
                              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                              onClick={(e) => e.stopPropagation()}
                          />

                          {/* Image Navigation in Modal */}
                          {productImages.length > 1 && (
                              <>
                                {/* Previous Button */}
                                {selectedImageIndex > 0 && (
                                    <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setSelectedImageIndex(selectedImageIndex - 1);
                                        }}
                                        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors"
                                    >
                                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                      </svg>
                                    </button>
                                )}

                                {/* Next Button */}
                                {selectedImageIndex < productImages.length - 1 && (
                                    <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setSelectedImageIndex(selectedImageIndex + 1);
                                        }}
                                        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors"
                                    >
                                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                      </svg>
                                    </button>
                                )}
                              </>
                          )}

                          {/* Image Counter */}
                          {productImages.length > 1 && (
                              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                                {selectedImageIndex + 1} / {productImages.length}
                              </div>
                          )}
                        </div>
                      </div>
                  )}
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

        <ProductBenefitsSection product={product} />
        <YouMayAlsoLike
            products={relatedProducts}
            currentProductId={product.id}
        />
        <CustomerReviewsSection />
        <SilkSmoothDifference />
        <CustomerTestimonial
            // productImage={productImages[0]?.url}
            testimonial={{
              quote: locale === 'fr'
                  ? "Ce shampooing est parfait pour mon cuir chevelu sensible. Il nettoie en profondeur tout en gardant mes cheveux doux."
                  : "This shampoo is perfect for my sensitive scalp. Cleans thoroughly while keeping my hair soft.",
              author: locale === 'fr' ? "Marie D." : "Jamie P.",
              product: locale === 'fr' ? "Shampooing Silk Smooth, Cliente" : "Silk Smooth Shampoo, Customer"
            }}
        />
        <FAQ />
      </div>
  );
}



const COLLECTION_ITEM_FRAGMENT = `#graphql
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
        amount
        currencyCode
      }
      maxVariantPrice {
        amount
        currencyCode
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

const RELATED_PRODUCTS_QUERY = `#graphql
  query RelatedProducts(
    $country: CountryCode
    $language: LanguageCode
    $first: Int!
  ) @inContext(country: $country, language: $language) {
    products(first: $first) {
      nodes {
        ...CollectionItem
      }
    }
  }
  ${COLLECTION_ITEM_FRAGMENT}
`;

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
     variants(first: 250) {
      nodes {
        ...ProductVariant
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
