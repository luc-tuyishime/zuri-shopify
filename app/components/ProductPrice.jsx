import {Money} from '@shopify/hydrogen';

/**
 * @param {{
 *   price?: MoneyV2;
 *   compareAtPrice?: MoneyV2 | null;
 * }}
 */
export function ProductPrice({price, compareAtPrice}) {
  return (
    <div className="product-price">
      {compareAtPrice ? (
        <div className="product-price-on-sale">
          {price ? <Money as="span" data={price} /> : null}
          <s>
            <Money as="span" data={compareAtPrice} />
          </s>
        </div>
      ) : price ? (
        <Money as="span" data={price} />
      ) : (
        <span>&nbsp;</span>
      )}
    </div>
  );
}

/** @typedef {import('@shopify/hydrogen/storefront-api-types').MoneyV2} MoneyV2 */