import {Link, useLoaderData} from '@remix-run/react';

/**
 * @type {MetaFunction<typeof loader>}
 */
export const meta = ({data}) => {
    return [{title: `Zuri | ${data?.policy.title ?? ''}`}];
};

/**
 * @param {LoaderFunctionArgs}
 */
export async function loader({params, context}) {
    if (!params.handle) {
        throw new Response('No handle was passed in', {status: 404});
    }

    const policyName = params.handle.replace(/-([a-z])/g, (_, m1) =>
        m1.toUpperCase(),
    );

    const data = await context.storefront.query(POLICY_CONTENT_QUERY, {
        variables: {
            privacyPolicy: false,
            shippingPolicy: false,
            termsOfService: false,
            refundPolicy: false,
            [policyName]: true,
            language: context.storefront.i18n?.language,
        },
    });

    const policy = data.shop?.[policyName];

    if (!policy) {
        throw new Response('Could not find the policy', {status: 404});
    }

    return {policy};
}

export default function Policy() {
    /** @type {LoaderReturnData} */
    const {policy} = useLoaderData();

    return (
        <div className="min-h-screen bg-gray-50 py-8 md:py-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <br/>
                <br/>
                {/* Back Navigation */}
                <div className="mb-6 mt-25 md:mb-8">

                </div>

                {/* Policy Content Card */}
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">

                    {/* Header */}
                    <div className="bg-[#5C2E1C] px-6 py-6 md:px-8 md:py-8">
                        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white font-poppins leading-tight">
                            {policy.title}
                        </h1>

                        <Link
                            to="/"
                            className="inline-flex items-center text-[#fff] mt-2 hover:text-[#4A2318] font-medium text-sm md:text-base font-inter transition-colors duration-200"
                        >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            Home
                        </Link>
                    </div>

                    {/* Content */}
                    <div className="px-6 py-8 md:px-8 md:py-12">
                        <div
                            className="policy-content prose prose-lg max-w-none"
                            dangerouslySetInnerHTML={{__html: policy.body}}
                        />
                    </div>
                </div>

                {/* Footer Navigation */}
                <div className="mt-8 text-center">
                    <Link
                        to="/"
                        className="inline-flex items-center justify-center px-6 py-3 bg-[#5C2E1C] hover:bg-[#4A2318] text-white font-medium rounded-lg transition-colors duration-200"
                    >
                        Return to Shopping
                    </Link>
                </div>
            </div>
        </div>
    );
}

// NOTE: https://shopify.dev/docs/api/storefront/latest/objects/Shop
const POLICY_CONTENT_QUERY = `#graphql
  fragment Policy on ShopPolicy {
    body
    handle
    id
    title
    url
  }
  query Policy(
    $country: CountryCode
    $language: LanguageCode
    $privacyPolicy: Boolean!
    $refundPolicy: Boolean!
    $shippingPolicy: Boolean!
    $termsOfService: Boolean!
  ) @inContext(language: $language, country: $country) {
    shop {
      privacyPolicy @include(if: $privacyPolicy) {
        ...Policy
      }
      shippingPolicy @include(if: $shippingPolicy) {
        ...Policy
      }
      termsOfService @include(if: $termsOfService) {
        ...Policy
      }
      refundPolicy @include(if: $refundPolicy) {
        ...Policy
      }
    }
  }
`;

/**
 * @typedef {keyof Pick<
 *   Shop,
 *   'privacyPolicy' | 'shippingPolicy' | 'termsOfService' | 'refundPolicy'
 * >} SelectedPolicies
 */

/** @typedef {import('@shopify/remix-oxygen').LoaderFunctionArgs} LoaderFunctionArgs */
/** @template T @typedef {import('@remix-run/react').MetaFunction<T>} MetaFunction */
/** @typedef {import('@shopify/hydrogen/storefront-api-types').Shop} Shop */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */