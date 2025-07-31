import {useLoaderData} from '@remix-run/react';
import IMAGE from '../assets/image.png';
import {useLocale} from "~/hooks/useLocale.js";
import {useTranslation} from "~/lib/i18n.js";

const CUSTOMER_REVIEWS_QUERY = `#graphql
  query CustomerReviews {
    shop {
      metafields(identifiers: [
        {namespace: "custom", key: "reviews_section_title_en"},
        {namespace: "custom", key: "reviews_section_title_fr"},
        {namespace: "custom", key: "reviews_button_text_en"},
        {namespace: "custom", key: "reviews_button_text_fr"},
        {namespace: "custom", key: "reviews_button_url"},
        {namespace: "custom", key: "review_1_image"},
        {namespace: "custom", key: "review_1_rating"},
        {namespace: "custom", key: "review_1_text_en"},
        {namespace: "custom", key: "review_1_text_fr"},
        {namespace: "custom", key: "review_1_name"},
        {namespace: "custom", key: "review_1_verified"},
        {namespace: "custom", key: "review_2_image"},
        {namespace: "custom", key: "review_2_rating"},
        {namespace: "custom", key: "review_2_text_en"},
        {namespace: "custom", key: "review_2_text_fr"},
        {namespace: "custom", key: "review_2_name"},
        {namespace: "custom", key: "review_2_verified"},
        {namespace: "custom", key: "review_3_image"},
        {namespace: "custom", key: "review_3_rating"},
        {namespace: "custom", key: "review_3_text_en"},
        {namespace: "custom", key: "review_3_text_fr"},
        {namespace: "custom", key: "review_3_name"},
        {namespace: "custom", key: "review_3_verified"},
        {namespace: "custom", key: "review_4_image"},
        {namespace: "custom", key: "review_4_rating"},
        {namespace: "custom", key: "review_4_text_en"},
        {namespace: "custom", key: "review_4_text_fr"},
        {namespace: "custom", key: "review_4_name"},
        {namespace: "custom", key: "review_4_verified"}
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
`;


