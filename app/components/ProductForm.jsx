import {Link, useNavigate} from '@remix-run/react';
import {CartForm} from '@shopify/hydrogen';
import React from 'react';
import {useAside} from './Aside';
import { useLocale } from '~/hooks/useLocale';

/**
 * ProductForm with aggressive full-width styling
 */
export function ProductForm({productOptions, selectedVariant, product}) {
    const navigate = useNavigate();
    const {open} = useAside();
    const [locale] = useLocale();

    const isSoldOut = product?.tags?.includes('sold-out');
    const isDisabled = !selectedVariant || !selectedVariant.availableForSale || isSoldOut;

    const buttonText = !selectedVariant
        ? (locale === 'fr' ? 'Non disponible' : 'Unavailable')
        : isSoldOut
            ? (locale === 'fr' ? 'Épuisé' : 'Sold out')
            : selectedVariant?.availableForSale
                ? (locale === 'fr' ? 'Ajouter au panier' : 'Add to cart')
                : (locale === 'fr' ? 'Épuisé' : 'Sold out');

    // Create CSS to inject into the page
    const injectStyles = () => {
        const styleId = 'product-form-full-width-styles';
        if (document.getElementById(styleId)) return;

        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            .product-form-full-width,
            .product-form-full-width form,
            .product-form-full-width form > *,
            .product-form-full-width button {
                width: 100% !important;
                max-width: none !important;
                display: block !important;
                box-sizing: border-box !important;
            }
        `;
        document.head.appendChild(style);
    };

    // Inject styles when component mounts
    React.useEffect(() => {
        injectStyles();
    }, []);

    return (
        <div className="product-form space-y-6 product-form-full-width">
            <CartForm
                route="/cart"
                inputs={{
                    lines: selectedVariant && !isSoldOut
                        ? [
                            {
                                merchandiseId: selectedVariant.id,
                                quantity: 1,
                                selectedVariant,
                            },
                        ]
                        : []
                }}
                action={CartForm.ACTIONS.LinesAdd}
            >
                {(fetcher) => (
                    <button
                        type="submit"
                        onClick={() => {
                            open('cart');
                        }}
                        disabled={isDisabled || (fetcher.state !== 'idle')}
                        style={{
                            marginTop: '2rem',
                            padding: '1rem 1.5rem',
                            borderRadius: '0.5rem',
                            fontWeight: '600',
                            color: 'white',
                            textAlign: 'center',
                            fontSize: '1.125rem',
                            lineHeight: '1.75rem',
                            transition: 'all 0.2s',
                            transform: 'scale(1)',
                            border: 'none',
                            outline: 'none',
                            cursor: isDisabled ? 'not-allowed' : 'pointer',
                            backgroundColor: isDisabled ? '#9CA3AF' : '#8B4513',
                            boxShadow: isDisabled ? 'none' : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                        }}
                        onMouseEnter={(e) => {
                            if (!isDisabled) {
                                e.target.style.backgroundColor = '#7A3A0F';
                                e.target.style.transform = 'scale(1.02)';
                                e.target.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!isDisabled) {
                                e.target.style.backgroundColor = '#8B4513';
                                e.target.style.transform = 'scale(1)';
                                e.target.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
                            }
                        }}
                        onMouseDown={(e) => {
                            if (!isDisabled) {
                                e.target.style.transform = 'scale(0.95)';
                                e.target.style.backgroundColor = '#6B320C';
                            }
                        }}
                        onMouseUp={(e) => {
                            if (!isDisabled) {
                                e.target.style.transform = 'scale(1.02)';
                                e.target.style.backgroundColor = '#7A3A0F';
                            }
                        }}
                    >
                        {buttonText}
                    </button>
                )}
            </CartForm>
        </div>
    );
}