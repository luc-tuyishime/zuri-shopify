import {Image} from '@shopify/hydrogen';
import {memo} from "react";

/**
 * @param {{
 *   image: ProductVariantFragment['image'];
 * }}
 */
export const ProductImage = memo(({ image, isSelected, onSelect, onZoom, index }) => {
  if (!image) {
    return <div className="product-image" />;
  }
  return (
    <div className="product-image" onClick={() => {
        if (onZoom) {
            onZoom(); // Opens modal
        } else {
            onSelect(index); // Just selects image
        }
    }}>
      <Image
        alt={image.altText || 'Product Image'}
        aspectRatio="1/1"
        data={image}
        key={image.id}
        sizes="(min-width: 45em) 50vw, 100vw"
      />
    </div>
  );
})

/** @typedef {import('storefrontapi.generated').ProductVariantFragment} ProductVariantFragment */
