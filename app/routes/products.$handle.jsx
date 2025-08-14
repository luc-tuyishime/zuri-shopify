import {Await, json, useLoaderData, useNavigate} from '@remix-run/react';

import {memo, Suspense, useCallback, useEffect, useMemo, useState} from 'react';
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
import {CustomerReviewsSection} from "~/components/CustomerReviewsSection";
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

// Helper functions for media handling
function isVideo(media) {
  return media.__typename === 'Video' || media.__typename === 'ExternalVideo';
}

function getMediaUrl(media) {
  if (media.__typename === 'MediaImage') {
    return media.image?.url;
  } else if (media.__typename === 'Video') {
    return media.sources?.[0]?.url;
  } else if (media.__typename === 'ExternalVideo') {
    return media.embedUrl;
  }
  return null;
}

function getPreviewImageUrl(media) {
  if (media.__typename === 'MediaImage') {
    return media.image?.url;
  } else if (media.__typename === 'Video' || media.__typename === 'ExternalVideo') {
    return media.previewImage?.url;
  }
  return null;
}

// Enhanced ZoomModal component with video support
const ZoomModalWithVideo = memo(({
                                   isOpen,
                                   onClose,
                                   media,
                                   selectedIndex,
                                   onPrevious,
                                   onNext,
                                   productTitle
                                 }) => {
  if (!isOpen) return null;

  const currentMedia = media[selectedIndex];
  const isCurrentVideo = isVideo(currentMedia);

  return (
      <div
          className="fixed inset-0 bg-black bg-opacity-90 z-[60] flex items-center justify-center p-2 sm:p-4"
          onClick={onClose}
      >
        <div className="relative max-w-4xl max-h-full w-full">
          {/* Close Button */}
          <button
              onClick={onClose}
              className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-white rounded-full p-2 shadow-lg z-10 hover:bg-gray-100 transition-colors"
          >
            <svg className="w-4 h-4 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Media Content */}
          {isCurrentVideo ? (
              currentMedia.__typename === 'ExternalVideo' ? (
                  // External video (YouTube, Vimeo)
                  <iframe
                      src={currentMedia.embedUrl}
                      className="max-w-full max-h-full w-full h-96 sm:h-[500px] lg:h-[600px] rounded-lg shadow-2xl"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      onClick={(e) => e.stopPropagation()}
                  />
              ) : (
                  // Native video
                  <video
                      src={getMediaUrl(currentMedia)}
                      controls
                      autoPlay
                      className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                      onClick={(e) => e.stopPropagation()}
                      poster={getPreviewImageUrl(currentMedia)}
                  >
                    Your browser does not support the video tag.
                  </video>
              )
          ) : (
              // Image
              <img
                  src={getMediaUrl(currentMedia)}
                  alt={currentMedia.image?.altText || productTitle}
                  className="max-w-full max-h-full object-contain rounded-lg shadow-2xl cursor-default"
                  onClick={(e) => e.stopPropagation()}
              />
          )}

          {/* Navigation Buttons - Desktop */}
          {media.length > 1 && (
              <>
                {selectedIndex > 0 && (
                    <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onPrevious();
                        }}
                        className="hidden sm:block absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors cursor-pointer"
                    >
                      <svg className="w-4 h-4 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                )}

                {selectedIndex < media.length - 1 && (
                    <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onNext();
                        }}
                        className="hidden sm:block absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors"
                    >
                      <svg className="w-4 h-4 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                )}
              </>
          )}

          {/* Media Counter */}
          {media.length > 1 && (
              <div className="absolute bottom-2 sm:bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm">
                {selectedIndex + 1} / {media.length}
              </div>
          )}

          {/* Media Type Indicator */}
          {isCurrentVideo && (
              <div className="absolute top-2 left-2 sm:top-4 sm:left-4 bg-black bg-opacity-50 text-white px-2 py-1 rounded-full text-xs flex items-center">
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z"/>
                </svg>
                Video
              </div>
          )}
        </div>
      </div>
  );
});

