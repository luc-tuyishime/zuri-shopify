import {CartForm, Image} from '@shopify/hydrogen';
import {useVariantUrl} from '~/lib/variants';
import {Link} from '@remix-run/react';
import {ProductPrice} from './ProductPrice';
import {useAside} from './Aside';
import { useLocale } from '~/hooks/useLocale';

/**
 * A single line item in the cart. It displays the product image, title, price.
 * It also provides controls to update the quantity or remove the line item.
 * @param {{
 *   layout: CartLayout;
 *   line: CartLine;
 * }}
 */
export function CartLineItem({layout, line}) {
    const {id, merchandise} = line;
    const {product, title, image, selectedOptions} = merchandise;
    const lineItemUrl = useVariantUrl(product.handle, selectedOptions);
    const {close} = useAside();
    const [locale] = useLocale();

    return (
        // ✅ Changed from <li> to <div>
        <div className="flex items-start space-x-4 py-6 border-b border-gray-200 last:border-b-0">
            {/* Product Image */}
            {image && (
                <div className="flex-shrink-0">
                    <Image
                        alt={title}
                        aspectRatio="1/1"
                        data={image}
                        height={80}
                        loading="lazy"
                        width={80}
                        className="rounded-lg object-cover"
                    />
                </div>
            )}

            {/* Product Details */}
            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                    <div className="flex-1">
                        <Link
                            prefetch="intent"
                            to={lineItemUrl}
                            onClick={() => {
                                if (layout === 'aside') {
                                    close();
                                }
                            }}
                            className="text-gray-900 hover:text-[#8B4513] transition-colors duration-200"
                        >
                            <h3 className="font-medium text-sm line-clamp-2">
                                {product.title}
                            </h3>
                        </Link>

                        {/* Product Options */}
                        {selectedOptions.length > 0 && (
                            <div className="mt-1 space-y-1">
                                {selectedOptions.map((option) => (
                                    <p key={option.name} className="text-xs text-gray-500">
                                        {option.name}: <span className="font-medium">{option.value}</span>
                                    </p>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Price */}
                    <div className="text-right ml-4">
                        <div className="font-semibold text-gray-900">
                            <ProductPrice price={line?.cost?.totalAmount} />
                        </div>
                    </div>
                </div>

                {/* Quantity Controls */}
                <div className="mt-4 flex items-center justify-between">
                    <CartLineQuantity line={line} />
                    <CartLineRemoveButton
                        lineIds={[id]}
                        disabled={!!line.isOptimistic}
                    />
                </div>
            </div>
        </div>
    );
}

/**
 * Provides the controls to update the quantity of a line item in the cart.
 * These controls are disabled when the line item is new, and the server
 * hasn't yet responded that it was successfully added to the cart.
 * @param {{line: CartLine}}
 */
function CartLineQuantity({line}) {
    const [locale] = useLocale();

    if (!line || typeof line?.quantity === 'undefined') return null;
    const {id: lineId, quantity, isOptimistic} = line;
    const prevQuantity = Number(Math.max(0, quantity - 1).toFixed(0));
    const nextQuantity = Number((quantity + 1).toFixed(0));

    return (
        <div className="flex items-center">
      <span className="text-sm text-gray-600 mr-3">
        {locale === 'fr' ? 'Quantité:' : 'Quantity:'}
      </span>

            {/* Quantity Controls - Styled like your screenshot */}
            <div className="flex items-center border border-gray-300 rounded-lg bg-white">
                <CartLineUpdateButton lines={[{id: lineId, quantity: prevQuantity}]}>
                    <button
                        id={`decrease-${lineId}`}
                        aria-label={locale === 'fr' ? 'Diminuer la quantité' : 'Decrease quantity'}
                        disabled={quantity <= 1 || !!isOptimistic}
                        name="decrease-quantity"
                        value={prevQuantity}
                        type="submit"
                        className="w-10 h-10 flex items-center justify-center text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-l-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <span className="text-lg font-medium">−</span>
                    </button>
                </CartLineUpdateButton>

                <div className="w-12 h-10 flex items-center justify-center border-x border-gray-300 bg-white">
                    <span className="text-sm font-medium text-gray-900">{quantity}</span>
                </div>

                <CartLineUpdateButton lines={[{id: lineId, quantity: nextQuantity}]}>
                    <button
                        id={`increase-${lineId}`}
                        aria-label={locale === 'fr' ? 'Augmenter la quantité' : 'Increase quantity'}
                        name="increase-quantity"
                        value={nextQuantity}
                        disabled={!!isOptimistic}
                        type="submit"
                        className="w-10 h-10 flex items-center justify-center text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-r-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <span className="text-lg font-medium">+</span>
                    </button>
                </CartLineUpdateButton>
            </div>
        </div>
    );
}

/**
 * A button that removes a line item from the cart. It is disabled
 * when the line item is new, and the server hasn't yet responded
 * that it was successfully added to the cart.
 * @param {{
 *   lineIds: string[];
 *   disabled: boolean;
 * }}
 */
function CartLineRemoveButton({lineIds, disabled}) {
    const [locale] = useLocale();

    return (
        <CartForm
            fetcherKey={getUpdateKey(lineIds)}
            route="/cart"
            action={CartForm.ACTIONS.LinesRemove}
            inputs={{lineIds}}
        >
            <button
                id={`remove-${lineIds[0]}`}
                disabled={disabled}
                type="submit"
                className="text-sm text-red-600 hover:text-red-800 font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {locale === 'fr' ? 'Supprimer' : 'Remove'}
            </button>
        </CartForm>
    );
}

/**
 * @param {{
 *   children: React.ReactNode;
 *   lines: CartLineUpdateInput[];
 * }}
 */
function CartLineUpdateButton({children, lines}) {
    const lineIds = lines.map((line) => line.id);

    return (
        <CartForm
            fetcherKey={getUpdateKey(lineIds)}
            route="/cart"
            action={CartForm.ACTIONS.LinesUpdate}
            inputs={{lines}}
        >
            {children}
        </CartForm>
    );
}

/**
 * Returns a unique key for the update action. This is used to make sure actions modifying the same line
 * items are not run concurrently, but cancel each other. For example, if the user clicks "Increase quantity"
 * and "Decrease quantity" in rapid succession, the actions will cancel each other and only the last one will run.
 * @returns
 * @param {string[]} lineIds - line ids affected by the update
 */
function getUpdateKey(lineIds) {
    return [CartForm.ACTIONS.LinesUpdate, ...lineIds].join('-');
}

/** @typedef {OptimisticCartLine<CartApiQueryFragment>} CartLine */

/** @typedef {import('@shopify/hydrogen/storefront-api-types').CartLineUpdateInput} CartLineUpdateInput */
/** @typedef {import('~/components/CartMain').CartLayout} CartLayout */
/** @typedef {import('@shopify/hydrogen').OptimisticCartLine} OptimisticCartLine */
/** @typedef {import('storefrontapi.generated').CartApiQueryFragment} CartApiQueryFragment */