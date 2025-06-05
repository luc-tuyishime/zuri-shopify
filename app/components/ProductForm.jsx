import {Link, useNavigate} from '@remix-run/react';
import {AddToCartButton} from './AddToCartButton';
import {useAside} from './Aside';
import { useLocale } from '~/hooks/useLocale';

/**
 * @param {{
 *   productOptions: MappedProductOptions[];
 *   selectedVariant: ProductFragment['selectedOrFirstAvailableVariant'];
 * }}
 */
export function ProductForm({productOptions, selectedVariant}) {
    const navigate = useNavigate();
    const {open} = useAside();
    const [locale] = useLocale();

    return (
        <div className="product-form space-y-6">
            {/*{productOptions.map((option) => {*/}
            {/*    // If there is only a single value in the option values, don't display the option*/}
            {/*    if (option.optionValues.length === 1) return null;*/}

            {/*    return (*/}
            {/*        <div className="product-options" key={option.name}>*/}
            {/*            <h5 className="text-sm font-medium text-gray-900 mb-3">*/}
            {/*                {option.name}*/}
            {/*            </h5>*/}
            {/*            <div className="flex flex-wrap gap-2">*/}
            {/*                {option.optionValues.map((value) => {*/}
            {/*                    const {*/}
            {/*                        name,*/}
            {/*                        handle,*/}
            {/*                        variantUriQuery,*/}
            {/*                        selected,*/}
            {/*                        available,*/}
            {/*                        exists,*/}
            {/*                        isDifferentProduct,*/}
            {/*                        swatch,*/}
            {/*                    } = value;*/}

            {/*                    const buttonClass = `*/}
            {/*      px-4 py-2 border rounded-md text-sm font-medium transition-all duration-200*/}
            {/*      ${selected*/}
            {/*                        ? 'border-[#8B4513] bg-[#8B4513] text-white'*/}
            {/*                        : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'*/}
            {/*                    }*/}
            {/*      ${!available ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}*/}
            {/*      ${exists && !selected ? 'hover:bg-gray-50' : ''}*/}
            {/*    `;*/}

            {/*                    if (isDifferentProduct) {*/}
            {/*                        // SEO*/}
            {/*                        // When the variant is a combined listing child product*/}
            {/*                        // that leads to a different url, we need to render it*/}
            {/*                        // as an anchor tag*/}
            {/*                        return (*/}
            {/*                            <Link*/}
            {/*                                className={buttonClass}*/}
            {/*                                key={option.name + name}*/}
            {/*                                prefetch="intent"*/}
            {/*                                preventScrollReset*/}
            {/*                                replace*/}
            {/*                                to={`/products/${handle}?${variantUriQuery}`}*/}
            {/*                            >*/}
            {/*                                <ProductOptionSwatch swatch={swatch} name={name} />*/}
            {/*                            </Link>*/}
            {/*                        );*/}
            {/*                    } else {*/}
            {/*                        // SEO*/}
            {/*                        // When the variant is an update to the search param,*/}
            {/*                        // render it as a button with javascript navigating to*/}
            {/*                        // the variant so that SEO bots do not index these as*/}
            {/*                        // duplicated links*/}
            {/*                        return (*/}
            {/*                            <button*/}
            {/*                                type="button"*/}
            {/*                                className={buttonClass}*/}
            {/*                                key={option.name + name}*/}
            {/*                                disabled={!exists}*/}
            {/*                                onClick={() => {*/}
            {/*                                    if (!selected) {*/}
            {/*                                        navigate(`?${variantUriQuery}`, {*/}
            {/*                                            replace: true,*/}
            {/*                                            preventScrollReset: true,*/}
            {/*                                        });*/}
            {/*                                    }*/}
            {/*                                }}*/}
            {/*                            >*/}
            {/*                                <ProductOptionSwatch swatch={swatch} name={name} />*/}
            {/*                            </button>*/}
            {/*                        );*/}
            {/*                    }*/}
            {/*                })}*/}
            {/*            </div>*/}
            {/*        </div>*/}
            {/*    );*/}
            {/*})}*/}

            {/* Styled Add to Cart Button */}
            <div className={`mt-8 py-3 px-6 rounded-md font-medium text-white transition-colors duration-200
            ${selectedVariant?.availableForSale
                ? 'bg-[#8B4513] hover:bg-[#7A3A0F] focus:ring-2 focus:ring-[#8B4513] focus:ring-offset-2'
                : 'bg-gray-400 cursor-not-allowed'
            }`}>
                <AddToCartButton
                    disabled={!selectedVariant || !selectedVariant.availableForSale}
                    onClick={() => {
                        open('cart');
                    }}


                    lines={
                        selectedVariant
                            ? [
                                {
                                    merchandiseId: selectedVariant.id,
                                    quantity: 1,
                                    selectedVariant,
                                },
                            ]
                            : []
                    }

                >
                    {selectedVariant?.availableForSale
                        ? (locale === 'fr' ? 'Ajouter au panier' : 'Add to cart')
                        : (locale === 'fr' ? 'Épuisé' : 'Sold out')
                    }
                </AddToCartButton>
            </div>
        </div>
    );
}

/**
 * @param {{
 *   swatch?: Maybe<ProductOptionValueSwatch> | undefined;
 *   name: string;
 * }}
 */
function ProductOptionSwatch({swatch, name}) {
    const image = swatch?.image?.previewImage?.url;
    const color = swatch?.color;

    if (!image && !color) return name;

    return (
        <div
            aria-label={name}
            className="flex items-center justify-center"
            style={{
                backgroundColor: color || 'transparent',
            }}
        >
            {!!image && (
                <img
                    src={image}
                    alt={name}
                    className="w-6 h-6 rounded-full object-cover"
                />
            )}
            {color && !image && (
                <div
                    className="w-6 h-6 rounded-full border border-gray-300"
                    style={{ backgroundColor: color }}
                />
            )}
            {!color && !image && <span>{name}</span>}
        </div>
    );
}

/** @typedef {import('@shopify/hydrogen').MappedProductOptions} MappedProductOptions */
/** @typedef {import('@shopify/hydrogen/storefront-api-types').Maybe} Maybe */
/** @typedef {import('@shopify/hydrogen/storefront-api-types').ProductOptionValueSwatch} ProductOptionValueSwatch */
/** @typedef {import('storefrontapi.generated').ProductFragment} ProductFragment */