function getRelatedProductsFromMetafields(product) {
  if (!product?.metafields) return [];

  const relatedProductsMetafield = product.metafields.find(
      m => m?.key === 'related_products'
  );

  if (!relatedProductsMetafield) return [];

  if (relatedProductsMetafield.references?.nodes?.length > 0) {
    console.log('✅ Using references:', relatedProductsMetafield.references.nodes);
    return relatedProductsMetafield.references.nodes.filter(product => product && product.id);
  }

  return [];
}

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

  // Use the updated product query with media support
  const [productResult, relatedProductsResult] = await Promise.all([
    storefront.query(PRODUCT_QUERY, {
      variables: {
        handle,
        selectedOptions: getSelectedProductOptions(request),
        country: 'FR',
        language: 'FR',
      },
    }),
    storefront.query(RELATED_PRODUCTS_QUERY, {
      variables: {
        first: 8,
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

const VariantButton = memo(({ value, variant, isSelected, isAvailable, onClick, locale }) => (
    <button
        onClick={() => onClick(value.name)}
        disabled={!isAvailable}
        className={`
      px-3 py-2 sm:px-4 sm:py-3 border rounded-lg text-xs sm:text-sm font-medium 
      transition-all duration-200 min-w-[60px] sm:min-w-[80px]
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
        {variant && (
            <div className="text-xs mt-1 opacity-90">
              <Money data={variant.price} />
            </div>
        )}
      </div>
    </button>
));

function getProductReviewData(product) {
  if (!product || !product.metafields || !Array.isArray(product.metafields)) {
    return {
      rating: 0,
      count: 0
    };
  }

  const ratingMetafield = product.metafields.find(m => m && m.key === 'product_rating');
  const countMetafield = product.metafields.find(m => m && m.key === 'review_count');

  return {
    rating: ratingMetafield && ratingMetafield.value ? parseFloat(ratingMetafield.value) || 0 : 0,
    count: countMetafield && countMetafield.value ? parseInt(countMetafield.value) || 0 : 0
  };
}

export default function Product() {
  const data = useLoaderData();
  const [showZoomModal, setShowZoomModal] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);
  const { product, relatedProducts } = useLoaderData();
  const cart = useOptimisticCart();
  const [locale] = useLocale();
  const t = useTranslation(locale);
  const [expandedSections, setExpandedSections] = useState({
    shipping: false,
    returns: false,
    share: false,
  });
  const navigate = useNavigate();
  const [selectedVariant, setSelectedVariant] = useState(product.selectedOrFirstAvailableVariant);
  const { rating, count } = getProductReviewData(product);

  // Updated productMedia computation
  const productMedia = useMemo(() => {
    // Try to get media from product.media first (includes videos)
    if (product.media?.nodes?.length > 0) {
      return product.media.nodes;
    }
    // Fallback to images if media is not available
    if (product.images?.nodes?.length > 0) {
      return product.images.nodes.map(image => ({
        __typename: 'MediaImage',
        id: image.id,
        image: image
      }));
    }
    // Fallback to selected variant image
    if (selectedVariant?.image) {
      return [{
        __typename: 'MediaImage',
        id: selectedVariant.image.id,
        image: selectedVariant.image
      }];
    }
    return [];
  }, [product.media, product.images, selectedVariant?.image]);

  const handleMediaNavigation = useCallback((direction) => {
    setSelectedMediaIndex(prevIndex => {
      let newIndex = prevIndex;

      if (direction === 'prev' && prevIndex > 0) {
        newIndex = prevIndex - 1;
      } else if (direction === 'next' && prevIndex < productMedia.length - 1) {
        newIndex = prevIndex + 1;
      }

      return newIndex;
    });
  }, [productMedia?.length]);

  // Reset selected media when product changes
  useEffect(() => {
    setSelectedMediaIndex(0);
  }, [product?.id]);

  // Memoized handlers for better performance
  const toggleSection = useCallback((section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  }, []);

  const finalRelatedProducts = useMemo(() => {
    const metafieldProducts = getRelatedProductsFromMetafields(product);
    if (metafieldProducts.length > 0) {
      return { nodes: metafieldProducts };
    }
    return relatedProducts;
  }, [product, relatedProducts]);

  useEffect(() => {
    if (product?.selectedOrFirstAvailableVariant) {
      setSelectedVariant(product.selectedOrFirstAvailableVariant);
    }
  }, [product?.id]);

  const handleZoomModalClose = useCallback(() => {
    setShowZoomModal(false);
  }, []);

  const handleZoomModalOpen = useCallback(() => {
    setShowZoomModal(true);
  }, []);

  // Memoized computed values
  const shippingInfo = useMemo(() => {
    const shippingMetafield = product?.metafields?.find(
        field => field?.key === 'shipping_info'
    );

    if (shippingMetafield?.value) {
      return shippingMetafield.value;
    }

    return locale === 'fr'
        ? "Livraison gratuite en France métropolitaine pour toute commande supérieure à 50€. Expédition sous 2-3 jours ouvrés. Livraison standard : 3-5 jours ouvrés. Livraison express : 1-2 jours ouvrés (supplément applicable)."
        : "Free shipping in metropolitan France for orders over €50. Ships within 2-3 business days. Standard delivery: 3-5 business days. Express delivery: 1-2 business days (additional charges apply).";
  }, [product?.metafields, locale]);

  const returnsInfo = useMemo(() => {
    const returnsMetafield = product?.metafields?.find(
        field => field?.key === 'returns_info'
    );

    if (returnsMetafield?.value) {
      return returnsMetafield.value;
    }

    return locale === 'fr'
        ? "Retours gratuits sous 30 jours. Les articles doivent être dans leur état d'origine, non utilisés et dans leur emballage d'origine. Les articles personnalisés ou d'hygiène ne peuvent pas être retournés. Contactez notre service client pour initier un retour."
        : "Free returns within 30 days. Items must be in original condition, unused and in original packaging. Personalized or hygiene items cannot be returned. Contact our customer service to initiate a return.";
  }, [product?.metafields, locale]);

  const shareProduct = useCallback(async () => {
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
      navigator.clipboard.writeText(window.location.href);
      alert(locale === 'fr' ? 'Lien copié!' : 'Link copied!');
    }
  }, [product.title, product.description, locale]);

  const handleVariantChange = useCallback((optionName, optionValue) => {
    const newVariant = product.variants?.nodes?.find(variant => {
      return variant.selectedOptions.some(option =>
          option.name === optionName && option.value === optionValue
      );
    });

    if (newVariant) {
      setSelectedVariant(newVariant);

      const searchParams = new URLSearchParams();
      searchParams.set(optionName.toLowerCase(), optionValue);
      navigate(`?${searchParams.toString()}`, { replace: true, preventScrollReset: true });
    }
  }, [product.variants, navigate]);

  // Header visibility effect
  useEffect(() => {
    const mainHeader = document.querySelector('header.fixed');
    if (mainHeader) {
      mainHeader.style.display = showZoomModal ? 'none' : 'block';
    }

    return () => {
      if (mainHeader) {
        mainHeader.style.display = 'block';
      }
    };
  }, [showZoomModal]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const { title, descriptionHtml } = product;
  const currentMedia = productMedia[selectedMediaIndex];
  const isCurrentVideo = currentMedia ? isVideo(currentMedia) : false;

  return (
      <div className="min-h-screen pt-16 sm:pt-20 md:pt-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12">

            {/* Left Side - Product Info */}
            <div className="order-2 lg:order-1">
              <div className="max-w-lg mx-auto lg:mx-0">
                {/* Product Title - Responsive */}
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light font-poppins text-[#002F45] mb-4 sm:mb-6 leading-tight">
                  {title}
                </h1>

                {/* Rating - Responsive */}
                <div className="flex items-left mb-6 flex-wrap">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                        <svg
                            key={i}
                            className={`w-3 h-3 sm:w-4 sm:h-4 fill-current transition-colors ${
                                i < Math.floor(rating)
                                    ? 'text-yellow-400'
                                    : i < rating
                                        ? 'text-yellow-300'
                                        : 'text-gray-300'
                            }`}
                            viewBox="0 0 20 20"
                            aria-hidden="true"
                            style={{ transform: 'translateZ(0)', contain: 'layout style' }}
                        >
                          <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                        </svg>
                    ))}
                  </div>
                  <span className="ml-1 sm:ml-2 text-xs sm:text-sm text-gray-600">
                  {count > 0
                      ? (locale === 'fr'
                          ? `${count} avis${count !== 1 ? '' : ''}`
                          : `${count} review${count !== 1 ? 's' : ''}`)
                      : (locale === 'fr'
                          ? 'Aucun avis pour le moment'
                          : 'No reviews yet')
                  }
                </span>
                </div>

                {/* Description - Responsive */}
                <div className="font-regular font-poppins text-sm sm:text-base text-[#002F45] mb-4 sm:mb-6 [&_*]:leading-relaxed">
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

                {/* Product Options - Responsive */}
                {product.options?.map((option) => {
                  if (option.optionValues.length <= 1) return null;

                  return (
                      <div key={option.name} className="mb-4 sm:mb-6">
                        <h3 className="text-sm font-medium text-gray-900 mb-3">
                          {locale === 'fr' ? 'Sélectionner une longueur' : 'Select a length'}
                        </h3>

                        <div className="flex flex-wrap gap-2">
                          {option.optionValues.map((value) => {
                            const variantForOption = product.variants?.nodes?.find(variant =>
                                variant.selectedOptions.some(opt =>
                                    opt.name === option.name && opt.value === value.name
                                )
                            );

                            const isSelected = selectedVariant?.selectedOptions?.some(opt =>
                                opt.name === option.name && opt.value === value.name
                            );

                            const isAvailable = variantForOption?.availableForSale;

                            return (
                                <VariantButton
                                    key={value.name}
                                    value={value}
                                    variant={variantForOption}
                                    isSelected={isSelected}
                                    isAvailable={isAvailable}
                                    onClick={(valueName) => handleVariantChange(option.name, valueName)}
                                    locale={locale}
                                />
                            );
                          })}
                        </div>

                        {/* Selected option info - Responsive */}
                        {selectedVariant?.selectedOptions?.find(opt => opt.name === option.name) && (
                            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center justify-between flex-wrap gap-2">
                          <span className="text-xs sm:text-sm text-gray-600">
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

                {/* Purchase Options - Responsive */}
                <div className="mb-4 sm:mb-6">
                  <div className="border border-gray-200 rounded-lg p-3 sm:p-4 mb-3 sm:mb-4">
                    <div className="flex flex-wrap gap-2">
                      <div className="flex items-center">
                        {/* Purchase options content */}
                      </div>
                      <div className="text-base sm:text-lg font-semibold">
                        <Money data={selectedVariant?.price} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* ProductForm */}
                <div className="mb-6 w-full max-w-none sm:mb-8" style={{width: '100%'}}>
                  <ProductForm
                      productOptions={[]}
                      selectedVariant={selectedVariant}
                      product={product}
                  />
                </div>

                {/* Collapsible Sections - Responsive */}
                <div className="mt-8 sm:mt-12 border-t border-gray-200">
                  {/* Shipping Information */}
                  <div className="border-b border-gray-200">
                    <button
                        onClick={() => toggleSection('shipping')}
                        className="w-full py-4 sm:py-6 flex items-center justify-between text-left hover:bg-gray-50 transition-colors duration-200"
                    >
                      <div className="flex items-center space-x-3 sm:space-x-4">
                        <svg className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-sm sm:text-base lg:text-lg font-regular font-poppins text-[#002F45]">
                        {locale === 'fr' ? 'Informations de livraison' : 'Shipping Information'}
                      </span>
                      </div>
                      <svg
                          className={`w-4 h-4 sm:w-5 sm:h-5 text-gray-400 transition-transform duration-200 ${
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
                        <div className="pb-4 sm:pb-6 px-6 sm:px-10 text-[#002F45] leading-relaxed font-poppins text-sm sm:text-base">
                          <p>{shippingInfo}</p>
                        </div>
                    )}
                  </div>

                  {/* Returns */}
                  <div className="border-b border-gray-200">
                    <button
                        onClick={() => toggleSection('returns')}
                        className="w-full py-4 sm:py-6 flex items-center justify-between text-left hover:bg-gray-50 transition-colors duration-200"
                    >
                      <div className="flex items-center space-x-3 sm:space-x-4">
                        <svg className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                        </svg>
                        <span className="text-sm sm:text-base lg:text-lg font-regular font-poppins text-[#002F45]">
                        {locale === 'fr' ? 'Retours' : 'Returns'}
                      </span>
                      </div>
                      <svg
                          className={`w-4 h-4 sm:w-5 sm:h-5 text-gray-400 transition-transform duration-200 ${
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
                        <div className="pb-4 sm:pb-6 px-6 sm:px-10 text-[#002F45] leading-relaxed font-poppins text-sm sm:text-base">
                          <p>{returnsInfo}</p>
                        </div>
                    )}
                  </div>

                  {/* Share */}
                  <div className="border-b border-gray-200">
                    <button
                        onClick={shareProduct}
                        className="w-full py-4 sm:py-6 flex items-center justify-between text-left hover:bg-gray-50 transition-colors duration-200"
                    >
                      <div className="flex items-center space-x-3 sm:space-x-4">
                        <svg className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                        </svg>
                        <span className="text-sm sm:text-base lg:text-lg font-regular font-poppins text-[#002F45]">
                        {locale === 'fr' ? 'Partager' : 'Share'}
                      </span>
                      </div>
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Media Carousel with Video Support */}
            <div className="order-1 lg:order-2">
              <div className="sticky top-16 sm:top-20 md:top-24">
                {/* Main Media Display */}
                <div className="mb-3 sm:mb-4">
                  <div
                      className="aspect-square bg-[#E8C4A0] rounded-lg sm:rounded-2xl overflow-hidden relative cursor-pointer group"
                      onClick={handleZoomModalOpen}
                  >
                    {currentMedia && (
                        <>
                          {isCurrentVideo ? (
                              currentMedia.__typename === 'ExternalVideo' ? (
                                  // External video preview
                                  <div className="relative w-full h-full">
                                    <img
                                        src={getPreviewImageUrl(currentMedia)}
                                        alt={currentMedia.previewImage?.altText || product.title}
                                        className="w-full h-full object-cover"
                                        loading="eager"
                                        fetchpriority="high"
                                    />
                                    {/* Play button overlay */}
                                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                                      <div className="bg-white bg-opacity-90 rounded-full p-4 hover:bg-opacity-100 transition-all duration-300">
                                        <svg className="w-8 h-8 text-gray-800" fill="currentColor" viewBox="0 0 20 20">
                                          <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z"/>
                                        </svg>
                                      </div>
                                    </div>
                                  </div>
                              ) : (
                                  // Native video
                                  <video
                                      src={getMediaUrl(currentMedia)}
                                      poster={getPreviewImageUrl(currentMedia)}
                                      className="w-full h-full object-cover cursor-pointer"
                                      muted
                                      loop
                                      playsInline
                                      onMouseEnter={(e) => e.target.play()}
                                      onMouseLeave={(e) => {
                                        e.target.pause();
                                        e.target.currentTime = 0;
                                      }}
                                  />
                              )
                          ) : (
                              // Image
                              <img
                                  src={getMediaUrl(currentMedia)}
                                  alt={currentMedia.image?.altText || product.title}
                                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 cursor-pointer"
                                  loading="eager"
                                  fetchpriority="high"
                              />
                          )}

                          {/* Media Type Indicator */}
                          {isCurrentVideo && (
                              <div className="absolute top-3 left-3 bg-black bg-opacity-50 text-white px-2 py-1 rounded-full text-xs flex items-center">
                                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z"/>
                                </svg>
                                Video
                              </div>
                          )}

                          {/* Zoom/Play Icon Overlay */}
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                            <div className="bg-white bg-opacity-0 group-hover:bg-opacity-90 px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-medium text-gray-700 transition-all duration-300 opacity-0 group-hover:opacity-100">
                              {isCurrentVideo ? '▶️' : '🔍'} {isMobile ? 'Tap' : 'Click'} to {isCurrentVideo ? 'Play' : 'Zoom'}
                            </div>
                          </div>
                        </>
                    )}
                  </div>
                </div>

                {/* Thumbnail Media */}
                {productMedia.length > 1 && (
                    <div className="flex gap-1 sm:gap-2 justify-center overflow-x-auto pb-2">
                      {productMedia.map((media, index) => {
                        const isVideoThumbnail = isVideo(media);
                        return (
                            <div
                                key={media.id}
                                className={`
                          relative flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 
                          rounded-lg sm:rounded-xl overflow-hidden cursor-pointer
                          transition-all duration-200 hover:scale-105
                          ${selectedMediaIndex === index
                                    ? 'ring-2 ring-[#8B4513] ring-offset-1 sm:ring-offset-2'
                                    : 'ring-1 ring-gray-200 hover:ring-gray-300'
                                }
                        `}
                                onClick={() => {
                                  setSelectedMediaIndex(index);
                                  handleZoomModalOpen();
                                }}
                            >
                              <img
                                  src={getPreviewImageUrl(media)}
                                  alt={media.image?.altText || media.previewImage?.altText || `Product media ${index + 1}`}
                                  className="w-full h-full object-cover cursor-pointer"
                                  loading="lazy"
                              />

                              {/* Video indicator on thumbnail */}
                              {isVideoThumbnail && (
                                  <div className="absolute top-1 right-1 bg-black bg-opacity-60 rounded-full p-1">
                                    <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                                      <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z"/>
                                    </svg>
                                  </div>
                              )}

                              {/* Hover overlay */}
                              <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center cursor-pointer">
                                <div className="opacity-0 hover:opacity-100 transition-opacity duration-200 cursor-pointer">
                                  <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white cursor-pointer" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                                  </svg>
                                </div>
                              </div>
                            </div>
                        );
                      })}
                    </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Zoom Modal with Video Support */}
        <ZoomModalWithVideo
            isOpen={showZoomModal}
            onClose={handleZoomModalClose}
            media={productMedia}
            selectedIndex={selectedMediaIndex}
            onPrevious={() => handleMediaNavigation('prev')}
            onNext={() => handleMediaNavigation('next')}
            productTitle={product.title}
        />

        {/* Analytics */}
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

        {/* Other Components */}
        <YouMayAlsoLike
            products={finalRelatedProducts}
            currentProductId={product.id}
        />
        <SilkSmoothDifference product={product} />
        <CustomerTestimonial product={product} />
        <FAQ product={product} />
      </div>
  );
}

// GraphQL Fragments and Queries

const PRODUCT_MEDIA_FRAGMENT = `#graphql
  fragment ProductMedia on Media {
    __typename
    ... on MediaImage {
      id
      image {
        id
        url
        altText
        width
        height
      }
    }
    ... on Video {
      id
      sources {
        url
        mimeType
        format
        height
        width
      }
      previewImage {
        url
        altText
        width
        height
      }
    }
    ... on ExternalVideo {
      id
      embedUrl
      host
      previewImage {
        url
        altText
        width
        height
      }
    }
    ... on Model3d {
      id
      sources {
        url
        mimeType
        format
        filesize
      }
      previewImage {
        url
        altText
        width
        height
      }
    }
  }
`;

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
    variants(first: 10) {
      nodes {
        id
        title
        availableForSale
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
    tags
    encodedVariantExistence
    encodedVariantAvailability
    # Include both media (for videos) and images (for fallback)
    media(first: 10) {
      nodes {
        ...ProductMedia
      }
    }
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
    metafields(identifiers: [
      {namespace: "shopify--discovery--product_recommendation", key: "related_products"},
      {namespace: "custom", key: "product_rating"},
      {namespace: "custom", key: "review_count"},
      {namespace: "custom", key: "statistic_1_percentage_fr"},
      {namespace: "custom", key: "statistic_2_percentage_fr"},
      {namespace: "custom", key: "statistic_3_percentage_fr"},
      {namespace: "custom", key: "statistic_1_title_fr"},
      {namespace: "custom", key: "statistic_2_title_fr"},
      {namespace: "custom", key: "statistic_3_title_fr"},
      {namespace: "custom", key: "difference_section_title_fr"},
      {namespace: "custom", key: "benefits_tab_label_fr"},
      {namespace: "custom", key: "ingredients_tab_label_fr"},
      {namespace: "custom", key: "usage_tab_label_fr"},
      {namespace: "custom", key: "benefit_1_title_fr"},
      {namespace: "custom", key: "benefit_1_description_fr"},
      {namespace: "custom", key: "benefit_2_title_fr"},
      {namespace: "custom", key: "benefit_2_description_fr"},
      {namespace: "custom", key: "benefit_3_title_fr"},
      {namespace: "custom", key: "benefit_3_description_fr"},
      {namespace: "custom", key: "benefit_4_title_fr"},
      {namespace: "custom", key: "benefit_4_description_fr"},
      {namespace: "custom", key: "ingredients_title_fr"},
      {namespace: "custom", key: "ingredients_description_fr"},
      {namespace: "custom", key: "ingredients_list_fr"},
      {namespace: "custom", key: "usage_title_fr"},
      {namespace: "custom", key: "usage_step_1_fr"},
      {namespace: "custom", key: "usage_step_2_fr"},
      {namespace: "custom", key: "usage_step_3_fr"},
      {namespace: "custom", key: "usage_step_4_fr"},
      {namespace: "custom", key: "testimonial_quote_en"},
      {namespace: "custom", key: "testimonial_quote_fr"},
      {namespace: "custom", key: "testimonial_author_en"},
      {namespace: "custom", key: "testimonial_author_fr"},
      {namespace: "custom", key: "testimonial_product_en"},
      {namespace: "custom", key: "testimonial_product_fr"},
      {namespace: "custom", key: "testimonial_image"},
      {namespace: "custom", key: "faq_title_en"},
      {namespace: "custom", key: "faq_title_fr"},
      {namespace: "custom", key: "faq_1_question_en"},
      {namespace: "custom", key: "faq_1_question_fr"},
      {namespace: "custom", key: "faq_1_answer_en"},
      {namespace: "custom", key: "faq_1_answer_fr"},
      {namespace: "custom", key: "faq_2_question_en"},
      {namespace: "custom", key: "faq_2_question_fr"},
      {namespace: "custom", key: "faq_2_answer_en"},
      {namespace: "custom", key: "faq_2_answer_fr"},
      {namespace: "custom", key: "faq_3_question_en"},
      {namespace: "custom", key: "faq_3_question_fr"},
      {namespace: "custom", key: "faq_3_answer_en"},
      {namespace: "custom", key: "faq_3_answer_fr"},
      {namespace: "custom", key: "faq_4_question_en"},
      {namespace: "custom", key: "faq_4_question_fr"},
      {namespace: "custom", key: "faq_4_answer_en"},
      {namespace: "custom", key: "faq_4_answer_fr"},
      {namespace: "custom", key: "faq_5_question_en"},
      {namespace: "custom", key: "faq_5_question_fr"},
      {namespace: "custom", key: "faq_5_answer_en"},
      {namespace: "custom", key: "faq_5_answer_fr"}
    ]) {
      id
      namespace
      key
      value
      type
      reference {
        ... on MediaImage {
          id
          image {
            url
            altText
          }
        }
      }
      references(first: 20) {
        nodes {
          ... on Product {
            id
            handle
            title
            featuredImage {
              id
              url
              altText
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
            variants(first: 10) {
              nodes {
                id
                title
                availableForSale
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
            tags
            productType
            metafields(identifiers: [
              {namespace: "custom", key: "product_rating"},
              {namespace: "custom", key: "review_count"}
            ]) {
              key
              value
            }
          }
        }
      }
    }
  }
  ${PRODUCT_VARIANT_FRAGMENT}
  ${PRODUCT_MEDIA_FRAGMENT}
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