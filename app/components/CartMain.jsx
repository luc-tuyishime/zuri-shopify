import {useOptimisticCart} from '@shopify/hydrogen';
import {Link} from '@remix-run/react';
import {useAside} from '~/components/Aside';
import { useLocale } from '~/hooks/useLocale';
import {CartLineItem} from '~/components/CartLineItem';
import {CartSummary} from './CartSummary';
import { useEffect, useRef, useState } from 'react';

function CartSummaryGrid({cart, locale}) {
    const {close} = useAside();

    return (
        <div className="h-full flex flex-col">
            <div className="flex-1 space-y-4 md:space-y-6">
                <h3 className="text-lg md:text-xl font-bold text-gray-900">
                    {locale === 'fr' ? 'Totaux' : 'Totals'}
                </h3>

                {/* Subtotal */}
                <div className="flex justify-between items-center text-base md:text-lg">
                    <span className="text-gray-700">
                        {locale === 'fr' ? 'Sous-total' : 'Subtotal'}
                    </span>
                    <span className="font-semibold text-gray-900">
                        {cart?.cost?.subtotalAmount?.amount ?
                            `€${parseFloat(cart.cost.subtotalAmount.amount).toLocaleString('fr-FR', {minimumFractionDigits: 2})}`
                            : '€0.00'
                        }
                    </span>
                </div>

                {/* Shipping */}
                <div className="flex justify-between items-center text-xs md:text-sm text-gray-600">
                    <span>{locale === 'fr' ? 'Livraison' : 'Shipping'}</span>
                    <span>
                        {locale === 'fr' ? 'Calculée à l\'étape suivante' : 'Calculated at next step'}
                    </span>
                </div>

                <hr className="border-gray-200" />

                {/* Discount Code Section */}
                <div className="space-y-2 md:space-y-3">
                    <h4 className="text-sm md:text-base font-medium text-gray-900">
                        {locale === 'fr' ? 'Code de réduction' : 'Discount code'}
                    </h4>
                    <div className="flex flex-col sm:flex-row gap-2">
                        <input
                            type="text"
                            placeholder={locale === 'fr' ? 'Code de réduction' : 'Discount code'}
                            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B4513] focus:border-transparent"
                        />
                        <button className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium whitespace-nowrap">
                            {locale === 'fr' ? 'Appliquer' : 'Apply'}
                        </button>
                    </div>
                </div>

                {/* Gift Card Section */}
                <div className="space-y-2 md:space-y-3">
                    <h4 className="text-sm md:text-base font-medium text-gray-900">
                        {locale === 'fr' ? 'Code de carte cadeau' : 'Gift card code'}
                    </h4>
                    <div className="flex flex-col sm:flex-row gap-2">
                        <input
                            type="text"
                            placeholder={locale === 'fr' ? 'Code de carte cadeau' : 'Gift card code'}
                            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B4513] focus:border-transparent"
                        />
                        <button className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium whitespace-nowrap">
                            {locale === 'fr' ? 'Appliquer' : 'Apply'}
                        </button>
                    </div>
                </div>

                <hr className="border-gray-200" />

                {/* Total */}
                <div className="flex justify-between items-center text-lg md:text-xl font-bold">
                    <span>{locale === 'fr' ? 'Total' : 'Total'}</span>
                    <span>
                        {cart?.cost?.totalAmount?.amount ?
                            `€${parseFloat(cart.cost.totalAmount.amount).toLocaleString('fr-FR', {minimumFractionDigits: 2})}`
                            : '€0.00'
                        }
                    </span>
                </div>
            </div>

            <div className="flex-shrink-0 pt-4 md:pt-6 border-t border-gray-200">
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();

                        console.log('Going to Shopify checkout...');
                        console.log('Cart checkout URL:', cart?.checkoutUrl);

                        close();

                        setTimeout(() => {
                            if (cart?.checkoutUrl) {
                                window.location.href = cart.checkoutUrl;
                            } else {
                                console.error('No checkout URL found in cart');
                            }
                        }, 100);
                    }}

                    className="w-full py-3 md:py-4 bg-[#8B4513] text-white font-semibold rounded-lg hover:bg-[#A0522D] transition-colors text-base md:text-lg flex items-center justify-center gap-2"
                >
                    {locale === 'fr' ? 'Continuer vers le paiement' : 'Continue to payment'}
                    <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            </div>
        </div>
    );
}

