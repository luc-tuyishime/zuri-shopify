import {CartForm, Money} from '@shopify/hydrogen';
import {useRef} from 'react';
import { useLocale } from '~/hooks/useLocale';

/**
 * @param {CartSummaryProps}
 */
export function CartSummary({cart, layout}) {
    const [locale] = useLocale();
    const className = layout === 'page'
        ? 'cart-summary-page max-w-md mx-auto'
        : 'cart-summary-aside';

    console.log('=== CART DETAILS ===', cart);


    return (
        <div aria-labelledby="cart-summary" className={`${className} bg-white rounded-lg shadow-sm border p-6`}>
            <h4 className="text-xl font-semibold text-gray-900 mb-6 border-b border-gray-200 pb-4">
                {locale === 'fr' ? 'Totaux' : 'Totals'}
            </h4>

            <dl className="space-y-4 mb-6">
                <div className="flex justify-between items-center">
                    <dt className="text-gray-600 font-medium">
                        {locale === 'fr' ? 'Sous-total' : 'Subtotal'}
                    </dt>
                    <dd className="text-lg font-semibold text-gray-900">
                        {cart.cost?.subtotalAmount?.amount ? (
                            <Money data={cart.cost?.subtotalAmount} />
                        ) : (
                            '€0.00'
                        )}
                    </dd>
                </div>
            </dl>

            <CartDiscounts discountCodes={cart.discountCodes} />
            <CartGiftCard giftCardCodes={cart.appliedGiftCards} />
            <CartCheckoutActions checkoutUrl={cart.checkoutUrl} />
        </div>
    );
}

/**
 * @param {{checkoutUrl?: string}}
 */
function CartCheckoutActions({checkoutUrl}) {
    const [locale] = useLocale();

    if (!checkoutUrl) return null;

    return (
        <div className="mt-6 pt-6 border-t border-gray-200">
            <a
                href={checkoutUrl}
                target="_self"
                className="block w-full bg-[#8B4513] text-white text-center py-3 px-6 rounded-lg font-medium hover:bg-[#7A3A0F] transition-colors duration-200"
            >
                {locale === 'fr' ? 'Continuer vers le paiement' : 'Continue to Checkout'} →
            </a>
        </div>
    );
}

/**
 * @param {{
 *   discountCodes?: CartApiQueryFragment['discountCodes'];
 * }}
 */
function CartDiscounts({discountCodes}) {
    const [locale] = useLocale();
    const codes =
        discountCodes
            ?.filter((discount) => discount.applicable)
            ?.map(({code}) => code) || [];

    return (
        <div className="mb-6">
            {/* Have existing discount, display it with a remove option */}
            <div className={`${codes.length ? 'block' : 'hidden'} mb-4`}>
                <div className="flex justify-between items-center">
                    <dt className="text-gray-600 font-medium">
                        {locale === 'fr' ? 'Réduction(s)' : 'Discount(s)'}
                    </dt>
                    <UpdateDiscountForm>
                        <div className="flex items-center space-x-2">
                            <code className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-mono">
                                {codes?.join(', ')}
                            </code>
                            <button
                                type="submit"
                                className="text-red-600 hover:text-red-800 text-sm font-medium"
                            >
                                {locale === 'fr' ? 'Supprimer' : 'Remove'}
                            </button>
                        </div>
                    </UpdateDiscountForm>
                </div>
            </div>

            {/* Show an input to apply a discount */}
            <UpdateDiscountForm discountCodes={codes}>
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                        {locale === 'fr' ? 'Code de réduction' : 'Discount code'}
                    </label>
                    <div className="flex space-x-2">
                        <input
                            type="text"
                            name="discountCode"
                            placeholder={locale === 'fr' ? 'Code de réduction' : 'Discount code'}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8B4513] focus:border-[#8B4513] text-sm"
                        />
                        <button
                            type="submit"
                            className="px-4 py-2 bg-gray-100 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-[#8B4513] font-medium text-sm transition-colors duration-200"
                        >
                            {locale === 'fr' ? 'Appliquer' : 'Apply'}
                        </button>
                    </div>
                </div>
            </UpdateDiscountForm>
        </div>
    );
}

/**
 * @param {{
 *   discountCodes?: string[];
 *   children: React.ReactNode;
 * }}
 */
