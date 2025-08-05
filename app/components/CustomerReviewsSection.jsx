import {useLoaderData} from '@remix-run/react';
import IMAGE from '../assets/image.png';
import {useLocale} from "~/hooks/useLocale.js";
import {useTranslation} from "~/lib/i18n.js";

const CUSTOMER_REVIEWS_QUERY = `#graphql
  query CustomerReviews($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    
    # Get products with review metafields (fetch more products and remove filters)
    products(first: 50, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        id
        title
        handle
        featuredImage {
          id
          url
          altText
        }
        # Get ALL review metafields from each product (Review 1-4)
        metafields(identifiers: [
          # Review 1
          {namespace: "custom", key: "review_1_image"},
          {namespace: "custom", key: "review_1_rating"},
          {namespace: "custom", key: "review_1_text_en"},
          {namespace: "custom", key: "review_1_text_fr"},
          {namespace: "custom", key: "review_1_name"},
          {namespace: "custom", key: "review_1_verified"},
          {namespace: "custom", key: "review_1_date"},
          # Review 2
          {namespace: "custom", key: "review_2_image"},
          {namespace: "custom", key: "review_2_rating"},
          {namespace: "custom", key: "review_2_text_en"},
          {namespace: "custom", key: "review_2_text_fr"},
          {namespace: "custom", key: "review_2_name"},
          {namespace: "custom", key: "review_2_verified"},
          {namespace: "custom", key: "review_2_date"},
          # Review 3
          {namespace: "custom", key: "review_3_image"},
          {namespace: "custom", key: "review_3_rating"},
          {namespace: "custom", key: "review_3_text_en"},
          {namespace: "custom", key: "review_3_text_fr"},
          {namespace: "custom", key: "review_3_name"},
          {namespace: "custom", key: "review_3_verified"},
          {namespace: "custom", key: "review_3_date"},
          # Review 4
          {namespace: "custom", key: "review_4_image"},
          {namespace: "custom", key: "review_4_rating"},
          {namespace: "custom", key: "review_4_text_en"},
          {namespace: "custom", key: "review_4_text_fr"},
          {namespace: "custom", key: "review_4_name"},
          {namespace: "custom", key: "review_4_verified"},
          {namespace: "custom", key: "review_4_date"}
        ]) {
          key
          value
          reference {
            ... on MediaImage {
              image {
                url
                altText
                width
                height
              }
            }
          }
        }
      }
    }
  }
`;


function getMetafieldValue(metafields, key, fallback = '') {
    const metafield = metafields?.find(m => m?.key === key);

    if (metafield?.reference?.image?.url) {
        const imageUrl = metafield.reference.image.url;

        if (typeof window !== 'undefined') {
            const testImage = new Image();
            testImage.src = imageUrl;
        }

        return imageUrl;
    }

    if (metafield?.value) {
        console.log(`✅ Returning value for "${key}":`, metafield.value);
        return metafield.value;
    }

    if (key.includes('image')) {
        console.log(`⚠️ No image found for "${key}", using fallback:`, fallback);
    }

    return fallback;
}

