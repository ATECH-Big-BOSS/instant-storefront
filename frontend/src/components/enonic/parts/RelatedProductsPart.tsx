import { Suspense } from 'react';
import { PartProps } from '@enonic/nextjs-adapter';
import RelatedProducts from '@modules/products/components/related-products';
import SkeletonRelatedProducts from '@modules/skeletons/templates/skeleton-related-products';
import { getProductPartContext } from '@lib/enonic/product-part-context';

export default async function RelatedProductsPart({ common, meta }: PartProps) {
    const ctx = await getProductPartContext(common, meta);
    if (!ctx) return null;

    return (
        <div className="content-container my-16 small:my-32">
            <Suspense fallback={<SkeletonRelatedProducts />}>
                <RelatedProducts product={ctx.product} countryCode={ctx.countryCode} />
            </Suspense>
        </div>
    );
}
