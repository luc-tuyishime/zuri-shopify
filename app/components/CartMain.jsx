import {useOptimisticCart} from '@shopify/hydrogen';
import {Link} from '@remix-run/react';
import {useAside} from '~/components/Aside';
import { useLocale } from '~/hooks/useLocale';
import {CartLineItem} from '~/components/CartLineItem';
import {CartSummary} from './CartSummary';

/**
 * The main cart component that displays the cart items and summary.
 * It is used by both the /cart route and the cart aside dialog.
 * @param {CartMainProps}
 */
export function CartMain({layout, cart: originalCart}) {
    // The useOptimisticCart hook applies pending actions to the cart
    // so the user immediately sees feedback when they modify the cart.
    const cart = useOptimisticCart(originalCart);

    const linesCount = cart?.lines?.nodes?.length || 0;

    const withDiscount =
        cart &&
        Boolean(cart?.discountCodes?.filter((code) => code.applicable)?.length);
    const className = `cart-main ${withDiscount ? 'with-discount' : ''}`;
    const cartHasItems = cart?.totalQuantity ? cart.totalQuantity > 0 : false;

    return (
        <div className={`${className} px-3 md:px-0`}>
            {!linesCount && <CartEmpty layout={layout} />}
            <div className="cart-details">
                <div aria-labelledby="cart-lines">
                    <ul className="space-y-3 md:space-y-0">
                        {(cart?.lines?.nodes ?? []).map((line) => (
                            <CartLineItem key={line.id} line={line} layout={layout} />
                        ))}
                    </ul>
                </div>
                {cartHasItems && <CartSummary cart={cart} layout={layout} />}
            </div>
        </div>
    );
}

/**
 * @param {{
 *   hidden: boolean;
 *   layout?: CartMainProps['layout'];
 * }}
 */
function CartEmpty({hidden = false}) {
    const [locale] = useLocale();
    const {close} = useAside();
    return (
        <div hidden={hidden} className="flex flex-col items-center justify-center text-center py-8 md:py-12 px-4 md:px-6">
            <p className="text-gray-600 text-base md:text-lg mb-4 md:mb-6 max-w-md">
                {locale === 'fr'
                    ? "Il semble que vous n'ayez encore rien ajouté, commençons !"
                    : "Looks like you haven't added anything yet, let's get you started!"
                }
            </p>
            <Link
                to="/collections/all"
                onClick={close}
                prefetch="viewport"
                className="inline-flex items-center px-4 py-2 md:px-6 md:py-3 bg-[#8B4513] text-white font-medium rounded-lg hover:bg-[#A0522D] transition-colors text-sm md:text-base"
            >
                {locale === 'fr' ? 'Continuer les achats' : 'Continue shopping'} →
            </Link>
        </div>
    );
}

/** @typedef {'page' | 'aside'} CartLayout */
/**
 * @typedef {{
 *   cart: CartApiQueryFragment | null;
 *   layout: CartLayout;
 * }} CartMainProps
 */

/** @typedef {import('storefrontapi.generated').CartApiQueryFragment} CartApiQueryFragment */