export function CartMain({layout, cart: originalCart}) {
    const cart = useOptimisticCart(originalCart);
    const [locale] = useLocale();
    const {close} = useAside();

    const linesCount = cart?.lines?.nodes?.length || 0;
    const totalQuantity = cart?.totalQuantity || 0;
    const cartHasItems = totalQuantity > 0;

    return (
        <div className="h-full w-full bg-white flex flex-col">
            {/* ✅ Cart Header - Full Width - Responsive */}
            <div className="px-4 md:px-8 py-3 md:py-4 border-b border-gray-200 bg-white flex-shrink-0">
                <div className="flex items-center justify-between max-w-7xl mx-auto">
                    <h2 className="text-xl md:text-2xl font-bold text-gray-900">
                        {locale === 'fr' ? 'Panier' : 'Shopping Cart'}
                    </h2>
                    <div className="flex items-center gap-3 md:gap-6">
                        <div className="text-sm md:text-lg text-gray-600">
                            {linesCount > 0 && (
                                <span>
                                    {linesCount} {linesCount === 1
                                    ? (locale === 'fr' ? 'article' : 'item')
                                    : (locale === 'fr' ? 'articles' : 'items')
                                } ({totalQuantity} {locale === 'fr' ? 'unités' : 'units'})
                                </span>
                            )}
                        </div>
                        <button
                            onClick={close}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            type="button"
                        >
                            <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* ✅ Main Content - Responsive Layout */}
            {!cartHasItems ? (
                <CartEmpty layout={layout} />
            ) : (
                <div className="flex-1 flex flex-col lg:flex-row max-w-7xl mx-auto w-full min-h-0">
                    {/* LEFT SIDE - Products Grid (Scrollable) */}
                    <div className="flex-1 p-4 md:p-8 overflow-y-auto">
                        <div className="mb-4 md:mb-6">
                            <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-4">
                                {locale === 'fr' ? 'Vos articles' : 'Your Items'}
                            </h3>

                            {/*  Enhanced Debug info */}
                            {/*<div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm">*/}
                            {/*    <strong>Debug:</strong> Rendering {cart?.lines?.nodes?.length || 0} unique line items*/}
                            {/*    <br/>*/}
                            {/*    <strong>Total Quantity:</strong> {totalQuantity} units*/}
                            {/*    <br/>*/}
                            {/*    <strong>Note:</strong> Same products are consolidated into one line item with increased quantity*/}
                            {/*</div>*/}
                        </div>

                        {/* ✅ Products Grid - Responsive */}
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-4 md:gap-6">
                            {(cart?.lines?.nodes ?? []).map((line, index) => {
                                return (
                                    <div key={line.id} className="bg-white border border-gray-200 rounded-lg p-4 md:p-6 hover:shadow-md transition-shadow">
                                        {/* Debug indicator */}
                                        {/*<div className="text-xs text-gray-500 mb-3 font-mono bg-blue-50 p-2 rounded">*/}
                                        {/*    <strong>Item #{index + 1}:</strong> {line.merchandise?.product?.title}<br/>*/}
                                        {/*    <strong>Quantity:</strong> {line.quantity}<br/>*/}
                                        {/*    <strong>Variant:</strong> {line.merchandise?.id?.split('/').pop()}*/}
                                        {/*</div>*/}

                                        <CartLineItem
                                            line={line}
                                            layout="grid"
                                        />
                                    </div>
                                );
                            })}
                        </div>

                        {/* Extra space at bottom */}
                        <div className="h-16 md:h-20"></div>
                    </div>

                    {/* ✅ RIGHT SIDE - Order Summary - Normal on desktop, fixed bottom on mobile */}
                    <div className="w-full lg:w-96 bg-gray-50 border-t lg:border-t-0 lg:border-l border-gray-200 flex-shrink-0 mobile-summary">
                        <div className="p-4 md:p-8 h-full flex flex-col">
                            <CartSummaryGrid cart={cart} locale={locale} />
                        </div>
                    </div>
                </div>
            )}

            {/* ✅ Mobile-specific styles - ONLY affects mobile, desktop unchanged */}
            <style dangerouslySetInnerHTML={{
                __html: `
                /* MOBILE ONLY: Products take full height, summary fixed at bottom */
                @media (max-width: 1023px) {
                    /* Products area: Add bottom padding for summary clearance */
                    .flex-1.overflow-y-auto {
                        padding-bottom: 200px !important;
                    }
                    
                    /* Summary: Fixed bottom sheet on mobile ONLY */
                    .mobile-summary {
                        position: fixed !important;
                        bottom: 0 !important;
                        left: 0 !important;
                        right: 0 !important;
                        z-index: 50 !important;
                        background: white !important;
                        border-top: 2px solid #e5e7eb !important;
                        border-left: none !important;
                        max-height: 180px !important;
                        overflow-y: auto !important;
                        box-shadow: 0 -4px 6px -1px rgba(0, 0, 0, 0.1) !important;
                    }
                }
                
                /* DESKTOP: Keep everything exactly as it was */
                @media (min-width: 1024px) {
                    /* Ensure desktop styles are preserved */
                    .mobile-summary {
                        position: relative !important;
                        bottom: auto !important;
                        left: auto !important;
                        right: auto !important;
                        z-index: auto !important;
                        box-shadow: none !important;
                        max-height: none !important;
                        background: rgb(249 250 251) !important; /* bg-gray-50 */
                        border-top: none !important;
                        border-left: 1px solid rgb(229 231 235) !important; /* border-gray-200 */
                    }
                    
                    .flex-1.overflow-y-auto {
                        padding-bottom: 20px !important;
                    }
                }
                
                /* Touch targets */
                @media (max-width: 768px) {
                    button {
                        min-height: 44px;
                    }
                    
                    input {
                        min-height: 44px;
                    }
                }
                
                /* Scrollbar styling */
                .overflow-y-auto::-webkit-scrollbar {
                    width: 4px;
                }
                
                .overflow-y-auto::-webkit-scrollbar-track {
                    background: #f1f1f1;
                }
                
                .overflow-y-auto::-webkit-scrollbar-thumb {
                    background: #c1c1c1;
                    border-radius: 2px;
                }
                
                /* Smooth scrolling */
                .overflow-y-auto {
                    scroll-behavior: smooth;
                    -webkit-overflow-scrolling: touch;
                }
                `
            }} />
        </div>
    );
}

