import {Money} from '@shopify/hydrogen';

/**
 * @param {{
 *   price?: MoneyV2;
 *   compareAtPrice?: MoneyV2 | null;
 * }}
 */
export function ProductPrice({price, compareAtPrice}) {
  // Force EUR display regardless of stored currency
  const formatAsEUR = (priceData) => {
    if (!priceData) return null;
    return `€${parseFloat(priceData.amount).toFixed(2)}`;
  };

  return (
      <div className="product-price">
        {compareAtPrice ? (
            <div className="product-price-on-sale">
              {price ? <span>{formatAsEUR(price)}</span> : null}
              <s>
                <span>{formatAsEUR(compareAtPrice)}</span>
              </s>
            </div>
        ) : price ? (
            <span>{formatAsEUR(price)}</span>
        ) : (
            <span>&nbsp;</span>
        )}
      </div>
  );
}

/** @typedef {import('@shopify/hydrogen/storefront-api-types').MoneyV2} MoneyV2 */
