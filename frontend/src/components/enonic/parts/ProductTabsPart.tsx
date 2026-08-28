import { PartProps } from '@enonic/nextjs-adapter';
import ProductTabs from '@modules/products/components/product-tabs';
import { getProductPartContext } from '@lib/enonic/product-part-context';

export default async function ProductTabsPart({ common, meta }: PartProps) {
    const ctx = await getProductPartContext(common, meta);
    if (!ctx) return null;

    return (
        <div className="content-container w-full py-8">
            <ProductTabs product={ctx.product} />
        </div>
    );
}