function getMetafieldValue(metafields, key, fallback = '') {
    const metafield = metafields?.find(m => m?.key === key);

    if (metafield?.reference?.image?.url) {
        const imageUrl = metafield.reference.image.url;
        console.log(`✅ Found image URL for "${key}":`, imageUrl);

        if (typeof window !== 'undefined') {
            const testImage = new Image();
            testImage.onload = () => console.log(`✅ Image is accessible: ${imageUrl}`);
            testImage.onerror = () => console.error(`❌ Image failed to load: ${imageUrl}`);
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


    // Check if it's a promise that needs to be resolved
    if (reviewsData && typeof reviewsData.then === 'function') {
        console.log('⚠️ reviewsData is still a promise! You need to wrap this in Suspense/Await');
    }

    // Safely access metafields
    const metafields = reviewsData?.shop?.metafields || [];


    // Check for specific review image
    const review1Image = metafields?.find(m => m?.key === 'review_1_image');

    // Get dynamic content with fallbacks
    const sectionTitle = getMetafieldValue(
        metafields,
        locale === 'fr' ? 'reviews_section_title_fr' : 'reviews_section_title_en',
        t.homepage.customerTestimonials
    );

    const buttonText = getMetafieldValue(
        metafields,
        locale === 'fr' ? 'reviews_button_text_fr' : 'reviews_button_text_en',
        t.homepage.readAllReviewsBtn
    );

    const buttonUrl = getMetafieldValue(metafields, 'reviews_button_url', '#reviews');

    // Build dynamic reviews array
    const reviews = [];

    console.log('🔍 Building reviews array...');

    for (let i = 1; i <= 4; i++) {
        const reviewImage = getMetafieldValue(metafields, `review_${i}_image`);
        const reviewRating = getMetafieldValue(metafields, `review_${i}_rating`);
        const reviewText = getMetafieldValue(
            metafields,
            locale === 'fr' ? `review_${i}_text_fr` : `review_${i}_text_en`
        );
        const reviewName = getMetafieldValue(metafields, `review_${i}_name`);
        const reviewVerified = getMetafieldValue(metafields, `review_${i}_verified`);

        console.log(`🔍 Review ${i} raw data:`, {
            image: reviewImage,
            rating: reviewRating,
            text: reviewText,
            name: reviewName,
            verified: reviewVerified
        });

        // TEMPORARY: Show review even if only image exists (for testing)
        if (reviewImage || reviewText || reviewName) {
            const reviewData = {
                id: i,
                image: reviewImage || IMAGE, // Fallback to default image
                rating: parseInt(reviewRating) || 5, // Convert to number, fallback to 5
                text: reviewText || "Amazing product! Highly recommended.", // Temporary fallback
                name: reviewName || "CUSTOMER", // Temporary fallback
                verified: reviewVerified === 'true' || reviewVerified === true // Convert to boolean
            };

            reviews.push(reviewData);
        } else {
            console.log(`⚠️ Skipping review ${i} - no content found`);
        }
    }

    // If no dynamic reviews, use fallback data
    const fallbackReviews = [
        {
            id: 1,
            image: IMAGE,
            rating: 5,
            text: locale === 'fr'
                ? "Laisse mes cheveux magnifiques et brillants, avec une douceur remarquable."
                : "Leaves my hair looking and feeling amazing, with a noticeable shine and softness.",
            name: "ANDREA C.",
            verified: true
        },
        {
            id: 2,
            image: IMAGE,
            rating: 5,
            text: locale === 'fr'
                ? "Produit incroyable, je le recommande vivement!"
                : "Amazing product, I highly recommend it!",
            name: "MARIE L.",
            verified: true
        },
        {
            id: 3,
            image: IMAGE,
            rating: 4,
            text: locale === 'fr'
                ? "Très satisfaite du résultat, mes cheveux sont plus soyeux."
                : "Very satisfied with the result, my hair is silkier.",
            name: "SOPHIE M.",
            verified: true
        },
        {
            id: 4,
            image: IMAGE,
            rating: 5,
            text: locale === 'fr'
                ? "Qualité exceptionnelle, ça vaut vraiment le prix."
                : "Exceptional quality, it's really worth the price.",
            name: "LISA K.",
            verified: true
        }
    ];

    const displayReviews = reviews.length > 0 ? reviews : fallbackReviews;

    // Star rating component
    const StarRating = ({ rating }) => {
        const numRating = parseInt(rating) || 5; // Ensure it's a number

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
                {/* Show rating number for debugging in development */}
                {process.env.NODE_ENV === 'development' && (
                    <span className="ml-2 text-xs text-gray-500">({numRating})</span>
                )}
            </div>
        );
    };

    // Verified badge icon
    const VerifiedIcon = () => (
        <svg className="w-5 h-5 text-[#542C17] ml-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
    );

    return (
        <div className="customer-reviews-section bg-white py-16">
            <div className="container mx-auto">
                {/*{process.env.NODE_ENV === 'development' && (*/}
                {/*    <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded">*/}
                {/*        <p className="text-sm text-yellow-800">*/}
                {/*            <strong>Debug:</strong> Found {reviews.length} dynamic reviews, using {displayReviews.length} total reviews*/}
                {/*        </p>*/}
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

                    {/* Right side - Reviews Grid */}
                    <div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {displayReviews.map((review) => (
                                <div key={review.id} className="review-card">
                                    {/* Review Image */}
                                    <div className="mb-4 relative">
                                        {/* ADD DEBUGGING FOR IMAGE */}
                                        <img
                                            src={review.image}
                                            alt={`Review by ${review.name}`}
                                            className="w-full h-40 object-cover rounded-lg"
                                            loading="lazy"
                                            onLoad={() => console.log(`✅ Image loaded successfully: ${review.image}`)}
                                            onError={(e) => {
                                                console.error(`❌ Image failed to load: ${review.image}`);
                                                console.error('Error details:', e);
                                                // Fallback to default image
                                                e.target.src = IMAGE;
                                            }}
                                        />
                                    </div>

                                    <StarRating rating={review.rating} />

                                    <p className="text-sm font-poppins text-gray-700 mb-4 leading-relaxed">
                                        "{review.text}"
                                    </p>

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