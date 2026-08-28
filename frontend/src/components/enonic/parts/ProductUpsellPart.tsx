import { PartProps } from '@enonic/nextjs-adapter';
import ProductPreview from '@modules/products/components/product-preview';
import { listProducts } from '@lib/data/products';
import { fetchPromotions, showOn } from '@lib/enonic/promotions';
import { getProductPartContext } from '@lib/enonic/product-part-context';

export default async function ProductUpsellPart({ common, meta }: PartProps) {
    const ctx = await getProductPartContext(common, meta);
    if (!ctx) return null;

    const { product, region, countryCode } = ctx;

    const promotions = await fetchPromotions(product.handle!);
    const showUpsell =
        promotions.upsellProducts.length > 0 && showOn(promotions.upsellPlacement, 'pdp');
    if (!showUpsell) return null;

    const upsellData = (
        await Promise.all(
            promotions.upsellProducts.map((h) =>
                listProducts({ countryCode, queryParams: { handle: h } }).then(
                    (r) => r.response.products[0] ?? null,
                ),
            ),
        )
    ).filter((p): p is NonNullable<typeof p> => p !== null);

    if (upsellData.length === 0) return null;

    return (
        <section className="content-container py-12 border-t border-ui-border-base">
            <h2 className="text-2xl-semi mb-8">You might also like</h2>
            <ul className="grid grid-cols-2 small:grid-cols-4 gap-x-6 gap-y-8">
                {upsellData.map((p) => (
                    <li key={p.id}>
                        <ProductPreview product={p} region={region} />
                    </li>
                ))}
            </ul>
        </section>
    );
}
