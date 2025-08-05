import {CartForm} from '@shopify/hydrogen';

/**
 * @param {{
 *   analytics?: unknown;
 *   children: React.ReactNode;
 *   disabled?: boolean;
 *   lines: Array<OptimisticCartLineInput>;
 *   onClick?: () => void;
 * }}
 */
export function AddToCartButton({
  analytics,
  children,
  disabled,
  lines,
  onClick,
    className,
    style,

                                  ...props
}) {

  const handleClick = (e) => {
    console.log('🛒 Adding to cart:', {
      lines: lines.map(line => ({
        merchandiseId: line.merchandiseId,
        quantity: line.quantity,
        productTitle: line.selectedVariant?.product?.title,
        variantTitle: line.selectedVariant?.title
      }))
    });

    if (onClick) {
      onClick(e);
    }
  };

  return (
    <CartForm route="/cart" inputs={{lines}} action={CartForm.ACTIONS.LinesAdd}>
      {(fetcher) => (
        <>

          <button
            type="submit"
            // onClick={onClick}
            onClick={handleClick}
            className={className}
            style={style}
            disabled={disabled ?? fetcher.state !== 'idle'}
            {...props}
          >
            {children}
          </button>


        </>
      )}
    </CartForm>
  );
}

/** @typedef {import('@remix-run/react').FetcherWithComponents} FetcherWithComponents */
/** @typedef {import('@shopify/hydrogen').OptimisticCartLineInput} OptimisticCartLineInput */