function CartEmpty({hidden = false, layout}) {
    const [locale] = useLocale();
    const {close} = useAside();

    return (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-8 md:py-16 px-4 md:px-8">
            {/* Empty cart icon */}
            <div className="mb-4 md:mb-6 text-gray-300">
                <svg className="w-16 h-16 md:w-24 md:h-24 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17M17 13v4a2 2 0 01-2 2H9a2 2 0 01-2-2v-4m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                </svg>
            </div>

            <h3 className="text-xl md:text-2xl font-medium text-gray-900 mb-3 md:mb-4">
                {locale === 'fr' ? 'Votre panier est vide' : 'Your cart is empty'}
            </h3>

            <p className="text-gray-600 text-base md:text-lg mb-6 md:mb-8 max-w-md">
                {locale === 'fr'
                    ? "Il semble que vous n'ayez encore rien ajouté, commençons !"
                    : "Looks like you haven't added anything yet, let's get you started!"
                }
            </p>

            <Link
                to="/collections/all"
                onClick={close}
                prefetch="viewport"
                className="inline-flex items-center px-6 md:px-8 py-3 md:py-4 bg-[#8B4513] text-white font-medium rounded-lg hover:bg-[#A0522D] transition-colors text-base md:text-lg"
            >
                {locale === 'fr' ? 'Continuer les achats' : 'Continue shopping'}
                <svg className="ml-2 md:ml-3 w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
            </Link>
        </div>
    );
}