export function CustomerReviewsSection({ reviewsData }) {
    const [locale] = useLocale();
    const t = useTranslation(locale);

    const products = reviewsData?.products?.nodes || [];

    console.log('🔍 Found products with potential reviews:', products.length);

    products.forEach((product, index) => {
        console.log(`📦 Product ${index + 1}: "${product.title}" (${product.handle})`);
        console.log(`   Metafields count: ${product.metafields?.length || 0}`);

        const hasReview1Data = product.metafields?.some(m =>
            m?.key?.startsWith('review_1_')
        );
        console.log(`   Has Review 1 data: ${hasReview1Data}`);
    });

    const sectionTitle = locale === 'fr'
        ? 'TÉMOIGNAGES CLIENTS'
        : 'CUSTOMER TESTIMONIALS';

    const buttonText = locale === 'fr'
        ? 'LIRE TOUS LES AVIS'
        : 'READ ALL REVIEWS';

    const buttonUrl = '#reviews';

    const reviews = [];

    products.forEach((product) => {
        const productMetafields = product.metafields || [];

        console.log(`🔍 Checking product "${product.title}" for reviews...`);

        for (let i = 1; i <= 4; i++) {
            const reviewImage = getMetafieldValue(productMetafields, `review_${i}_image`);
            const reviewRating = getMetafieldValue(productMetafields, `review_${i}_rating`);
            const reviewText = getMetafieldValue(
                productMetafields,
                locale === 'fr' ? `review_${i}_text_fr` : `review_${i}_text_en`
            );
            const reviewName = getMetafieldValue(productMetafields, `review_${i}_name`);
            const reviewVerified = getMetafieldValue(productMetafields, `review_${i}_verified`);
            const reviewDate = getMetafieldValue(productMetafields, `review_${i}_date`);

            if (reviewText || reviewName || reviewRating) {
                console.log(`✅ Found Review ${i} for "${product.title}":`, {
                    rating: reviewRating,
                    name: reviewName,
                    date: reviewDate || 'No date',
                    textEn: productMetafields.find(m => m?.key === `review_${i}_text_en`)?.value || 'No English text',
                    textFr: productMetafields.find(m => m?.key === `review_${i}_text_fr`)?.value || 'No French text',
                    hasImage: !!reviewImage
                });

                reviews.push({
                    id: `${product.id}-review-${i}`,
                    productTitle: product.title,
                    productHandle: product.handle,
                    productImage: product.featuredImage?.url,
                    image: reviewImage || product.featuredImage?.url || IMAGE,
                    rating: parseInt(reviewRating) || 5,
                    text: reviewText || "Great product!",
                    name: reviewName || "CUSTOMER",
                    verified: reviewVerified === 'true' || reviewVerified === true,
                    date: reviewDate || '2024-12-15'
                });
            }
        }
    });

    console.log('✅ Built reviews array:', reviews.length, 'reviews found');


    const sortedReviews = reviews.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateB - dateA;
    });


    const fallbackReviews = [
        {
            id: 'fallback-1',
            productTitle: 'Featured Product',
            productHandle: 'featured-product',
            image: IMAGE,
            rating: 5,
            text: locale === 'fr'
                ? "Laisse mes cheveux magnifiques et brillants, avec une douceur remarquable."
                : "Leaves my hair looking and feeling amazing, with a noticeable shine and softness.",
            name: "ANDREA C.",
            verified: true,
            date: '2024-12-15'
        },
        {
            id: 'fallback-2',
            productTitle: 'Best Seller',
            productHandle: 'best-seller',
            image: IMAGE,
            rating: 5,
            text: locale === 'fr'
                ? "Produit incroyable, je le recommande vivement!"
                : "Amazing product, I highly recommend it!",
            name: "MARIE L.",
            verified: true,
            date: '2024-12-10'
        },
        {
            id: 'fallback-3',
            productTitle: 'Popular Choice',
            productHandle: 'popular-choice',
            image: IMAGE,
            rating: 4,
            text: locale === 'fr'
                ? "Très satisfaite du résultat, mes cheveux sont plus soyeux."
                : "Very satisfied with the result, my hair is silkier.",
            name: "SOPHIE M.",
            verified: true,
            date: '2024-12-05'
        },
        {
            id: 'fallback-4',
            productTitle: 'Customer Favorite',
            productHandle: 'customer-favorite',
            image: IMAGE,
            rating: 5,
            text: locale === 'fr'
                ? "Qualité exceptionnelle, ça vaut vraiment le prix."
                : "Exceptional quality, it's really worth the price.",
            name: "LISA K.",
            verified: true,
            date: '2024-11-28'
        }
    ];


    const formatDate = (dateString, locale) => {
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return dateString;

            const options = {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            };

            return date.toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', options);
        } catch (error) {
            console.warn('Error formatting date:', error);
            return dateString;
        }
    };

    const displayReviews = sortedReviews.length > 0 ? sortedReviews.slice(0, 4) : fallbackReviews;

    const StarRating = ({ rating }) => {
        const numRating = parseInt(rating) || 5;

        return (
            <div className="flex items-center mb-3">
                {[...Array(5)].map((_, index) => (
                    <svg
                        key={index}
                        className={`w-4 h-4 ${index < numRating ? 'text-[#542C17]' : 'text-gray-300'}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                    >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                ))}
            </div>
        );
    };

    const VerifiedIcon = () => (
        <svg className="w-5 h-5 text-[#542C17] ml-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
    );

    return (
        <div className="customer-reviews-section bg-white py-16">
            <div className="container mx-auto">
                {/* Debug info in development */}
                {/*{process.env.NODE_ENV === 'development' && (*/}
                {/*    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">*/}
                {/*        <p className="text-sm text-blue-800">*/}
                {/*            <strong>Debug:</strong> Found {reviews.length} product reviews, displaying {displayReviews.length} total*/}
                {/*        </p>*/}
                {/*        {reviews.length > 0 && (*/}
                {/*            <div className="mt-2 text-xs text-blue-600">*/}
                {/*                Products with reviews: {reviews.map(r => r.productTitle).join(', ')}*/}
                {/*            </div>*/}
                {/*        )}*/}
                {/*    </div>*/}
                {/*)}*/}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
                    <div>
                        <h2 className="text-[45px] font-poppins font-medium leading-tight mb-8">
                            {sectionTitle}
                        </h2>
                        <a
                            href={buttonUrl}
                            className="inline-block border border-gray-800 text-gray-800 px-8 py-3 font-poppins font-medium hover:bg-gray-800 hover:text-white transition-colors duration-300"
                        >
                            {buttonText}
                        </a>
                    </div>

                    <div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {displayReviews.map((review) => (
                                <div key={review.id} className="review-card">
                                    {/* Review Image */}
                                    <div className="mb-4 relative">
                                        <img
                                            src={review.image}
                                            alt={`Review by ${review.name}`}
                                            className="w-full h-40 object-cover rounded-lg"
                                            loading="lazy"
                                            onLoad={() => console.log(`✅ Review image loaded: ${review.image}`)}
                                            onError={(e) => {
                                                console.error(`❌ Review image failed: ${review.image}`);
                                                e.target.src = IMAGE;
                                            }}
                                        />
                                    </div>

                                    <StarRating rating={review.rating} />

                                    {/* ✅ Add Product Name Link */}
                                    {review.productHandle && review.productTitle && (
                                        <div className="mb-3">
                                            <a
                                                href={`/products/${review.productHandle}`}
                                                className="text-sm font-poppins font-medium text-[#542C17] hover:text-[#3d1f10] transition-colors duration-200 hover:underline"
                                            >
                                                {review.productTitle}
                                            </a>
                                        </div>
                                    )}

                                    <p className="text-sm font-poppins text-gray-700 mb-3 leading-relaxed">
                                        "{review.text}"
                                    </p>

                                    {review.date && (
                                        <p className="text-xs font-poppins text-gray-500 mb-3 italic">
                                            {formatDate(review.date, locale)}
                                        </p>
                                    )}

                                    <div className="flex items-center">
                                        <span className="text-sm font-poppins font-medium text-gray-900">
                                            {review.name}
                                        </span>
                                        {review.verified && <VerifiedIcon />}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}


export { CUSTOMER_REVIEWS_QUERY };