function UpdateDiscountForm({discountCodes, children}) {
    return (
        <CartForm
            route="/cart"
            action={CartForm.ACTIONS.DiscountCodesUpdate}
            inputs={{
                discountCodes: discountCodes || [],
            }}
        >
            {children}
        </CartForm>
    );
}

/**
 * @param {{
 *   giftCardCodes: CartApiQueryFragment['appliedGiftCards'] | undefined;
 * }}
 */
function CartGiftCard({giftCardCodes}) {
    const [locale] = useLocale();
    const appliedGiftCardCodes = useRef([]);
    const giftCardCodeInput = useRef(null);
    const codes =
        giftCardCodes?.map(({lastCharacters}) => `***${lastCharacters}`) || [];

    function saveAppliedCode(code) {
        const formattedCode = code.replace(/\s/g, ''); // Remove spaces
        if (!appliedGiftCardCodes.current.includes(formattedCode)) {
            appliedGiftCardCodes.current.push(formattedCode);
        }
        giftCardCodeInput.current.value = '';
    }

    function removeAppliedCode() {
        appliedGiftCardCodes.current = [];
    }

    return (
        <div className="mb-6">
            {/* Have existing gift card applied, display it with a remove option */}
            <div className={`${codes.length ? 'block' : 'hidden'} mb-4`}>
                <div className="flex justify-between items-center">
                    <dt className="text-gray-600 font-medium">
                        {locale === 'fr' ? 'Carte(s) cadeau appliquée(s)' : 'Applied Gift Card(s)'}
                    </dt>
                    <UpdateGiftCardForm>
                        <div className="flex items-center space-x-2">
                            <code className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-mono">
                                {codes?.join(', ')}
                            </code>
                            <button
                                onSubmit={() => removeAppliedCode}
                                className="text-red-600 hover:text-red-800 text-sm font-medium"
                            >
                                {locale === 'fr' ? 'Supprimer' : 'Remove'}
                            </button>
                        </div>
                    </UpdateGiftCardForm>
                </div>
            </div>

            {/* Show an input to apply a gift card */}
            <UpdateGiftCardForm
                giftCardCodes={appliedGiftCardCodes.current}
                saveAppliedCode={saveAppliedCode}
            >
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                        {locale === 'fr' ? 'Code de carte cadeau' : 'Gift card code'}
                    </label>
                    <div className="flex space-x-2">
                        <input
                            type="text"
                            name="giftCardCode"
                            placeholder={locale === 'fr' ? 'Code de carte cadeau' : 'Gift card code'}
                            ref={giftCardCodeInput}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8B4513] focus:border-[#8B4513] text-sm"
                        />
                        <button
                            type="submit"
                            className="px-4 py-2 bg-gray-100 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-[#8B4513] font-medium text-sm transition-colors duration-200"
                        >
                            {locale === 'fr' ? 'Appliquer' : 'Apply'}
                        </button>
                    </div>
                </div>
            </UpdateGiftCardForm>
        </div>
    );
}

/**
 * @param {{
 *   giftCardCodes?: string[];
 *   saveAppliedCode?: (code: string) => void;
 *   removeAppliedCode?: () => void;
 *   children: React.ReactNode;
 * }}
 */
function UpdateGiftCardForm({giftCardCodes, saveAppliedCode, children}) {
    return (
        <CartForm
            route="/cart"
            action={CartForm.ACTIONS.GiftCardCodesUpdate}
            inputs={{
                giftCardCodes: giftCardCodes || [],
            }}
        >
            {(fetcher) => {
                const code = fetcher.formData?.get('giftCardCode');
                if (code && saveAppliedCode) {
                    saveAppliedCode(code);
                }
                return children;
            }}
        </CartForm>
    );
}

/**
 * @typedef {{
 *   cart: OptimisticCart<CartApiQueryFragment | null>;
 *   layout: CartLayout;
 * }} CartSummaryProps
 */

/** @typedef {import('storefrontapi.generated').CartApiQueryFragment} CartApiQueryFragment */
/** @typedef {import('~/components/CartMain').CartLayout} CartLayout */
/** @typedef {import('@shopify/hydrogen').OptimisticCart} OptimisticCart */