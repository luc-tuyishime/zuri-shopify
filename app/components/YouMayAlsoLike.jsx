import { ProductItem } from '~/components/ProductItem';
import { useLocale } from '~/hooks/useLocale';

export function YouMayAlsoLike({ products, currentProductId }) {
    const [locale] = useLocale();

    const relatedProducts = products?.nodes
        ?.filter(product => product && product.id && product.id !== currentProductId) // Added null check
        ?.slice(0, 4) || [];


    if (relatedProducts.length === 0) {
        return null;
    }

    return (
        <div className="bg-white py-16">
            <div className="container mx-auto px-4">
                {/* Section Title */}
                <div className="text-center mb-12">
                    <h2 className="text-[37px] font-semibold text-[#262321] font-poppins tracking-wide">
                        {locale === 'fr' ? 'VOUS POURRIEZ AUSSI AIMER' : 'YOU MAY ALSO LIKE'}
                    </h2>
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
                    {relatedProducts.map((product, index) => {
                        // Add debug logging for each product
                        console.log('🔍 YouMayAlsoLike Product:', {
                            title: product.title,
                            id: product.id,
                            variants: product.variants?.nodes?.length || 0,
                            firstVariant: product.variants?.nodes?.[0],
                            tags: product.tags || [],
                            hasSoldOutTag: product.tags?.includes('sold-out') || false
                        });

                        if (!product || !product.id) {
                            console.warn('⚠️ Skipping null/invalid product at index:', index);
                            return null;
                        }

                        return (
                            <div
                                key={product.id}
                                className="bg-white overflow-hidden hover:shadow-lg transition-shadow duration-300"
                            >
                                <ProductItem
                                    product={product}
                                    loading={index < 4 ? 'eager' : undefined}
                                    variant="collection"
                                />
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}