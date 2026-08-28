import { Suspense } from 'react';
import { PartProps } from '@enonic/nextjs-adapter';
import ProductActions from '@modules/products/components/product-actions';
import ProductActionsWrapper from '@modules/products/templates/product-actions-wrapper';
import ProductOnboardingCta from '@modules/products/components/product-onboarding-cta';
import { getProductPartContext } from '@lib/enonic/product-part-context';
import { fetchPromotions, showOn } from '@lib/enonic/promotions';
import { listProducts } from '@lib/data/products';
import { CrossSellItem } from '@modules/products/templates';

export default async function ProductActionsPart({ common, meta }: PartProps) {
    const ctx = await getProductPartContext(common, meta);
    if (!ctx) return null;

    const { product, region, countryCode } = ctx;

    const promotions = await fetchPromotions(product.handle!);
    const showCrossSell =
        promotions.crossSellProducts.length > 0 && showOn(promotions.crossSellPlacement, 'pdp');

    const crossSellRaw = showCrossSell
        ? await Promise.all(
              promotions.crossSellProducts.map((h) =>
                  listProducts({ countryCode, queryParams: { handle: h } }).then(
                      (r) => r.response.products[0] ?? null,
                  ),
              ),
          )
        : [];

    const crossSellProducts: CrossSellItem[] = crossSellRaw
        .filter((p): p is NonNullable<typeof p> => p !== null)
        .map((p) => ({
            id: p.id!,
            title: p.title!,
            thumbnail: p.thumbnail ?? null,
            handle: p.handle!,
        }));

    return (
        <div className="content-container flex flex-col w-full gap-y-12 py-8">
            <ProductOnboardingCta />
            <Suspense
                fallback={<ProductActions disabled={true} product={product} region={region} />}
            >
                <ProductActionsWrapper id={product.id} region={region} crossSellProducts={crossSellProducts} />
            </Suspense>
        </div>
    );
}
